import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FilterParams } from "@/@types/filter-params";
import type { MtRecord } from "@/@types/mt-record";
import type { PerfMetrics } from "@/@types/perf-metrics";
import { INITIAL_PERF_METRICS } from "@/@types/perf-metrics";
import type {
  WorkerFilterRequest,
  WorkerInitRequest,
  WorkerResponse,
} from "@/@types/worker-protocol";
import { DebugPanel } from "@/components/cmn/DebugPanel";
import { FilterForm } from "@/components/cmn/FilterForm";
import { NavLinks } from "@/components/cmn/NavLinks";
import { Pagination } from "@/components/cmn/Pagination";
import { RecordItem } from "@/components/cmn/RecordItem";
import { DEBUG_PANEL_HEIGHT_PX } from "@/utils/layout-constants";
import { useLongTaskAndCls } from "@/utils/perf/useLongTaskAndCls";
import {
  navigateToFilterParams,
  readParamsFromLocationOrDefault,
} from "@/utils/url-params";
import { withBase } from "@/utils/with-base";
import MtDataWorker from "@/workers/mt-data.worker?worker";
import { RecordList } from "./RecordList";
import { RecordThumbnail } from "./RecordThumbnail";
import { SkeletonList } from "./SkeletonList";

const DATA_URL = withBase("mock-mt-data/mt-export.json");

interface FilterResultState {
  items: MtRecord[];
  total: number;
  totalPages: number;
  page: number;
}

// After: fetch/parse/filterはすべてWeb Worker内で実行し、
// メインスレッドには表示用10件+総件数のみをpostMessageで受け取る。
export function AfterApp() {
  // フルリロードで遷移する設計のため、paramsはマウント時のURLで一度決まれば変わらない。
  const [params] = useState<FilterParams>(() =>
    readParamsFromLocationOrDefault(),
  );
  const [result, setResult] = useState<FilterResultState | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [timings, setTimings] = useState<{
    fetchMs: number | null;
    parseMs: number | null;
  }>({
    fetchMs: null,
    parseMs: null,
  });
  const [firstRenderMs, setFirstRenderMs] = useState<number | null>(null);
  const longTaskAndCls = useLongTaskAndCls();

  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const latestRequestIdRef = useRef(0);
  const mountedAtRef = useRef(0);
  const firstRenderRecordedRef = useRef(false);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const sendFilterRequest = useCallback((nextParams: FilterParams) => {
    const worker = workerRef.current;
    if (!worker) return;
    requestIdRef.current += 1;
    latestRequestIdRef.current = requestIdRef.current;
    const req: WorkerFilterRequest = {
      type: "filter",
      params: nextParams,
      requestId: requestIdRef.current,
    };
    worker.postMessage(req);
  }, []);

  useEffect(() => {
    mountedAtRef.current = performance.now();
    const worker = new MtDataWorker();
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const msg = event.data;

      if (msg.type === "init-progress") {
        if (msg.phase === "fetch-done") {
          setTimings((prev) => ({ ...prev, fetchMs: msg.elapsedMs }));
        }
        if (msg.phase === "parse-done") {
          setTimings((prev) => ({ ...prev, parseMs: msg.elapsedMs }));
          setIsReady(true);
          sendFilterRequest(paramsRef.current);
        }
        return;
      }

      if (msg.type === "filter-result") {
        if (msg.requestId !== latestRequestIdRef.current) return;
        setResult({
          items: msg.items,
          total: msg.total,
          totalPages: msg.totalPages,
          page: msg.page,
        });
        setIsStale(false);
        if (!firstRenderRecordedRef.current) {
          firstRenderRecordedRef.current = true;
          setFirstRenderMs(performance.now() - mountedAtRef.current);
        }
        return;
      }

      if (msg.type === "error") {
        console.error("Worker error:", msg.message);
      }
    };

    const initMsg: WorkerInitRequest = { type: "init", dataUrl: DATA_URL };
    worker.postMessage(initMsg);

    return () => {
      worker.terminate();
    };
  }, [sendFilterRequest]);

  useEffect(() => {
    if (!isReady) return;
    setIsStale(true);
    sendFilterRequest(params);
  }, [params, isReady, sendFilterRequest]);

  // フィルタ・ページネーション変更は通常のページ遷移として扱う
  // （アクセス解析の自動ページビュー計測に自然に乗せるため、SPA的な差し替えはしない）。
  function updateParams(next: FilterParams) {
    navigateToFilterParams(next);
  }

  const metrics: PerfMetrics = useMemo(
    () => ({
      ...INITIAL_PERF_METRICS,
      fetchMs: timings.fetchMs,
      parseMs: timings.parseMs,
      firstRenderMs,
      longTaskCount: longTaskAndCls.longTaskCount,
      longTaskTotalMs: longTaskAndCls.longTaskTotalMs,
      cls: longTaskAndCls.cls,
    }),
    [timings, firstRenderMs, longTaskAndCls],
  );

  return (
    <div
      className="mx-auto max-w-3xl px-4 pt-8"
      style={{
        paddingBottom: `${DEBUG_PANEL_HEIGHT_PX}px`,
      }}
    >
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">After: 対策版</h1>
        <NavLinks current="after" />
      </div>

      <div className="mb-4">
        <FilterForm value={params} onChange={updateParams} />
      </div>

      {result === null ? (
        <SkeletonList />
      ) : (
        <>
          <p
            className={`mb-2 text-sm text-slate-600 motion-safe:transition-opacity motion-safe:duration-150 ${isStale ? "opacity-50" : "opacity-100"}`}
          >
            検索結果 {result.total}件
          </p>
          <RecordList
            items={result.items}
            isStale={isStale}
            renderItem={(record) => (
              <RecordItem
                key={record.id}
                record={record}
                thumbnailSlot={
                  <RecordThumbnail
                    thumbnail={record.thumbnail}
                    alt={record.title}
                  />
                }
              />
            )}
          />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            onPageChange={(p) => updateParams({ ...params, page: p })}
          />
        </>
      )}

      <DebugPanel metrics={metrics} />
    </div>
  );
}
