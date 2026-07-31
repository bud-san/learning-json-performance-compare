import type { ReactNode } from "react";
import type { MtRecord } from "@/@types/mt-record";
import { EmptyState } from "@/components/cmn/EmptyState";
import { LIST_MIN_HEIGHT_PX } from "@/utils/layout-constants";

interface RecordListProps {
  items: MtRecord[];
  isStale: boolean;
  renderItem: (record: MtRecord) => ReactNode;
}

// After: 固定min-heightを持つコンテナ。フィルタ変更中は直前の結果を
// opacityで薄く表示し続け（コンテナサイズは不変）、結果到着後に中身だけ差し替える。
// ただし0件時は縦長の空白を避けるため、あえてmin-heightを解除する
// （0件⇄件数ありの切り替わり時にのみレイアウトシフトが発生するのは許容する）。
export function RecordList({ items, isStale, renderItem }: RecordListProps) {
  const isEmpty = items.length === 0;
  return (
    <div
      style={isEmpty ? undefined : { minHeight: `${LIST_MIN_HEIGHT_PX}px` }}
      className={`motion-safe:transition-opacity motion-safe:duration-150 ${isStale ? "opacity-50" : "opacity-100"}`}
      aria-busy={isStale}
    >
      {isEmpty ? (
        <EmptyState />
      ) : (
        <div>{items.map((record) => renderItem(record))}</div>
      )}
    </div>
  );
}
