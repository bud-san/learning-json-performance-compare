import moment from "moment";
import type { FilterParams } from "@/@types/filter-params";
import type { MtRecord } from "@/@types/mt-record";

// Before専用: 素朴に書くとありがちな、条件ごとにfilterdataを再代入していく直列適用の構造。
// 条件が増えるほど配列全体への走査回数が増える。
// After版・共通の`applyFilters`（predicatesをeveryで1回に合成する設計）とはあえて別実装にしている。
export function applyFiltersSerial(
  records: readonly MtRecord[],
  params: FilterParams,
): readonly MtRecord[] {
  let filterdata: readonly MtRecord[] = records;

  // カテゴリ ----------------------------------------
  if (params.category) {
    filterdata = filterdata.filter((o) => {
      return o.category === params.category;
    });
  }

  // タグ（複数選択、AND条件） ----------------------------------------
  if (params.tags.length > 0) {
    filterdata = filterdata.filter((o) => {
      let tagCounts = 0;
      for (let i = 0; i < params.tags.length; i++) {
        if (o.tags.includes(params.tags[i])) {
          tagCounts += 1;
        }
      }
      return tagCounts === params.tags.length;
    });
  }

  // 開始日 ----------------------------------------
  // 要素ごとにmoment()でオブジェクトを生成してから比較する
  // （o.dateをそのまま文字列比較するより重いが、素朴な実装を再現している）。
  if (params.from) {
    const from = moment(params.from);
    filterdata = filterdata.filter((o) => {
      const recordDate = moment(o.date);
      if (!recordDate.isValid()) return false;
      return recordDate.isSameOrAfter(from);
    });
  }

  // 終了日 ----------------------------------------
  if (params.to) {
    const to = moment(params.to);
    filterdata = filterdata.filter((o) => {
      const recordDate = moment(o.date);
      if (!recordDate.isValid()) return false;
      return recordDate.isSameOrBefore(to);
    });
  }

  // キーワード ----------------------------------------
  if (params.q.trim() !== "") {
    filterdata = filterdata.filter((o) => {
      const keyword = `${o.title},${o.body}`;
      return (
        keyword.toLowerCase().indexOf(params.q.trim().toLowerCase()) !== -1
      );
    });
  }

  return filterdata;
}
