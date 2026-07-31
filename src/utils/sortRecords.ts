import type { MtRecord } from "@/@types/mt-record";

// date（ISO 8601文字列）の降順で並び替える。文字列としての辞書順比較が
// そのまま日付の前後関係と一致するため、Dateオブジェクトの生成は不要。
export function sortRecordsByDateDesc(
  records: readonly MtRecord[],
): MtRecord[] {
  return [...records].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
  );
}
