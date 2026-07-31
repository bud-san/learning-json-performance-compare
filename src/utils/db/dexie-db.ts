import Dexie, { type Table } from "dexie";
import type { MtRecord } from "@/@types/mt-record";

// 容量圧迫や長期間放置されたキャッシュが残り続けるのを防ぐため、
// ETagが変わっていなくても保存から一定期間経過したキャッシュは無条件で無効化する。
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 1日

export interface MtDataCacheEntry {
  dataUrl: string;
  etag?: string;
  lastModified?: string;
  records: MtRecord[];
  savedAt: number;
}

class MtCompareDb extends Dexie {
  mtDataCache!: Table<MtDataCacheEntry, string>;

  constructor() {
    super("mt-compare-db");
    this.version(1).stores({
      mtDataCache: "dataUrl",
    });
  }
}

export const db = new MtCompareDb();

export async function getCachedData(
  dataUrl: string,
): Promise<MtDataCacheEntry | undefined> {
  const cached = await db.mtDataCache.get(dataUrl);
  if (cached === undefined) return undefined;

  const isExpired = Date.now() - cached.savedAt > CACHE_TTL_MS;
  if (isExpired) {
    // 容量圧迫・長期間放置対策として、期限切れのキャッシュは実体ごと削除する。
    await db.mtDataCache.delete(dataUrl);
    return undefined;
  }

  return cached;
}

export async function putCachedData(
  dataUrl: string,
  records: MtRecord[],
  meta: { etag?: string; lastModified?: string },
): Promise<void> {
  await db.mtDataCache.put({
    dataUrl,
    records,
    etag: meta.etag,
    lastModified: meta.lastModified,
    savedAt: Date.now(),
  });
}
