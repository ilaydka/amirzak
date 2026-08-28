import Link from "next/link";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import ProductSearch from "@/components/ProductSearch";
import {
  moneyToNumber,
  optionalMoneyToNumber,
} from "@/lib/money";
import { prisma } from "@/lib/prisma";

const BOTANICS_CATEGORIES = [
  "İç Mekan Bitkileri",
  "Dış Mekan Bitkileri",
  "Çiçekli Bitkiler",
  "Sukulent & Kaktüs",
  "Orkideler",
  "Buket & Kesme Çiçek",
  "Saksı & Aksesuar",
  "Bitki Bakım Ürünleri",
];

type ProductsPageProps = {
  searchParams: Promise<{
    search?: string;
    brand?: string;
    category?: string;
    sort?: string;
    light?: string;
    care?: string;
    petSafe?: string;
    environment?: string;
  }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const {
    search,
    brand,
    category,
    sort,
    light,
    care,
    petSafe,
    environment,
  } = await searchParams;

  const normalizedSearch = search?.trim();

  const baseWhere = {
    isActive: true,
    approvalStatus: "APPROVED" as const,
  };

  const [brands, searchableProducts] =
    await Promise.all([
      prisma.product.findMany({
        where: baseWhere,
        select: {
          brand: true,
        },
        distinct: ["brand"],
        orderBy: {
          brand: "asc",
        },
      }),

      prisma.product.findMany({
        where: baseWhere,
        select: {
          id: true,
          name: true,
          brand: true,
          category: true,
          scientificName: true,
        },
        orderBy: {
          name: "asc",
        },
      }),
    ]);

  const orderBy =
    sort === "price-asc"
      ? { price: "asc" as const }
      : sort === "price-desc"
        ? { price: "desc" as const }
        : sort === "name-asc"
          ? { name: "asc" as const }
          : { createdAt: "desc" as const };

  const where = {
    ...baseWhere,

    ...(normalizedSearch
      ? {
          OR: [
            {
              name: {
                contains: normalizedSearch,
                mode: "insensitive" as const,
              },
            },
            {
              scientificName: {
                contains: normalizedSearch,
                mode: "insensitive" as const,
              },
            },
            {
              category: {
                contains: normalizedSearch,
                mode: "insensitive" as const,
              },
            },
            {
              brand: {
                contains: normalizedSearch,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: normalizedSearch,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),

    ...(brand
      ? {
          brand,
        }
      : {}),

    ...(category
      ? {
          category,
        }
      : {}),

    ...(light
      ? {
          lightRequirement: light,
        }
      : {}),

    ...(care
      ? {
          careLevel: care,
        }
      : {}),

    ...(petSafe === "true"
      ? {
          petSafe: true,
        }
      : {}),

    ...(environment
      ? {
          environment,
        }
      : {}),
  };

  const [products, totalProducts] =
    await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
      }),

      prisma.product.count({
        where,
      }),
    ]);

  const brandOptions = brands
    .map((item) => item.brand)
    .filter(
      (item): item is string => Boolean(item),
    );

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <section className="page-section page-content">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="display-title text-4xl text-text sm:text-5xl">
                Tüm Ürünler
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-text-soft">
                Bitkileri, çiçekleri ve bakım ürünlerini
                keşfedin. Yaşam alanınıza en uygun seçimi
                kolayca bulun.
              </p>
            </div>

            <div className="rounded-full border border-border bg-surface px-4 py-2 text-sm shadow-sm">
              <span className="font-semibold text-text">
                {totalProducts}
              </span>{" "}
              <span className="text-text-soft">
                ürün
              </span>
            </div>
          </div>

          <div className="mt-8">
            <ProductSearch
              brands={brandOptions}
              categories={BOTANICS_CATEGORIES}
              products={searchableProducts}
            />
          </div>

          <div className="mb-6 mt-8">
            <p className="text-sm text-text-soft">
              <span className="font-semibold text-text">
                {totalProducts}
              </span>{" "}
              ürün bulundu
            </p>
          </div>

          {products.length === 0 ? (
            <div className="flex min-h-[270px] flex-col items-center justify-center rounded-[28px] border border-border bg-surface px-6 py-12 text-center shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-pale text-brand">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
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

              <h2 className="mt-5 font-serif text-2xl font-semibold text-text">
                Ürün bulunamadı
              </h2>

              <p className="mx-auto mt-2 max-w-md text-center text-sm leading-6 text-text-soft">
                Seçtiğiniz özelliklere uygun ürün
                bulunamadı. Filtrelerden birini kaldırarak
                tekrar deneyebilirsiniz.
              </p>

              <Link
                href="/products"
                className="secondary-button mt-6 inline-flex items-center justify-center px-5 py-2.5 text-sm"
              >
                Tüm ürünleri göster
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  category={product.category}
                  price={moneyToNumber(
                    product.price,
                  )}
                  discountPrice={optionalMoneyToNumber(
                    product.discountPrice,
                  )}
                  imageUrl={product.imageUrl}
                  stock={product.stock}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}