import Link from "next/link";

import DeleteProductButton from "@/components/DeleteProductButton";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductSuccessMessage from "@/components/ProductSuccessMessage";
import { requireAdmin } from "@/lib/admin";
import { deleteProduct } from "@/lib/product-actions";
import { prisma } from "@/lib/prisma";

type AdminProductsPageProps = {
  searchParams: Promise<{
    updated?: string;
    created?: string;
    deleted?: string;
    deleteError?: string;
  }>;
};

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  await requireAdmin();

  const {
    updated,
    created,
    deleted,
    deleteError,
  } = await searchParams;

  const products = await prisma.product.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
        <section className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
                Yönetim Paneli
              </p>

              <h1 className="mt-2 text-4xl font-bold">
                Ürün Yönetimi
              </h1>
            </div>

            <Link
              href="/admin/products/new"
              className="rounded-lg bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-500"
            >
              + Yeni Ürün
            </Link>
          </div>

          {updated === "1" && (
            <ProductSuccessMessage message="Ürün başarıyla güncellendi." />
          )}

          {created === "1" && (
            <ProductSuccessMessage message="Ürün başarıyla oluşturuldu." />
          )}

          {deleted === "1" && (
            <ProductSuccessMessage message="Ürün başarıyla silindi." />
          )}

          {deleteError === "ordered" && (
            <ProductSuccessMessage
              type="error"
              message="Bu ürün daha önce siparişlerde kullanıldığı için silinemez. Ürünü pasif hale getirebilirsiniz."
            />
          )}

          {deleteError === "1" && (
            <ProductSuccessMessage
              type="error"
              message="Ürün silinirken bir hata meydana geldi."
            />
          )}

          <div className="overflow-x-auto rounded-2xl border border-zinc-800">
            <table className="w-full min-w-[1050px]">
              <thead className="bg-zinc-900">
                <tr>
                  <th className="px-6 py-4 text-left">ID</th>
                  <th className="px-6 py-4 text-left">Ürün</th>
                  <th className="px-6 py-4 text-left">Marka</th>
                  <th className="px-6 py-4 text-left">Stok</th>
                  <th className="px-6 py-4 text-left">Fiyat</th>
                  <th className="px-6 py-4 text-left">Durum</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const hasDiscount =
                    product.discountPrice !== null &&
                    product.discountPrice < product.price;

                  return (
                    <tr
                      key={product.id}
                      className="border-t border-zinc-800"
                    >
                      <td className="px-6 py-4">
                        {product.id}
                      </td>

                      <td className="px-6 py-4 font-medium">
                        {product.name}
                      </td>

                      <td className="px-6 py-4">
                        {product.brand ?? "-"}
                      </td>

                      <td className="px-6 py-4">
                        {product.stock}
                      </td>

                      <td className="px-6 py-4">
                        {hasDiscount ? (
                          <div>
                            <p className="text-sm text-zinc-500 line-through">
                              {product.price.toLocaleString("tr-TR")} ₺
                            </p>

                            <p className="font-semibold text-red-400">
                              {product.discountPrice?.toLocaleString(
                                "tr-TR",
                              )}{" "}
                              ₺
                            </p>
                          </div>
                        ) : (
                          <span>
                            {product.price.toLocaleString("tr-TR")} ₺
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={
                            product.isActive
                              ? "font-semibold text-green-400"
                              : "font-semibold text-zinc-500"
                          }
                        >
                          {product.isActive
                            ? "Aktif"
                            : "Pasif"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold transition hover:border-red-500 hover:text-red-400"
                          >
                            Düzenle
                          </Link>

                          <DeleteProductButton
                            productId={product.id}
                            productName={product.name}
                            action={deleteProduct}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}