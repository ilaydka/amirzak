import Link from "next/link";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function formatName(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => {
      const lower = part.toLocaleLowerCase("tr-TR");

      return (
        lower.charAt(0).toLocaleUpperCase("tr-TR") +
        lower.slice(1)
      );
    })
    .join(" ");
}

export default async function AdminPage() {
  const admin = await requireAdmin();

  const [
    totalProducts,
    activeProducts,
    inactiveProducts,
    criticalStockProducts,
    pendingProductApprovals,
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

    prisma.product.count({
      where: {
        isActive: true,
        stock: {
          lte: 3,
        },
      },
    }),

    prisma.product.count({
      where: {
        approvalStatus: "PENDING",
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

  const totalPendingActions =
    criticalStockProducts +
    pendingProductApprovals +
    pendingOrders +
    openSupportTickets;

  const adminDisplayName = admin.name
    ? formatName(admin.name)
    : admin.email;

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <section className="page-section page-content max-w-7xl">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">
                Yönetim Paneli
              </p>

              <h1 className="display-title mt-3 text-4xl text-text sm:text-5xl">
                Hoş geldin, {adminDisplayName}
              </h1>

              <p className="mt-4 max-w-3xl leading-7 text-text-soft">
                AMİRZAK içerisindeki ürünleri, siparişleri,
                kullanıcıları ve destek taleplerini tek
                merkezden yönetebilirsiniz.
              </p>
            </div>

            {totalPendingActions > 0 && (
              <div className="status-warning min-w-44 rounded-2xl px-5 py-4">
                <p className="text-sm font-medium">
                  Bekleyen İşlem
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {totalPendingActions}
                </p>
              </div>
            )}
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <article className="panel p-6">
              <p className="text-sm text-text-muted">
                Toplam Ürün
              </p>

              <h2 className="mt-3 text-4xl font-bold tracking-tight text-brand">
                {totalProducts}
              </h2>
            </article>

            <article className="panel p-6">
              <p className="text-sm text-text-muted">
                Toplam Kullanıcı
              </p>

              <h2 className="mt-3 text-4xl font-bold tracking-tight text-brand">
                {totalUsers}
              </h2>
            </article>

            <article className="panel p-6">
              <p className="text-sm text-text-muted">
                Toplam Sipariş
              </p>

              <h2 className="mt-3 text-4xl font-bold tracking-tight text-brand">
                {totalOrders}
              </h2>
            </article>

            <article className="panel p-6">
              <p className="text-sm text-text-muted">
                Bekleyen Sipariş
              </p>

              <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#8a6e2d]">
                {pendingOrders}
              </h2>
            </article>

            <article className="panel p-6">
              <p className="text-sm text-text-muted">
                Açık Destek
              </p>

              <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#46694c]">
                {openSupportTickets}
              </h2>
            </article>

            <article className="panel p-6">
              <p className="text-sm text-text-muted">
                Toplam Satış
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#3f6b46]">
                {totalRevenue.toLocaleString("tr-TR")} ₺
              </h2>
            </article>
          </div>

          <div className="mt-14">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-soft">
              Yönetim
            </p>

            <h2 className="mt-2 font-serif text-3xl font-semibold text-text">
              Yönetim Alanları
            </h2>

            <p className="mt-2 text-text-soft">
              Yönetmek istediğiniz bölümü seçin.
            </p>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/admin/products"
              className="group panel card-hover p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-text">
                    Ürün Yönetimi
                  </h3>

                  <p className="mt-3 leading-6 text-text-soft">
                    Yeni ürün ekleyin, mevcut ürünleri düzenleyin,
                    stokları yönetin ve kullanıcıların gönderdiği
                    ürünleri inceleyin.
                  </p>
                </div>

                <span className="text-2xl text-text-muted transition group-hover:translate-x-1 group-hover:text-brand">
                  →
                </span>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-brand">
                  Ürünleri Yönet
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  {pendingProductApprovals > 0 && (
                    <span className="status-warning rounded-full px-2.5 py-1 text-xs font-bold">
                      {pendingProductApprovals} onay
                    </span>
                  )}

                  {criticalStockProducts > 0 && (
                    <span className="status-danger rounded-full px-2.5 py-1 text-xs font-bold">
                      {criticalStockProducts} stok
                    </span>
                  )}
                </div>
              </div>
            </Link>

            <Link
              href="/admin/orders"
              className="group panel card-hover p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-text">
                    Sipariş Yönetimi
                  </h3>

                  <p className="mt-3 leading-6 text-text-soft">
                    Gelen siparişleri inceleyin ve sipariş
                    durumlarını yönetin.
                  </p>
                </div>

                <span className="text-2xl text-text-muted transition group-hover:translate-x-1 group-hover:text-brand">
                  →
                </span>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-brand">
                  Siparişleri Yönet
                </p>

                {pendingOrders > 0 && (
                  <span className="status-warning rounded-full px-2.5 py-1 text-xs font-bold">
                    {pendingOrders}
                  </span>
                )}
              </div>
            </Link>

            <Link
              href="/admin/users"
              className="group panel card-hover p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-text">
                    Kullanıcı Yönetimi
                  </h3>

                  <p className="mt-3 leading-6 text-text-soft">
                    Kullanıcı hesaplarını görüntüleyin, hesap
                    türlerini ve rollerini yönetin.
                  </p>
                </div>

                <span className="text-2xl text-text-muted transition group-hover:translate-x-1 group-hover:text-brand">
                  →
                </span>
              </div>

              <p className="mt-6 text-sm font-semibold text-brand">
                Kullanıcıları Yönet
              </p>
            </Link>

            <Link
              href="/admin/support"
              className="group panel card-hover p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-text">
                    Destek Talepleri
                  </h3>

                  <p className="mt-3 leading-6 text-text-soft">
                    Kullanıcılardan gelen destek taleplerini
                    görüntüleyin, yanıtlayın ve durumlarını
                    yönetin.
                  </p>
                </div>

                <span className="text-2xl text-text-muted transition group-hover:translate-x-1 group-hover:text-brand">
                  →
                </span>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-brand">
                  Talepleri Yönet
                </p>

                {openSupportTickets > 0 && (
                  <span className="status-danger rounded-full px-2.5 py-1 text-xs font-bold">
                    {openSupportTickets}
                  </span>
                )}
              </div>
            </Link>
          </div>

          <div className="panel mt-10 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft">
                  Özet
                </p>

                <h2 className="mt-2 font-serif text-2xl font-semibold text-text">
                  Hızlı Durum
                </h2>
              </div>

              {totalPendingActions > 0 && (
                <p className="status-warning rounded-full px-3 py-1.5 text-sm font-semibold">
                  {totalPendingActions} işlem dikkat bekliyor
                </p>
              )}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="panel-soft p-4">
                <p className="text-sm text-text-muted">
                  Aktif Ürünler
                </p>

                <p className="mt-1 font-semibold text-text">
                  {activeProducts} ürün yayında
                </p>
              </div>

              <div className="panel-soft p-4">
                <p className="text-sm text-text-muted">
                  Pasif Ürünler
                </p>

                <p className="mt-1 font-semibold text-text">
                  {inactiveProducts} ürün yayında değil
                </p>
              </div>

              <div className="panel-soft p-4">
                <p className="text-sm text-text-muted">
                  Onay Bekleyen Ürünler
                </p>

                <p className="mt-1 font-semibold text-text">
                  {pendingProductApprovals} ürün inceleme bekliyor
                </p>
              </div>

              <div className="panel-soft p-4">
                <p className="text-sm text-text-muted">
                  Kritik Stok
                </p>

                <p className="mt-1 font-semibold text-text">
                  {criticalStockProducts} ürün kontrol bekliyor
                </p>
              </div>

              <div className="panel-soft p-4">
                <p className="text-sm text-text-muted">
                  Siparişler
                </p>

                <p className="mt-1 font-semibold text-text">
                  {pendingOrders} sipariş işlem bekliyor
                </p>
              </div>

              <div className="panel-soft p-4">
                <p className="text-sm text-text-muted">
                  Kullanıcılar
                </p>

                <p className="mt-1 font-semibold text-text">
                  {totalUsers} kayıtlı hesap
                </p>
              </div>

              <div className="panel-soft p-4">
                <p className="text-sm text-text-muted">
                  Destek
                </p>

                <p className="mt-1 font-semibold text-text">
                  {openSupportTickets} talep ilgilenilmeyi bekliyor
                </p>
              </div>

              <div className="panel-soft p-4">
                <p className="text-sm text-text-muted">
                  Toplam Satış
                </p>

                <p className="mt-1 font-semibold text-text">
                  {totalRevenue.toLocaleString("tr-TR")} ₺
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