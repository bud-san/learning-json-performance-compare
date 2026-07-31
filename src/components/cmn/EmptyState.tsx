// 0件時はBefore版と同程度の軽量表示にする（縦長の空白を避けるため、
// あえてLIST_MIN_HEIGHT_PXは使わない。この分岐に限りCLS対策はやむなく諦める）。
export function EmptyState() {
  return (
    <p className="py-8 text-center text-sm text-slate-500">
      条件に一致する記事が見つかりませんでした。
    </p>
  );
}
