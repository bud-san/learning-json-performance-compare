import type { ReactNode } from "react";
import type { MtRecord } from "@/@types/mt-record";

interface RecordListProps {
  items: MtRecord[];
  renderItem: (record: MtRecord) => ReactNode;
}

// Before: min-heightを指定しない素朴なコンテナ。
// 中身の量や画像サイズ確定タイミングに応じて自然に伸縮し、
// 後続要素（ページネーション・デバッグパネル等）を押し下げるレイアウトシフトがそのまま発生する。
export function RecordList({ items, renderItem }: RecordListProps) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        条件に一致する記事が見つかりませんでした。
      </p>
    );
  }

  return <div>{items.map((record) => renderItem(record))}</div>;
}
