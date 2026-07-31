import type { ReactNode } from "react";
import type { MtRecord } from "@/@types/mt-record";

interface RecordItemProps {
  record: MtRecord;
  thumbnailSlot: ReactNode;
  // 日付表示の整形方法をBefore/Afterで差し替えられるようにする
  // （Beforeはmoment.js経由、Afterはネイティブの Intl.DateTimeFormat を既定で使う）。
  formatDate?: (isoDate: string) => string;
}

const defaultDateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function defaultFormatDate(isoDate: string): string {
  return defaultDateFormatter.format(new Date(isoDate));
}

export function RecordItem({
  record,
  thumbnailSlot,
  formatDate = defaultFormatDate,
}: RecordItemProps) {
  return (
    <article className="flex gap-4 border-b border-slate-200 py-4">
      <div className="w-32 shrink-0">{thumbnailSlot}</div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded bg-slate-200 px-2 py-0.5 font-medium">
            {record.category}
          </span>
          <time dateTime={record.date}>{formatDate(record.date)}</time>
        </div>
        <h3 className="mt-1 truncate text-base font-semibold text-slate-900">
          {record.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
          {record.body}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {record.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
