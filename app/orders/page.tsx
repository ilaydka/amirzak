import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import OrderCreatedMessage from "@/components/OrderCreatedMessage";
import {
  formatMoney,
  moneyToNumber,
} from "@/lib/money";
import { prisma } from "@/lib/prisma";

type OrdersPageProps = {
  searchParams: Promise<{
    created?: string;
  }>;
};

function PackageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path d="M21 8 12 3 3 8l9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
      <path d="m7.5 5.5 9 5" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M3 6h11v10H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  );
}

function getStatusLabel(status: string) {
  switch (status) {
    case "PENDING":
      return "Sipariş Alındı";

    case "PROCESSING":
      return "Hazırlanıyor";

    case "SHIPPED":
      return "Kargoda";

    case "DELIVERED":
      return "Teslim Edildi";

    case "CANCELLED":
      return "İptal Edildi";

    default:
      return status;
  }
}

function getStatusDescription(status: string) {
  switch (status) {
    case "PENDING":
      return "Siparişiniz alındı ve işleme alınmayı bekliyor.";

    case "PROCESSING":
      return "Siparişiniz hazırlanıyor.";

    case "SHIPPED":
      return "Siparişiniz kargoya verildi.";

    case "DELIVERED":
      return "Siparişiniz teslim edildi.";

    case "CANCELLED":
      return "Bu sipariş iptal edildi.";

    default:
      return "";
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "PENDING":
      return "status-neutral";

    case "PROCESSING":
      return "status-warning";

    case "SHIPPED":
      return "status-info";

    case "DELIVERED":
      return "status-success";

    case "CANCELLED":
      return "status-danger";

    default:
      return "status-neutral";
  }
}

export default async function OrdersPage({
  searchParams,
}: OrdersPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { created } = await searchParams;

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
    },

    include: {
      items: {
        include: {
          product: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const normalizedOrders = orders.map((order) => ({
    ...order,
    total: moneyToNumber(order.total),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: moneyToNumber(item.unitPrice),
    })),
  }));

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <section className="page-section page-content max-w-5xl">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">
              Hesabım
            </p>

            <h1 className="display-title mt-3 text-4xl text-text sm:text-5xl">
              Siparişlerim
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-text-soft">
              Geçmiş siparişlerinizi, sipariş durumlarını ve
              kargo bilgilerinizi buradan takip edebilirsiniz.
            </p>
          </div>

          {created && <OrderCreatedMessage />}

          {normalizedOrders.length === 0 ? (
            <div className="empty-state px-6 py-12 text-center sm:px-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-white text-brand shadow-sm">
                <PackageIcon />
              </div>

              <h2 className="mt-5 font-serif text-2xl font-semibold text-text">
                Henüz siparişiniz yok
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-soft">
                İlk siparişinizi oluşturmak için ürünleri
                inceleyebilirsiniz.
              </p>

              <Link
                href="/products"
                className="brand-button mt-6 px-6 py-3 text-sm"
              >
                Ürünleri İncele
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {normalizedOrders.map((order) => {
                const hasShippingInfo =
                  Boolean(order.shippingCarrier) ||
                  Boolean(order.shippingTrackingNumber) ||
                  Boolean(order.shippingTrackingUrl);

                const showShippingInfo =
                  hasShippingInfo &&
                  (order.status === "SHIPPED" ||
                    order.status === "DELIVERED");

                return (
                  <article
                    key={order.id}
                    className="overflow-hidden rounded-[22px] border border-border bg-surface shadow-sm"
                  >
                    <div className="grid gap-6 border-b border-border p-6 sm:grid-cols-3">
                      <div>
                        <p className="text-sm text-text-muted">
                          Sipariş Tarihi
                        </p>

                        <p className="mt-1 font-semibold text-text">
                          {order.createdAt.toLocaleDateString(
                            "tr-TR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-text-muted">
                          Toplam
                        </p>

                        <p className="mt-1 text-xl font-bold tracking-tight text-brand">
                          {formatMoney(order.total)} ₺
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-text-muted">
                          Durum
                        </p>

                        <span
                          className={`${getStatusClass(
                            order.status,
                          )} mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold`}
                        >
                          {getStatusLabel(order.status)}
                        </span>

                        <p className="mt-2 text-sm leading-6 text-text-soft">
                          {getStatusDescription(order.status)}
                        </p>
                      </div>
                    </div>

                    {showShippingInfo && (
                      <div className="border-b border-border bg-[#f1f5ed] p-6">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand shadow-sm">
                              <TruckIcon />
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft">
                                Kargo Bilgileri
                              </p>

                              {order.shippingCarrier && (
                                <p className="mt-2 font-semibold text-text">
                                  {order.shippingCarrier}
                                </p>
                              )}

                              {order.shippingTrackingNumber && (
                                <p className="mt-1 text-sm text-text-soft">
                                  Takip No:{" "}
                                  <span className="font-semibold text-text">
                                    {
                                      order.shippingTrackingNumber
                                    }
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>

                          {order.shippingTrackingUrl && (
                            <a
                              href={order.shippingTrackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="secondary-button inline-flex shrink-0 items-center justify-center px-5 py-2.5 text-sm"
                            >
                              Kargoyu Takip Et →
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="divide-y divide-border">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center"
                        >
                          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-soft">
                            {item.product.imageUrl ? (
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="h-full w-full object-contain p-2"
                              />
                            ) : (
                              <span className="text-xs text-text-muted">
                                Görsel Yok
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/products/${item.productId}`}
                              className="text-lg font-semibold text-text transition hover:text-brand"
                            >
                              {item.product.name}
                            </Link>

                            <p className="mt-2 text-sm text-text-soft">
                              Adet: {item.quantity}
                            </p>

                            <p className="mt-1 text-sm text-text-soft">
                              Birim fiyat:{" "}
                              {formatMoney(item.unitPrice)} ₺
                            </p>
                          </div>

                          <p className="text-lg font-bold text-brand">
                            {formatMoney(
                              item.unitPrice *
                                item.quantity,
                            )}{" "}
                            ₺
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border bg-surface-soft p-6">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs text-text-muted">
                            Sipariş No
                          </p>

                          <p className="mt-1 break-all text-xs font-medium text-text-soft">
                            {order.id}
                          </p>

                          <Link
                            href={`/orders/${order.id}`}
                            className="secondary-button mt-4 inline-flex px-4 py-2.5 text-sm"
                          >
                            Sipariş Detayını Gör
                          </Link>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-sm text-text-muted">
                            Sipariş Toplamı
                          </p>

                          <p className="mt-1 text-2xl font-bold tracking-tight text-brand">
                            {formatMoney(order.total)} ₺
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}