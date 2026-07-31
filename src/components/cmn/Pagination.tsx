interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <nav
      className="flex items-center justify-center gap-3 py-4"
      aria-label="ページネーション"
    >
      <button
        type="button"
        className="rounded border border-slate-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        前へ
      </button>
      <span className="text-sm text-slate-600">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        className="rounded border border-slate-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        次へ
      </button>
    </nav>
  );
}
