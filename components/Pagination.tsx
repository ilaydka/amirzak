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
    <div className="mt-10 flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold transition hover:border-red-500 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Önceki
      </button>

      <span className="text-sm text-zinc-400">
        Sayfa {currentPage} / {totalPages}
      </span>

      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold transition hover:border-red-500 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Sonraki →
      </button>
    </div>
  );
}