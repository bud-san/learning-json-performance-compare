import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import type { FilterParams } from "@/@types/filter-params";
import type { MtRecord } from "@/@types/mt-record";
import type { PerfMetrics } from "@/@types/perf-metrics";
import { INITIAL_PERF_METRICS } from "@/@types/perf-metrics";
import { DebugPanel } from "@/components/cmn/DebugPanel";
import { FilterForm } from "@/components/cmn/FilterForm";
import { NavLinks } from "@/components/cmn/NavLinks";
import { Pagination } from "@/components/cmn/Pagination";
import { RecordItem } from "@/components/cmn/RecordItem";
import { DEBUG_PANEL_HEIGHT_PX } from "@/utils/layout-constants";
import { PAGE_SIZE, paginate } from "@/utils/pagination";
import { useLongTaskAndCls } from "@/utils/perf/useLongTaskAndCls";
import { sortRecordsByDateDesc } from "@/utils/sortRecords";
import {
  navigateToFilterParams,
  readParamsFromLocationOrDefault,
} from "@/utils/url-params";
import { withBase } from "@/utils/with-base";
import { applyFiltersSerial } from "./applyFiltersSerial";
import { RecordList } from "./RecordList";
import { RecordThumbnail } from "./RecordThumbnail";

const DATA_URL = withBase("mock-mt-data/mt-export.json");

// 表示のたびにmoment()でisValid()を確認してからformat()する
// （ネイティブのIntl.DateTimeFormatより重いが、素朴な実装を再現している）。
function formatDateWithMoment(isoDate: string): string {
  const m = moment(isoDate);
  if (!m.isValid()) return "";
  return moment(isoDate).format("YYYY/MM/DD");
}

// Before: クライアント内で巨大JSONを直接fetchし、そのままメインスレッドでJSON.parseして
// 全件を配列として保持する素朴な実装。フィルタ・ページネーションも毎回メインスレッドで実行する。
export function BeforeApp() {
  const [allRecords, setAllRecords] = useState<MtRecord[] | null>(null);
  // フルリロードで遷移する設計のため、paramsはマウント時のURLで一度決まれば変わらない。
  const [params] = useState<FilterParams>(() =>
    readParamsFromLocationOrDefault(),
  );
  const [timings, setTimings] = useState<{
    fetchMs: number | null;
    parseMs: number | null;
  }>({
    fetchMs: null,
    parseMs: null,
  });
  const [firstRenderMs, setFirstRenderMs] = useState<number | null>(null);
  const longTaskAndCls = useLongTaskAndCls();

  useEffect(() => {
    const mountedAt = performance.now();
    let cancelled = false;

    async function load() {
      const fetchStart = performance.now();
      const res = await fetch(DATA_URL);
      const text = await res.text();
      const fetchMs = performance.now() - fetchStart;

      const parseStart = performance.now();
      const records = JSON.parse(text) as MtRecord[];
      const parseMs = performance.now() - parseStart;

      if (cancelled) return;
      setTimings({ fetchMs, parseMs });
      setAllRecords(records);
      setFirstRenderMs(performance.now() - mountedAt);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // フィルタ・ページネーション変更は通常のページ遷移として扱う（フルページ遷移型サイトと
  // 同じ遷移方式にし、アクセス解析の自動ページビュー計測に自然に乗せるため、SPA的な差し替えはしない）。
  function updateParams(next: FilterParams) {
    navigateToFilterParams(next);
  }

  // 件数表示用・一覧表示用の2つの独立したgetterが、それぞれ同じフィルタ処理を
  // 再実行してしまう素朴な構造を再現し、件数取得と一覧取得で同じフィルタ処理をあえて2回走らせている。
  const searchCount = useMemo(() => {
    if (allRecords === null) return 0;
    return applyFiltersSerial(allRecords, params).length;
  }, [allRecords, params]);

  const { items, totalPages, page } = useMemo(() => {
    if (allRecords === null) {
      return { items: [] as MtRecord[], totalPages: 1, page: 1, total: 0 };
    }
    const filtered = applyFiltersSerial(allRecords, params);
    const sorted = sortRecordsByDateDesc(filtered);
    return paginate(sorted, params.page, PAGE_SIZE);
  }, [allRecords, params]);

  const metrics: PerfMetrics = {
    ...INITIAL_PERF_METRICS,
    fetchMs: timings.fetchMs,
    parseMs: timings.parseMs,
    firstRenderMs,
    longTaskCount: longTaskAndCls.longTaskCount,
    longTaskTotalMs: longTaskAndCls.longTaskTotalMs,
    cls: longTaskAndCls.cls,
  };

  return (
    <div
      className="mx-auto max-w-3xl px-4 pt-8"
      style={{ paddingBottom: `${DEBUG_PANEL_HEIGHT_PX}px` }}
    >
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Before: 未対策版</h1>
        <NavLinks current="before" />
      </div>

      <div className="mb-4">
        <FilterForm value={params} onChange={updateParams} />
      </div>

      {allRecords === null ? (
        <p className="py-8 text-center text-sm text-slate-500">Loading...</p>
      ) : (
        <>
          <p className="mb-2 text-sm text-slate-600">
            検索結果 {searchCount}件
          </p>
          <RecordList
            items={items}
            renderItem={(record) => (
              <RecordItem
                key={record.id}
                record={record}
                formatDate={formatDateWithMoment}
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
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => updateParams({ ...params, page: p })}
          />
        </>
      )}

      <DebugPanel metrics={metrics} />
    </div>
  );
}
