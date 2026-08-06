import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";

export default async function AdminProductsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

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
              className="rounded-lg bg-red-600 px-5 py-3 font-semibold hover:bg-red-500"
            >
              + Yeni Ürün
            </Link>

          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-800">

            <table className="w-full">

              <thead className="bg-zinc-900">

                <tr>

                  <th className="px-6 py-4 text-left">
                    ID
                  </th>

                  <th className="px-6 py-4 text-left">
                    Ürün
                  </th>

                  <th className="px-6 py-4 text-left">
                    Marka
                  </th>

                  <th className="px-6 py-4 text-left">
                    Stok
                  </th>

                  <th className="px-6 py-4 text-left">
                    Fiyat
                  </th>

                </tr>

              </thead>

              <tbody>

                {products.map((product) => (

                  <tr
                    key={product.id}
                    className="border-t border-zinc-800"
                  >

                    <td className="px-6 py-4">
                      {product.id}
                    </td>

                    <td className="px-6 py-4">
                      {product.name}
                    </td>

                    <td className="px-6 py-4">
                      {product.brand ?? "-"}
                    </td>

                    <td className="px-6 py-4">
                      {product.stock}
                    </td>

                    <td className="px-6 py-4">
                      {product.price.toLocaleString("tr-TR")} ₺
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>
      </main>

      <Footer />
    </>
  );
}