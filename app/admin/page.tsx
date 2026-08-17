import Link from "next/link";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const admin = await requireAdmin();

  const [
    totalProducts,
    activeProducts,
    inactiveProducts,
    totalUsers,
    totalOrders,
    pendingOrders,
    openSupportTickets,
    totalSales,
  ] = await Promise.all([
    prisma.product.count(),

    prisma.product.count({
      where: {
        isActive: true,
      },
    }),

    prisma.product.count({
      where: {
        isActive: false,
      },
    }),

    prisma.user.count(),

    prisma.order.count(),

    prisma.order.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.supportTicket.count({
      where: {
        status: {
          in: ["OPEN", "IN_PROGRESS"],
        },
      },
    }),

    prisma.order.aggregate({
      where: {
        status: {
          not: "CANCELLED",
        },
      },
      _sum: {
        total: true,
      },
    }),
  ]);

  const totalRevenue =
    totalSales._sum.total ?? 0;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
        <section className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
            Yönetim Paneli
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Hoş geldin,{" "}
            {admin.name ?? admin.email}
          </h1>

          <p className="mt-4 max-w-3xl text-zinc-400">
            AMİRZAK içerisindeki ürünleri, siparişleri,
            kullanıcıları ve destek taleplerini tek
            merkezden yönetebilirsiniz.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-6">
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
                Toplam Sipariş
              </p>

              <h2 className="mt-3 text-4xl font-bold text-red-500">
                {totalOrders}
              </h2>
            </article>

            <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-sm text-zinc-400">
                Bekleyen Sipariş
              </p>

              <h2 className="mt-3 text-4xl font-bold text-yellow-400">
                {pendingOrders}
              </h2>
            </article>

            <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-sm text-zinc-400">
                Açık Destek
              </p>

              <h2 className="mt-3 text-4xl font-bold text-blue-400">
                {openSupportTickets}
              </h2>
            </article>

            <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-sm text-zinc-400">
                Toplam Satış
              </p>

              <h2 className="mt-3 text-3xl font-bold text-green-400">
                {totalRevenue.toLocaleString("tr-TR")} ₺
              </h2>
            </article>
          </div>

          <div className="mt-14">
            <h2 className="text-2xl font-bold">
              Yönetim
            </h2>

            <p className="mt-2 text-zinc-400">
              Yönetmek istediğiniz bölümü seçin.
            </p>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/admin/products"
              className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-7 transition hover:border-red-600 hover:bg-zinc-900/80"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">
                    Ürün Yönetimi
                  </h3>

                  <p className="mt-3 leading-6 text-zinc-400">
                    Yeni ürün ekleyin, mevcut ürünleri
                    düzenleyin, stokları ve ürün durumlarını
                    yönetin.
                  </p>
                </div>

                <span className="text-2xl text-zinc-600 transition group-hover:text-red-500">
                  →
                </span>
              </div>

              <p className="mt-6 text-sm font-semibold text-red-400">
                Ürünleri Yönet
              </p>
            </Link>

            <Link
              href="/admin/orders"
              className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-7 transition hover:border-red-600 hover:bg-zinc-900/80"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">
                    Sipariş Yönetimi
                  </h3>

                  <p className="mt-3 leading-6 text-zinc-400">
                    Gelen siparişleri inceleyin ve
                    sipariş durumlarını yönetin.
                  </p>
                </div>

                <span className="text-2xl text-zinc-600 transition group-hover:text-red-500">
                  →
                </span>
              </div>

              <p className="mt-6 text-sm font-semibold text-red-400">
                Siparişleri Yönet
              </p>
            </Link>

            <Link
              href="/admin/users"
              className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-7 transition hover:border-red-600 hover:bg-zinc-900/80"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">
                    Kullanıcı Yönetimi
                  </h3>

                  <p className="mt-3 leading-6 text-zinc-400">
                    Kullanıcı hesaplarını görüntüleyin,
                    hesap türlerini ve rollerini yönetin.
                  </p>
                </div>

                <span className="text-2xl text-zinc-600 transition group-hover:text-red-500">
                  →
                </span>
              </div>

              <p className="mt-6 text-sm font-semibold text-red-400">
                Kullanıcıları Yönet
              </p>
            </Link>

            <Link
              href="/admin/support"
              className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-7 transition hover:border-red-600 hover:bg-zinc-900/80"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">
                    Destek Talepleri
                  </h3>

                  <p className="mt-3 leading-6 text-zinc-400">
                    Kullanıcılardan gelen destek
                    taleplerini görüntüleyin, yanıtlayın ve
                    durumlarını yönetin.
                  </p>
                </div>

                <span className="text-2xl text-zinc-600 transition group-hover:text-red-500">
                  →
                </span>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-red-400">
                  Talepleri Yönet
                </p>

                {openSupportTickets > 0 && (
                  <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
                    {openSupportTickets}
                  </span>
                )}
              </div>
            </Link>
          </div>

          <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-bold">
              Hızlı Durum
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-xl bg-zinc-950 p-4">
                <p className="text-sm text-zinc-500">
                  Aktif Ürünler
                </p>

                <p className="mt-1 font-semibold">
                  {activeProducts} ürün yayında
                </p>
              </div>

              <div className="rounded-xl bg-zinc-950 p-4">
                <p className="text-sm text-zinc-500">
                  Pasif Ürünler
                </p>

                <p className="mt-1 font-semibold">
                  {inactiveProducts} ürün yayında değil
                </p>
              </div>

              <div className="rounded-xl bg-zinc-950 p-4">
                <p className="text-sm text-zinc-500">
                  Siparişler
                </p>

                <p className="mt-1 font-semibold">
                  {pendingOrders} sipariş işlem bekliyor
                </p>
              </div>

              <div className="rounded-xl bg-zinc-950 p-4">
                <p className="text-sm text-zinc-500">
                  Kullanıcılar
                </p>

                <p className="mt-1 font-semibold">
                  {totalUsers} kayıtlı hesap
                </p>
              </div>

              <div className="rounded-xl bg-zinc-950 p-4">
                <p className="text-sm text-zinc-500">
                  Destek
                </p>

                <p className="mt-1 font-semibold">
                  {openSupportTickets} talep ilgilenilmeyi
                  bekliyor
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}