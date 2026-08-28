import Link from "next/link";

import FeaturedProductCard from "@/components/FeaturedProductCard";
import {
  moneyToNumber,
  optionalMoneyToNumber,
} from "@/lib/money";
import { prisma } from "@/lib/prisma";

export default async function FeaturedProducts() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      approvalStatus: "APPROVED",
      stock: {
        gt: 0,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 3,
  });

  return (
    <section className="bg-[#f1eee5] px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="display-title text-3xl text-brand sm:text-4xl">
              Yeni Keşifler
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-text-soft sm:text-base">
              Yeni ürünleri, bitkileri ve botanik seçimleri keşfedin.
            </p>
          </div>

          <Link
            href="/products"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-brand"
          >
            Tüm ürünleri gör

            <span className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="py-16 text-center">
            <h3 className="font-serif text-2xl font-semibold text-text">
              Yeni ürünler hazırlanıyor
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-soft">
              Yeni ürünler yakında burada yer alacak.
            </p>
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <FeaturedProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                category={product.category}
                price={moneyToNumber(product.price)}
                discountPrice={optionalMoneyToNumber(
                  product.discountPrice,
                )}
                imageUrl={product.imageUrl}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}