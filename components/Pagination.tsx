"use client";

import { useRouter, useSearchParams } from "next/navigation";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
};

export default function Pagination({
  currentPage,
  totalPages,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams);

    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }

    const query = params.toString();

    router.push(query ? `/products?${query}` : "/products");
  }

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="secondary-button min-h-10 px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Önceki
      </button>

      <span className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-text-soft shadow-sm">
        Sayfa {currentPage} / {totalPages}
      </span>

      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="secondary-button min-h-10 px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        Sonraki →
      </button>
    </div>
  );
}