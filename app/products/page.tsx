import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

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
              Performans Parçaları
            </h1>

            <p className="mt-3 text-zinc-400">
              Aracına uygun performans ve modifiye parçalarını incele.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                category={product.category}
                price={`${product.price.toLocaleString("tr-TR")} ₺`}
                compatibility={product.compatibility}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}