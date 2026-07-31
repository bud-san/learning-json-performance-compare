import {
  LIST_MIN_HEIGHT_PX,
  PAGE_SIZE_FOR_LAYOUT,
  RECORD_ITEM_HEIGHT_PX,
} from "@/utils/layout-constants";

// After専用: 実データと同じ寸法(RECORD_ITEM_HEIGHT_PX)のグレーブロックをanimate-pulseさせる。
// 外部ライブラリは使わずTailwind標準ユーティリティのみで実現する。
// 件数表示（「検索結果 ◯件」）の行も同じ高さでスケルトン化し、データ到着前後で高さが変わらないようにする。
export function SkeletonList() {
  return (
    <div aria-hidden="true">
      <div className="mb-2 h-5 w-32 animate-pulse rounded bg-slate-200" />
      <div style={{ minHeight: `${LIST_MIN_HEIGHT_PX}px` }}>
        {Array.from({ length: PAGE_SIZE_FOR_LAYOUT }).map((_, i) => (
          <div
            key={`skeleton-${
              // biome-ignore lint/suspicious/noArrayIndexKey: 固定件数のスケルトンでitemの入れ替えが発生しないため許容
              i
            }`}
            className="flex animate-pulse gap-4 border-b border-slate-200 py-4"
            style={{ height: `${RECORD_ITEM_HEIGHT_PX}px` }}
          >
            <div className="h-full w-32 shrink-0 rounded bg-slate-200" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="h-4 w-3/4 rounded bg-slate-200" />
              <div className="h-3 w-full rounded bg-slate-200" />
              <div className="h-3 w-1/2 rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
