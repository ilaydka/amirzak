import { notFound } from "next/navigation";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductForm from "@/components/ProductForm";
import { requireAdmin } from "@/lib/admin";
import { moneyToNumber } from "@/lib/money";
import { prisma } from "@/lib/prisma";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  await requireAdmin();

  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId < 1) {
    notFound();
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f6f2e8] px-6 py-14 text-[#253021]">
        <section className="mx-auto max-w-3xl">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#6f8265]">
              Ürün Yönetimi
            </p>

            <h1 className="mt-2 font-serif text-4xl font-semibold text-[#20361d] sm:text-5xl">
              {product.name}
            </h1>

            <p className="mt-3 text-[#687064]">
              Ürün bilgilerini, fiyatını, stok durumunu ve
              mağaza görünürlüğünü düzenleyin.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#d8d1c4] bg-[#fffdf8] px-3 py-1.5 text-xs font-semibold text-[#687064]">
                Ürün #{product.id}
              </span>

              <span
                className={
                  product.isActive
                    ? "rounded-full border border-[#c9dcc0] bg-[#e8f1e7] px-3 py-1.5 text-xs font-semibold text-[#3f6b46]"
                    : "rounded-full border border-[#ded8cb] bg-[#f0ece2] px-3 py-1.5 text-xs font-semibold text-[#77766f]"
                }
              >
                {product.isActive ? "Aktif" : "Pasif"}
              </span>

              {product.stock <= 3 && (
                <span className="rounded-full border border-[#e6d19a] bg-[#fff0c9] px-3 py-1.5 text-xs font-semibold text-[#9a6b16]">
                  Kritik Stok: {product.stock}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#ded8cb] bg-[#fffdf8] p-6 shadow-[0_12px_35px_rgba(47,74,42,0.06)] sm:p-8">
            <ProductForm
              mode="edit"
              initialValues={{
                id: product.id,
                name: product.name,
                brand: product.brand ?? "",
                category: product.category,
                price: moneyToNumber(product.price),
                discountPrice:
                  product.discountPrice === null
                    ? null
                    : moneyToNumber(product.discountPrice),
                stock: product.stock,
                imageUrl: product.imageUrl,
                description: product.description ?? "",
                isActive: product.isActive,
                scientificName: product.scientificName,
                lightRequirement: product.lightRequirement,
                watering: product.watering,
                careLevel: product.careLevel,
                environment: product.environment,
                plantSize: product.plantSize,
                petSafe: product.petSafe,
                bloomSeason: product.bloomSeason,
              }}
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}