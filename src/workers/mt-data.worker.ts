/// <reference lib="webworker" />
import type { MtRecord } from "@/@types/mt-record";
import type { WorkerRequest, WorkerResponse } from "@/@types/worker-protocol";
import { getCachedData, putCachedData } from "@/utils/db/dexie-db";
import { applyFilters } from "@/utils/filters/applyFilters";
import { PAGE_SIZE, paginate } from "@/utils/pagination";
import { sortRecordsByDateDesc } from "@/utils/sortRecords";

let cache: MtRecord[] | null = null;

function post(msg: WorkerResponse): void {
  (self as unknown as DedicatedWorkerGlobalScope).postMessage(msg);
}

async function ensureData(dataUrl: string): Promise<MtRecord[]> {
  if (cache) return cache;

  const head = await fetch(dataUrl, { method: "HEAD" }).catch(() => null);
  const etag = head?.headers.get("ETag") ?? undefined;
  const lastModified = head?.headers.get("Last-Modified") ?? undefined;

  const cached = await getCachedData(dataUrl);
  const cacheHit =
    cached !== undefined &&
    ((etag !== undefined && cached.etag === etag) ||
      (etag === undefined &&
        lastModified !== undefined &&
        cached.lastModified === lastModified));

  if (cacheHit && cached) {
    cache = cached.records;
    post({
      type: "init-progress",
      phase: "parse-done",
      elapsedMs: 0,
    });
    return cache;
  }

  post({ type: "init-progress", phase: "fetch-start", elapsedMs: 0 });
  const fetchOnlyStart = performance.now();
  const res = await fetch(dataUrl);
  const text = await res.text();
  const fetchMs = performance.now() - fetchOnlyStart;
  post({
    type: "init-progress",
    phase: "fetch-done",
    elapsedMs: fetchMs,
  });

  const parseStart = performance.now();
  const records = JSON.parse(text) as MtRecord[];
  const parseMs = performance.now() - parseStart;
  post({
    type: "init-progress",
    phase: "parse-done",
    elapsedMs: parseMs,
  });

  cache = records;
  await putCachedData(dataUrl, records, { etag, lastModified });

  return records;
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const msg = event.data;
  try {
    if (msg.type === "init") {
      await ensureData(msg.dataUrl);
      return;
    }

    if (msg.type === "filter") {
      if (!cache) {
        post({
          type: "error",
          message: "Worker is not initialized. Send an init message first.",
        });
        return;
      }
      const filterStart = performance.now();
      const filtered = applyFilters(cache, msg.params);
      const sorted = sortRecordsByDateDesc(filtered);
      const page = paginate(sorted, msg.params.page, PAGE_SIZE);
      post({
        type: "filter-result",
        requestId: msg.requestId,
        items: page.items,
        total: page.total,
        totalPages: page.totalPages,
        page: page.page,
        timings: { filterMs: performance.now() - filterStart },
      });
    }
  } catch (err) {
    post({
      type: "error",
      message: err instanceof Error ? err.message : "unknown worker error",
    });
  }
};
