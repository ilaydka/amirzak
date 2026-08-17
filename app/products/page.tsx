import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import ProductSearch from "@/components/ProductSearch";
import { prisma } from "@/lib/prisma";

type ProductsPageProps = {
  searchParams: Promise<{
    search?: string;
    brand?: string;
    category?: string;
    sort?: string;
    page?: string;
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
    page,
  } = await searchParams;

  const currentPage = Math.max(Number(page) || 1, 1);
  const pageSize = 6;
  const skip = (currentPage - 1) * pageSize;

  const brands = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    select: {
      brand: true,
    },
    distinct: ["brand"],
    orderBy: {
      brand: "asc",
    },
  });

  const categories = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    select: {
      category: true,
    },
    distinct: ["category"],
    orderBy: {
      category: "asc",
    },
  });

  const orderBy =
    sort === "price-asc"
      ? { price: "asc" as const }
      : sort === "price-desc"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const };

  const where = {
    isActive: true,

    ...(search
      ? {
          name: {
            contains: search,
            mode: "insensitive" as const,
          },
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
  };

  const [products, totalProducts] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
    }),

    prisma.product.count({
      where,
    }),
  ]);

  const totalPages = Math.max(
    Math.ceil(totalProducts / pageSize),
    1,
  );

  const brandOptions = brands
    .map((item) => item.brand)
    .filter(
      (brand): brand is string =>
        Boolean(brand),
    );

  const categoryOptions = categories.map(
    (item) => item.category,
  );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
        <section className="mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
              Tüm Ürünler
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Ürünleri Keşfet
            </h1>

            <p className="mt-3 max-w-3xl text-zinc-400">
              Farklı kategorilerdeki ürünleri inceleyin,
              arayın, filtreleyin ve size uygun ürünleri keşfedin.
            </p>

            <div className="mt-6">
              <ProductSearch
                brands={brandOptions}
                categories={categoryOptions}
              />
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-zinc-400">
              {totalProducts} ürün bulundu
            </p>

            <p className="text-sm text-zinc-500">
              Sayfa {currentPage} / {totalPages}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
              <h2 className="text-2xl font-bold">
                Ürün bulunamadı
              </h2>

              <p className="mt-3 text-zinc-400">
                Arama ve filtre kriterlerinize uygun ürün bulunamadı.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    category={product.category}
                    price={product.price}
                    discountPrice={product.discountPrice}
                    imageUrl={product.imageUrl}
                    stock={product.stock}
                  />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}