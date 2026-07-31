import type { Category, MtRecord, Tag } from "./mt-record";

export interface FilterParams {
  category: Category | null;
  tags: readonly Tag[];
  from: string | null;
  to: string | null;
  q: string;
  page: number;
}

export const DEFAULT_FILTER_PARAMS: FilterParams = {
  category: null,
  tags: [],
  from: null,
  to: null,
  q: "",
  page: 1,
};

export type FilterPredicate = (
  record: MtRecord,
  params: FilterParams,
) => boolean;
