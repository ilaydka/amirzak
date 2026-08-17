import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";

export default async function FeaturedProducts() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      id: "asc",
    },
    take: 3,
  });

  return (
    <section className="bg-zinc-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
            Öne Çıkanlar
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Öne Çıkan Ürünler
          </h2>

          <p className="mt-3 text-zinc-400">
            AMİRZAK&apos;ta öne çıkan ürünleri keşfedin.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <p className="text-zinc-400">
              Henüz öne çıkan ürün bulunmuyor.
            </p>
          </div>
        ) : (
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
        )}
      </div>
    </section>
  );
}