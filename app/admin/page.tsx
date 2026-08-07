import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const admin = await requireAdmin();

  const [totalProducts, totalUsers, totalCarts] =
    await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.cart.count(),
    ]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
        <section className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
            Yönetim Paneli
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Hoş geldin, {admin.name ?? admin.email}
          </h1>

          <p className="mt-4 text-zinc-400">
            Buradan ürünleri, kullanıcıları ve siparişleri yöneteceksin.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-sm text-zinc-400">
                Toplam Ürün
              </p>

              <h2 className="mt-3 text-4xl font-bold text-red-500">
                {totalProducts}
              </h2>
            </article>

            <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-sm text-zinc-400">
                Toplam Kullanıcı
              </p>

              <h2 className="mt-3 text-4xl font-bold text-red-500">
                {totalUsers}
              </h2>
            </article>

            <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-sm text-zinc-400">
                Aktif Sepet
              </p>

              <h2 className="mt-3 text-4xl font-bold text-red-500">
                {totalCarts}
              </h2>
            </article>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-xl font-bold">
                Ürün Yönetimi
              </h2>

              <p className="mt-3 text-sm text-zinc-400">
                Ürün ekleme, düzenleme ve stok işlemleri.
              </p>
            </article>

            <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-xl font-bold">
                Kullanıcı Yönetimi
              </h2>

              <p className="mt-3 text-sm text-zinc-400">
                Kullanıcı rolleri ve dealer başvuruları.
              </p>
            </article>

            <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-xl font-bold">
                Sipariş Yönetimi
              </h2>

              <p className="mt-3 text-sm text-zinc-400">
                Siparişleri görüntüleme ve durum güncelleme.
              </p>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}