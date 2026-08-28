"use client";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

type SearchProduct = {
  id: number;
  name: string;
  brand: string | null;
  category: string;
  scientificName: string | null;
};

type ProductSearchProps = {
  brands: string[];
  categories: string[];
  products: SearchProduct[];
};

type FilterKey =
  | "search"
  | "brand"
  | "category"
  | "sort"
  | "light"
  | "care"
  | "petSafe"
  | "environment";

type ActiveFilter = {
  key: FilterKey;
  label: string;
};

type DraftFilters = {
  category: string;
  brand: string;
  light: string;
  care: string;
  environment: string;
  petSafe: string;
};

const CARE_OPTIONS = [
  {
    value: "Kolay",
    label: "Kolay",
  },
  {
    value: "Orta",
    label: "Orta",
  },
  {
    value: "Zor",
    label: "Zor",
  },
];

const LIGHT_OPTIONS = [
  {
    value: "Düşük ışık",
    label: "Az Işık",
  },
  {
    value: "Orta ışık",
    label: "Orta Işık",
  },
  {
    value: "Parlak dolaylı ışık",
    label: "Parlak Dolaylı",
  },
  {
    value: "Doğrudan güneş",
    label: "Doğrudan Güneş",
  },
];

function FilterIcon({
  type,
}: {
  type:
  | "category"
  | "environment"
  | "care"
  | "light"
  | "pet"
  | "brand";
}) {
  const common = "h-5 w-5 shrink-0";

  if (type === "environment") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={common}
        aria-hidden="true"
      >
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  if (type === "care") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={common}
        aria-hidden="true"
      >
        <path d="M12 21V10" />
        <path d="M12 13c-3 0-5-1.8-5-4 3 0 5 1.8 5 4Z" />
        <path d="M12 17c3 0 5-1.8 5-4-3 0-5 1.8-5 4Z" />
        <path d="M7 21h10" />
      </svg>
    );
  }

  if (type === "light") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={common}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m4.9 4.9 1.4 1.4" />
        <path d="m17.7 17.7 1.4 1.4" />
        <path d="m19.1 4.9-1.4 1.4" />
        <path d="m6.3 17.7-1.4 1.4" />
      </svg>
    );
  }

  if (type === "pet") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={common}
        aria-hidden="true"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
      </svg>
    );
  }

  if (type === "brand") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={common}
        aria-hidden="true"
      >
        <path d="M20 13 13 20 4 11V4h7Z" />
        <circle cx="8.5" cy="8.5" r="1" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={common}
      aria-hidden="true"
    >
      <path d="M20.5 3.5C13.2 3.7 7.7 6.2 6.2 11.2C5.1 14.9 7.2 18.1 10.6 18.4C15.9 18.9 19.8 12.7 20.5 3.5Z" />
      <path d="M3.5 21C6.2 15.8 10.3 11.7 16.8 7.5" />
    </svg>
  );
}

export default function ProductSearch({
  brands,
  categories,
  products,
}: ProductSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedSearch =
    searchParams.get("search") ?? "";

  const selectedBrand =
    searchParams.get("brand") ?? "";

  const selectedCategory =
    searchParams.get("category") ?? "";

  const selectedSort =
    searchParams.get("sort") ?? "";

  const selectedLight =
    searchParams.get("light") ?? "";

  const selectedCare =
    searchParams.get("care") ?? "";

  const selectedPetSafe =
    searchParams.get("petSafe") ?? "";

  const selectedEnvironment =
    searchParams.get("environment") ?? "";

  const [search, setSearch] =
    useState(selectedSearch);

  const [searchFocused, setSearchFocused] =
    useState(false);

  const [filtersOpen, setFiltersOpen] =
    useState(false);

  const [draft, setDraft] =
    useState<DraftFilters>({
      category: selectedCategory,
      brand: selectedBrand,
      light: selectedLight,
      care: selectedCare,
      environment: selectedEnvironment,
      petSafe: selectedPetSafe,
    });

  useEffect(() => {
    setSearch(selectedSearch);
  }, [selectedSearch]);

  useEffect(() => {
    setDraft({
      category: selectedCategory,
      brand: selectedBrand,
      light: selectedLight,
      care: selectedCare,
      environment: selectedEnvironment,
      petSafe: selectedPetSafe,
    });
  }, [
    selectedCategory,
    selectedBrand,
    selectedLight,
    selectedCare,
    selectedEnvironment,
    selectedPetSafe,
  ]);

  function normalize(value: string) {
    return value
      .trim()
      .toLocaleLowerCase("tr-TR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ı/g, "i");
  }

  const suggestions = useMemo(() => {
    const query = normalize(search);

    if (!query) {
      return [];
    }

    return products
      .filter((product) => {
        const values = [
          product.name,
          product.scientificName ?? "",
          product.category,
          product.brand ?? "",
        ];

        return values.some((value) =>
          normalize(value).includes(query),
        );
      })
      .sort((a, b) => {
        const aName = normalize(a.name);
        const bName = normalize(b.name);

        const aStarts =
          aName.startsWith(query);

        const bStarts =
          bName.startsWith(query);

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

  function navigate(
    params: URLSearchParams,
  ) {
    params.delete("page");

    const query = params.toString();

    router.push(
      query
        ? `/products?${query}`
        : "/products",
    );
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const params = new URLSearchParams(
      searchParams.toString(),
    );

    const value = search.trim();

    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    setSearchFocused(false);
    navigate(params);
  }

  function updateSort(value: string) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    if (value) {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }

    navigate(params);
  }

  function setDraftValue(
    key: keyof DraftFilters,
    value: string,
  ) {
    setDraft((current) => ({
      ...current,
      [key]:
        current[key] === value
          ? ""
          : value,
    }));
  }

  function applyFilters() {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    const entries: [
      keyof DraftFilters,
      string,
    ][] = [
        ["category", draft.category],
        ["brand", draft.brand],
        ["light", draft.light],
        ["care", draft.care],
        [
          "environment",
          draft.environment,
        ],
        ["petSafe", draft.petSafe],
      ];

    for (const [key, value] of entries) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    navigate(params);
  }

  function clearDraft() {
    setDraft({
      category: "",
      brand: "",
      light: "",
      care: "",
      environment: "",
      petSafe: "",
    });
  }

  function clearAll() {
    setSearch("");

    setDraft({
      category: "",
      brand: "",
      light: "",
      care: "",
      environment: "",
      petSafe: "",
    });

    router.push("/products");
  }

  function clearFilter(key: FilterKey) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    params.delete(key);

    if (key === "search") {
      setSearch("");
    }

    navigate(params);
  }

  function openProduct(id: number) {
    setSearchFocused(false);
    router.push(`/products/${id}`);
  }

  const activeFilters: ActiveFilter[] = [];

  if (selectedSearch) {
    activeFilters.push({
      key: "search",
      label: selectedSearch,
    });
  }

  if (selectedCategory) {
    activeFilters.push({
      key: "category",
      label: selectedCategory,
    });
  }

  if (selectedBrand) {
    activeFilters.push({
      key: "brand",
      label: selectedBrand,
    });
  }

  if (selectedCare) {
    activeFilters.push({
      key: "care",
      label: selectedCare,
    });
  }

  if (selectedLight) {
    activeFilters.push({
      key: "light",
      label: selectedLight,
    });
  }

  if (selectedEnvironment) {
    activeFilters.push({
      key: "environment",
      label: selectedEnvironment,
    });
  }

  if (selectedPetSafe === "true") {
    activeFilters.push({
      key: "petSafe",
      label: "Evcil Hayvan Dostu",
    });
  }

  const filterCount =
    activeFilters.filter(
      (filter) =>
        filter.key !== "search",
    ).length;

  const draftSelections = [
    draft.category,
    draft.environment,
    draft.care,
    draft.light,
    draft.petSafe === "true"
      ? "Evcil Hayvan Dostu"
      : "",
    draft.brand,
  ].filter(Boolean);

  return (
    <div className="rounded-[26px] border border-[#ddd8cd] bg-[#fffdf9] p-5 shadow-[0_12px_35px_rgba(31,53,28,0.045)] sm:p-6">
      <form
        onSubmit={handleSubmit}
        className="relative"
      >
        <div className="flex items-center rounded-full border border-[#bdc2b8] bg-white p-1.5 transition focus-within:border-brand-soft">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center text-brand">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
          </div>

          <input
            type="text"
            inputMode="search"
            value={search}
            onFocus={() =>
              setSearchFocused(true)
            }
            onBlur={() => {
              window.setTimeout(() => {
                setSearchFocused(false);
              }, 150);
            }}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            autoComplete="off"
            placeholder="Bitki, çiçek veya bakım ürünü ara..."
            className="min-w-0 flex-1 appearance-none border-0 bg-transparent px-2 py-3 text-sm text-text outline-none ring-0 placeholder:text-text-muted focus:outline-none focus:ring-0 sm:text-base"
          />

          <button
            type="submit"
            className="brand-button min-h-[44px] shrink-0 px-8 text-sm"
          >
            Ara
          </button>
        </div>

        {searchFocused &&
          search.trim() &&
          suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-[18px] border border-border bg-white shadow-lg">
              {suggestions.map(
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
                    className="flex w-full items-center justify-between gap-4 border-b border-border px-5 py-3 text-left last:border-b-0 hover:bg-brand-pale"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text">
                        {product.name}
                      </p>

                      <p className="mt-1 truncate text-xs text-text-muted">
                        {product.category}
                      </p>
                    </div>

                    <span className="text-brand">
                      →
                    </span>
                  </button>
                ),
              )}
            </div>
          )}
      </form>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setFiltersOpen(
                (current) => !current,
              )
            }
            className="inline-flex min-h-[44px] items-center gap-3 rounded-[12px] bg-brand px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-hover"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M4 7h16" />
              <path d="M7 12h10" />
              <path d="M10 17h4" />
            </svg>

            Filtrele

            {filterCount > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-brand">
                {filterCount}
              </span>
            )}

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-4 w-4 transition-transform ${filtersOpen
                ? "rotate-180"
                : ""
                }`}
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {activeFilters
            .filter(
              (filter) =>
                filter.key !== "search",
            )
            .map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() =>
                  clearFilter(filter.key)
                }
                className="inline-flex items-center gap-2 rounded-full bg-brand-pale px-4 py-2 text-sm font-medium text-brand"
              >
                {filter.label}
                <span>×</span>
              </button>
            ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-text">
            Sırala:
          </span>

          <select
            value={selectedSort}
            onChange={(event) =>
              updateSort(event.target.value)
            }
            className="min-h-[44px] min-w-[190px] rounded-[10px] border border-border bg-white px-4 text-sm text-text outline-none"
          >
            <option value="">En Yeni</option>

            <option value="price-asc">
              Fiyat: Düşükten Yükseğe
            </option>

            <option value="price-desc">
              Fiyat: Yüksekten Düşüğe
            </option>

            <option value="name-asc">
              Ürün Adı: A → Z
            </option>
          </select>
        </div>
      </div>

      {filtersOpen && (
        <div className="mt-6 border-t border-border pt-6">
          <div className="mb-5 flex justify-end">
            <button
              type="button"
              onClick={clearDraft}
              className="text-sm font-semibold text-brand underline underline-offset-4"
            >
              Temizle
            </button>
          </div>

          <div className="grid gap-x-12 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <div className="mb-3 flex items-center gap-2 font-semibold text-text">
                <span className="text-brand">
                  <FilterIcon type="category" />
                </span>
                Kategori
              </div>

              <select
                value={draft.category}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    category:
                      event.target.value,
                  }))
                }
                className="field min-h-[46px] rounded-[10px] px-4 text-sm"
              >
                <option value="">
                  Tüm Kategoriler
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 font-semibold text-text">
                <span className="text-brand">
                  <FilterIcon type="environment" />
                </span>
                Kullanım Alanı
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  "İç Mekan",
                  "Dış Mekan",
                ].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setDraftValue(
                        "environment",
                        option,
                      )
                    }
                    className={`rounded-[12px] border px-5 py-2.5 text-sm transition ${draft.environment ===
                      option
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-white text-text-soft"
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 font-semibold text-text">
                <span className="text-brand">
                  <FilterIcon type="care" />
                </span>
                Bakım Seviyesi
              </div>

              <div className="flex flex-wrap gap-2">
                {CARE_OPTIONS.map(
                  (option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setDraftValue(
                          "care",
                          option.value,
                        )
                      }
                      className={`rounded-[12px] border px-5 py-2.5 text-sm transition ${draft.care ===
                        option.value
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-white text-text-soft"
                        }`}
                    >
                      {option.label}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 font-semibold text-text">
                <span className="text-brand">
                  <FilterIcon type="light" />
                </span>
                Işık İhtiyacı
              </div>

              <div className="flex flex-wrap gap-2">
                {LIGHT_OPTIONS.map(
                  (option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setDraftValue(
                          "light",
                          option.value,
                        )
                      }
                      className={`rounded-[12px] border px-5 py-2.5 text-sm transition ${draft.light ===
                        option.value
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-white text-text-soft"
                        }`}
                    >
                      {option.label}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 font-semibold text-text">
                <span className="text-brand">
                  <FilterIcon type="pet" />
                </span>
                Ev Yaşamı
              </div>

              <button
                type="button"
                onClick={() =>
                  setDraftValue(
                    "petSafe",
                    "true",
                  )
                }
                className={`inline-flex items-center gap-2 rounded-[12px] border px-5 py-2.5 text-sm font-medium transition ${draft.petSafe === "true"
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-white text-text-soft"
                  }`}
              >
                <FilterIcon type="pet" />
                Evcil Hayvan Dostu
              </button>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 font-semibold text-text">
                <span className="text-brand">
                  <FilterIcon type="brand" />
                </span>
                Marka / Üretici
              </div>

              <select
                value={draft.brand}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    brand:
                      event.target.value,
                  }))
                }
                className="field min-h-[46px] rounded-[10px] px-4 text-sm"
              >
                <option value="">
                  Tüm Markalar
                </option>

                {brands.map((brand) => (
                  <option
                    key={brand}
                    value={brand}
                  >
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-5 border-t border-border pt-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-text">
                Seçimler
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {draftSelections.length >
                  0 ? (
                  draftSelections.map(
                    (selection) => (
                      <span
                        key={selection}
                        className="rounded-full bg-brand-pale px-4 py-2 text-sm text-brand"
                      >
                        {selection}
                      </span>
                    ),
                  )
                ) : (
                  <span className="text-sm text-text-muted">
                    Henüz filtre seçilmedi.
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={applyFilters}
              className="brand-button min-h-[46px] shrink-0 rounded-[10px] px-6 text-sm"
            >
              ✓ Filtreleri Uygula
            </button>
          </div>
        </div>
      )}
    </div>
  );
}