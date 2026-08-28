"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useMemo,
  useState,
} from "react";

type SearchProduct = {
  id: number;
  name: string;
  category: string;
  brand: string | null;
  scientificName: string | null;
};

type HomeProductSearchProps = {
  products: SearchProduct[];
};

const categories = [
  "İç Mekan Bitkileri",
  "Dış Mekan Bitkileri",
  "Çiçekli Bitkiler",
  "Sukulent & Kaktüs",
  "Orkideler",
  "Buket & Kesme Çiçek",
  "Saksı & Aksesuar",
  "Bitki Bakım Ürünleri",
];

const searchTerms = [
  "Gül",
  "Lale",
  "Papatya",
  "Lavanta",
  "Menekşe",
  "Begonya",
  "Sardunya",
  "Ortanca",
  "Açelya",
  "Gardenya",
  "Yasemin",
  "Bonsai",
  "Monstera",
  "Orkide",
  "Sukulent",
  "Kaktüs",
  "Salon Bitkisi",
  "Ofis Bitkisi",
  "Balkon Bitkisi",
  "Saksı",
  "Toprak",
  "Bitki Besini",
  "Gübre",
];

function normalizeSearch(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i");
}

export default function HomeProductSearch({
  products,
}: HomeProductSearchProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);

  const termSuggestions = useMemo(() => {
    const query = normalizeSearch(search);

    if (!query) {
      return [];
    }

    return searchTerms
      .filter((term) =>
        normalizeSearch(term).includes(query),
      )
      .sort((a, b) => {
        const aName = normalizeSearch(a);
        const bName = normalizeSearch(b);

        const aStarts = aName.startsWith(query);
        const bStarts = bName.startsWith(query);

        if (aStarts && !bStarts) {
          return -1;
        }

        if (!aStarts && bStarts) {
          return 1;
        }

        return a.localeCompare(
          b,
          "tr-TR",
        );
      })
      .slice(0, 5);
  }, [search]);

  const categorySuggestions = useMemo(() => {
    const query = normalizeSearch(search);

    if (!query) {
      return [];
    }

    return categories
      .filter((category) =>
        normalizeSearch(category).includes(query),
      )
      .sort((a, b) => {
        const aName = normalizeSearch(a);
        const bName = normalizeSearch(b);

        const aStarts = aName.startsWith(query);
        const bStarts = bName.startsWith(query);

        if (aStarts && !bStarts) {
          return -1;
        }

        if (!aStarts && bStarts) {
          return 1;
        }

        return a.localeCompare(
          b,
          "tr-TR",
        );
      })
      .slice(0, 4);
  }, [search]);

  const productSuggestions = useMemo(() => {
    const query = normalizeSearch(search);

    if (!query) {
      return [];
    }

    return products
      .filter((product) => {
        const searchableValues = [
          product.name,
          product.scientificName ?? "",
          product.category,
          product.brand ?? "",
        ];

        return searchableValues.some((value) =>
          normalizeSearch(value).includes(query),
        );
      })
      .sort((a, b) => {
        const aName = normalizeSearch(a.name);
        const bName = normalizeSearch(b.name);

        const aStarts = aName.startsWith(query);
        const bStarts = bName.startsWith(query);

        if (aStarts && !bStarts) {
          return -1;
        }

        if (!aStarts && bStarts) {
          return 1;
        }

        return a.name.localeCompare(
          b.name,
          "tr-TR",
        );
      })
      .slice(0, 6);
  }, [search, products]);

  const hasSuggestions =
    termSuggestions.length > 0 ||
    categorySuggestions.length > 0 ||
    productSuggestions.length > 0;

  const showSuggestions =
    focused &&
    Boolean(search.trim()) &&
    hasSuggestions;

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const value = search.trim();

    if (!value) {
      return;
    }

    setFocused(false);

    router.push(
      `/products?search=${encodeURIComponent(value)}`,
    );
  }

  function openProduct(id: number) {
    setFocused(false);
    router.push(`/products/${id}`);
  }

  function openCategory(category: string) {
    setFocused(false);

    router.push(
      `/products?category=${encodeURIComponent(
        category,
      )}`,
    );
  }

  function openSearchTerm(term: string) {
    setFocused(false);

    router.push(
      `/products?search=${encodeURIComponent(
        term,
      )}`,
    );
  }

  return (
    <section className="relative z-20 bg-background px-6 pb-7 pt-4">
      {showSuggestions && (
        <button
          type="button"
          aria-label="Arama önerilerini kapat"
          onMouseDown={(event) =>
            event.preventDefault()
          }
          onClick={() => setFocused(false)}
          className="fixed inset-0 z-[80] cursor-default bg-[#152010]/10 backdrop-blur-[1.5px]"
        />
      )}

      <div className="relative z-[90] mx-auto max-w-7xl">
        <form
          onSubmit={handleSubmit}
          className="relative z-[100] mx-auto max-w-4xl"
        >
          <div
            className={
              showSuggestions
                ? "flex items-center rounded-full border border-[#e6e0d5] bg-[#fffdf8] p-1.5 shadow-[0_10px_28px_rgba(35,48,24,0.08)] transition"
                : "flex items-center rounded-full border border-[#e6e0d5] bg-[#fffdf8] p-1.5 shadow-sm transition"
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-4 h-5 w-5 shrink-0 text-text-muted"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>

            <input
              type="text"
              inputMode="search"
              role="searchbox"
              value={search}
              onFocus={() =>
                setFocused(true)
              }
              onBlur={() => {
                window.setTimeout(() => {
                  setFocused(false);
                }, 150);
              }}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              autoComplete="off"
              placeholder="Ne aramıştınız?"
              aria-label="Ürün ara"
              className="min-w-0 flex-1 appearance-none border-0 bg-transparent px-4 py-2.5 text-sm text-text shadow-none outline-none ring-0 placeholder:text-text-muted focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none"
              style={{
                WebkitAppearance: "none",
                outline: "none",
                boxShadow: "none",
              }}
            />

            <button
              type="submit"
              className="brand-button shrink-0 px-6 py-2.5 text-sm"
            >
              Ara
            </button>
          </div>

          {showSuggestions && (
            <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-[110] max-h-[430px] overflow-y-auto rounded-[20px] border border-[#ddd8cc] bg-[#fffdf8] shadow-[0_24px_65px_rgba(29,40,20,0.25)]">
              {termSuggestions.length > 0 && (
                <div>
                  <div className="sticky top-0 z-20 border-b border-border bg-[#f8f5ed] px-5 py-2.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                      Arama Önerileri
                    </p>
                  </div>

                  {termSuggestions.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onMouseDown={(event) =>
                        event.preventDefault()
                      }
                      onClick={() =>
                        openSearchTerm(term)
                      }
                      className="flex w-full items-center justify-between gap-4 border-b border-border bg-[#fffdf8] px-5 py-3 text-left transition hover:bg-brand-pale"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-pale text-brand">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <circle
                              cx="11"
                              cy="11"
                              r="7"
                            />
                            <path d="m20 20-4-4" />
                          </svg>
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text">
                            {term}
                          </p>

                          <p className="mt-0.5 text-xs text-text-muted">
                            Ara
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 text-brand-soft">
                        →
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {categorySuggestions.length > 0 && (
                <div>
                  <div className="border-b border-border bg-[#f8f5ed] px-5 py-2.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                      Kategoriler
                    </p>
                  </div>

                  {categorySuggestions.map(
                    (category) => (
                      <button
                        key={category}
                        type="button"
                        onMouseDown={(event) =>
                          event.preventDefault()
                        }
                        onClick={() =>
                          openCategory(category)
                        }
                        className="flex w-full items-center justify-between gap-4 border-b border-border bg-[#fffdf8] px-5 py-3 text-left transition hover:bg-brand-pale"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-text">
                            {category}
                          </p>

                          <p className="mt-0.5 text-xs text-text-muted">
                            Kategoriyi görüntüle
                          </p>
                        </div>

                        <span className="shrink-0 text-brand-soft">
                          →
                        </span>
                      </button>
                    ),
                  )}
                </div>
              )}

              {productSuggestions.length > 0 && (
                <div>
                  <div className="border-b border-border bg-[#f8f5ed] px-5 py-2.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                      Ürünler
                    </p>
                  </div>

                  {productSuggestions.map(
                    (product) => (
                      <button
                        key={product.id}
                        type="button"
                        onMouseDown={(event) =>
                          event.preventDefault()
                        }
                        onClick={() =>
                          openProduct(product.id)
                        }
                        className="flex w-full items-center justify-between gap-4 border-b border-border bg-[#fffdf8] px-5 py-3 text-left transition last:border-b-0 hover:bg-brand-pale"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text">
                            {product.name}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-text-muted">
                            {product.category}
                            {product.brand
                              ? ` · ${product.brand}`
                              : ""}
                          </p>
                        </div>

                        <span className="shrink-0 text-brand-soft">
                          →
                        </span>
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          )}
        </form>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-8">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/products?category=${encodeURIComponent(
                category,
              )}`}
              className="group flex h-[66px] items-center justify-center rounded-2xl border border-border bg-surface px-3 text-brand shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:bg-brand-pale hover:shadow-md"
            >
              <span className="text-center text-[13px] font-semibold leading-[17px]">
                {category}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}