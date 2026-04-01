type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  canPreviousPage: boolean;
  canNextPage: boolean;
  className?: string;
};

function cx(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function PaginationControls({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  itemLabel,
  onPageChange,
  onPrevious,
  onNext,
  canPreviousPage,
  canNextPage,
  className,
}: PaginationControlsProps) {
  const pageWindow = 5;
  const halfWindow = Math.floor(pageWindow / 2);
  const startPage = Math.max(1, currentPage - halfWindow);
  const endPage = Math.min(totalPages, startPage + pageWindow - 1);
  const visibleStartPage = Math.max(1, endPage - pageWindow + 1);
  const pageNumbers = Array.from(
    { length: Math.max(0, endPage - visibleStartPage + 1) },
    (_, index) => visibleStartPage + index
  );

  return (
    <div
      className={cx(
        "flex flex-col gap-3 border-t border-gray-100 px-6 py-3 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        Showing {startIndex}-{endIndex} of {totalItems} {itemLabel}
        <span>Page {totalPages === 0 ? 0 : currentPage} of {totalPages}</span>
      </div>

      {totalItems > 0 && (
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={onPrevious}
            disabled={!canPreviousPage}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {visibleStartPage > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => onPageChange(1)}
                  className="h-8 min-w-8 rounded-lg px-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  1
                </button>
                {visibleStartPage > 2 && <span className="px-1">...</span>}
              </>
            )}

            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => onPageChange(pageNumber)}
                className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition ${
                  pageNumber === currentPage
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
              >
                {pageNumber}
              </button>
            ))}

            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && <span className="px-1">...</span>}
                <button
                  type="button"
                  onClick={() => onPageChange(totalPages)}
                  className="h-8 min-w-8 rounded-lg px-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onNext}
            disabled={!canNextPage}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
