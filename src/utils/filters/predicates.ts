import type { FilterPredicate } from "@/@types/filter-params";

export const byCategory: FilterPredicate = (record, params) =>
  params.category === null || record.category === params.category;

export const byTags: FilterPredicate = (record, params) =>
  params.tags.every((tag) => record.tags.includes(tag));

export const byDateFrom: FilterPredicate = (record, params) =>
  params.from === null || record.date >= params.from;

export const byDateTo: FilterPredicate = (record, params) =>
  params.to === null || record.date <= params.to;

export const byTitleQuery: FilterPredicate = (record, params) => {
  const q = params.q.trim().toLowerCase();
  return q === "" || record.title.toLowerCase().includes(q);
};

// 条件を増やす場合はここに1関数追加し、この配列に足すだけでよい
export const ALL_PREDICATES: readonly FilterPredicate[] = [
  byCategory,
  byTags,
  byDateFrom,
  byDateTo,
  byTitleQuery,
];
