export const PAGE_SIZE = 10;

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export function paginate<T>(
  records: readonly T[],
  page: number,
  pageSize: number = PAGE_SIZE,
): PaginationResult<T> {
  const total = records.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: records.slice(start, start + pageSize),
    total,
    page: safePage,
    totalPages,
  };
}
