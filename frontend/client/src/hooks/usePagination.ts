import { useEffect, useMemo, useState } from "react";

export function usePagination<T>(items: T[], pageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [currentPage, items, pageSize]);

  const startIndex = items.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = items.length === 0 ? 0 : Math.min(currentPage * pageSize, items.length);

  return {
    currentPage,
    totalPages,
    totalItems: items.length,
    startIndex,
    endIndex,
    paginatedItems,
    canPreviousPage: currentPage > 1,
    canNextPage: currentPage < totalPages,
    setPage: setCurrentPage,
    nextPage: () => setCurrentPage((page) => Math.min(page + 1, totalPages)),
    previousPage: () => setCurrentPage((page) => Math.max(page - 1, 1)),
  };
}
