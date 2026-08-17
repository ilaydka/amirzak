"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type ProductSearchProps = {
  brands: string[];
  categories: string[];
};

export default function ProductSearch({
  brands,
  categories,
}: ProductSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(
    searchParams.get("search") ?? "",
  );

  const selectedBrand = searchParams.get("brand") ?? "";
  const selectedCategory = searchParams.get("category") ?? "";
  const selectedSort = searchParams.get("sort") ?? "";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams(searchParams);

    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }

    router.push(`/products?${params.toString()}`);
  }

  function handleBrandChange(brand: string) {
    const params = new URLSearchParams(searchParams);

    if (brand) {
      params.set("brand", brand);
    } else {
      params.delete("brand");
    }

    router.push(`/products?${params.toString()}`);
  }

  function handleCategoryChange(category: string) {
    const params = new URLSearchParams(searchParams);

    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }

    router.push(`/products?${params.toString()}`);
  }

  function handleSortChange(sort: string) {
    const params = new URLSearchParams(searchParams);

    if (sort) {
      params.set("sort", sort);
    } else {
      params.delete("sort");
    }

    router.push(`/products?${params.toString()}`);
  }

  function handleClearFilters() {
    setSearch("");
    router.push("/products");
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <form onSubmit={handleSubmit}>
        <label
          htmlFor="product-search"
          className="mb-3 block text-sm font-semibold text-zinc-300"
        >
          Ürün Ara
        </label>

        <div className="flex gap-3">
          <input
            id="product-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ürün adı yaz..."
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-white outline-none focus:border-red-500"
          />

          <button
            type="submit"
            className="rounded-xl bg-red-600 px-6 py-4 font-semibold text-white transition hover:bg-red-500"
          >
            Ara
          </button>
        </div>
      </form>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div>
          <label
            htmlFor="brand-filter"
            className="mb-3 block text-sm font-semibold text-zinc-300"
          >
            Marka
          </label>

          <select
            id="brand-filter"
            value={selectedBrand}
            onChange={(event) =>
              handleBrandChange(event.target.value)
            }
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-white outline-none focus:border-red-500"
          >
            <option value="">Tüm Markalar</option>

            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="category-filter"
            className="mb-3 block text-sm font-semibold text-zinc-300"
          >
            Kategori
          </label>

          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(event) =>
              handleCategoryChange(event.target.value)
            }
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-white outline-none focus:border-red-500"
          >
            <option value="">Tüm Kategoriler</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="sort-filter"
            className="mb-3 block text-sm font-semibold text-zinc-300"
          >
            Sıralama
          </label>

          <select
            id="sort-filter"
            value={selectedSort}
            onChange={(event) =>
              handleSortChange(event.target.value)
            }
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-white outline-none focus:border-red-500"
          >
            <option value="">En Yeni</option>
            <option value="price-asc">En Ucuz</option>
            <option value="price-desc">En Pahalı</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleClearFilters}
          className="rounded-lg border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-red-500 hover:text-red-400"
        >
          Filtreleri Temizle
        </button>
      </div>
    </div>
  );
}