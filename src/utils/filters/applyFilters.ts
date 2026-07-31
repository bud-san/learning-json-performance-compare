import type { FilterParams } from "@/@types/filter-params";
import type { MtRecord } from "@/@types/mt-record";
import { ALL_PREDICATES } from "./predicates";

export function applyFilters(
  records: readonly MtRecord[],
  params: FilterParams,
): MtRecord[] {
  return records.filter((record) =>
    ALL_PREDICATES.every((predicate) => predicate(record, params)),
  );
}
