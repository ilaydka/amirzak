import Link from "next/link";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import OrderStatusMessage from "@/components/OrderStatusMessage";
import {
  approveOrderRequest,
  refundOrder,
  rejectOrderRequest,
  shipOrder,
  updateOrderStatus,
} from "@/lib/admin-order-actions";
import { requireAdmin } from "@/lib/admin";
import {
  formatMoney,
  moneyToNumber,
} from "@/lib/money";
import { prisma } from "@/lib/prisma";

type AdminOrdersPageProps = {
  searchParams: Promise<{
    updated?: string;
    error?: string;
    refunded?: string;
    refundError?: string;
    shipped?: string;
    shippingError?: string;
    requestApproved?: string;
    requestRejected?: string;
    requestError?: string;
    q?: string;
    orderStatus?: string;
    paymentStatus?: string;
    requestStatus?: string;
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

function getStatusLabel(status: string) {
  switch (status) {
    case "PENDING":
      return "Ödeme Bekleniyor";
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

function getPaymentStatusLabel(status?: string) {
  switch (status) {
    case "PENDING":
      return "Ödeme Bekleniyor";
    case "PROCESSING":
      return "Ödeme İşleniyor";
    case "SUCCEEDED":
      return "Ödendi";
    case "FAILED":
      return "Ödeme Başarısız";
    case "CANCELLED":
      return "Ödeme İptal";
    case "REFUNDED":
      return "İade Edildi";
    case "PARTIALLY_REFUNDED":
      return "Kısmi İade";
    default:
      return "Ödeme Kaydı Yok";
  }
}

function getRequestTypeLabel(
  type?: string | null,
) {
  switch (type) {
    case "CANCELLATION":
      return "İptal Talebi";
    case "RETURN":
      return "İade Talebi";
    default:
      return "Talep";
  }
}

function getRequestStatusLabel(
  status?: string | null,
) {
  switch (status) {
    case "PENDING":
      return "İnceleniyor";
    case "APPROVED":
      return "Onaylandı";
    case "REJECTED":
      return "Reddedildi";
    default:
      return "";
  }
}

function getNextStatuses(status: string) {
  switch (status) {
    case "PENDING":
      return [
        {
          value: "CANCELLED",
          label: "Siparişi İptal Et",
        },
      ];
    case "SHIPPED":
      return [
        {
          value: "DELIVERED",
          label: "Teslim Edildi",
        },
      ];
    default:
      return [];
  }
}

function getPaymentStatusClass(
  status?: string,
) {
  switch (status) {
    case "SUCCEEDED":
    case "REFUNDED":
      return "status-success";
    case "FAILED":
    case "CANCELLED":
      return "status-danger";
    case "PARTIALLY_REFUNDED":
    case "PENDING":
    case "PROCESSING":
      return "status-warning";
    default:
      return "status-neutral";
  }
}

function getOrderStatusClass(
  status: string,
) {
  switch (status) {
    case "DELIVERED":
      return "status-success";
    case "CANCELLED":
      return "status-danger";
    case "SHIPPED":
      return "status-info";
    case "PROCESSING":
      return "status-warning";
    default:
      return "status-neutral";
  }
}

function getRequestStatusClass(
  status?: string | null,
) {
  switch (status) {
    case "PENDING":
      return "status-warning";
    case "APPROVED":
      return "status-success";
    case "REJECTED":
      return "status-danger";
    default:
      return "status-neutral";
  }
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  await requireAdmin();

  const {
    updated,
    error,
    refunded,
    refundError,
    shipped,
    shippingError,
    requestApproved,
    requestRejected,
    requestError,
    q,
    orderStatus,
    paymentStatus,
    requestStatus,
  } = await searchParams;

  const searchQuery =
    q?.trim().toLocaleLowerCase(
      "tr-TR",
    ) ?? "";

  const orders =
    await prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },

        items: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },

        payments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            status: true,
            provider: true,
            paidAt: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  const filteredOrders =
    orders.filter((order) => {
      const latestPayment =
        order.payments[0];

      const customerName = [
        order.user.firstName,
        order.user.lastName,
        order.user.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase(
          "tr-TR",
        );

      const customerEmail =
        order.user.email
          ?.toLocaleLowerCase(
            "tr-TR",
          ) ?? "";

      const orderId =
        order.id.toLocaleLowerCase(
          "tr-TR",
        );

      const productNames =
        order.items
          .map(
            (item) =>
              item.product.name,
          )
          .join(" ")
          .toLocaleLowerCase(
            "tr-TR",
          );

      const matchesSearch =
        !searchQuery ||
        orderId.includes(
          searchQuery,
        ) ||
        customerName.includes(
          searchQuery,
        ) ||
        customerEmail.includes(
          searchQuery,
        ) ||
        productNames.includes(
          searchQuery,
        );

      const matchesOrderStatus =
        !orderStatus ||
        order.status === orderStatus;

      const matchesPaymentStatus =
        !paymentStatus ||
        latestPayment?.status ===
          paymentStatus;

      const matchesRequestStatus =
        !requestStatus ||
        (requestStatus === "NONE"
          ? !order.requestStatus
          : order.requestStatus ===
            requestStatus);

      return (
        matchesSearch &&
        matchesOrderStatus &&
        matchesPaymentStatus &&
        matchesRequestStatus
      );
    });

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(orderStatus) ||
    Boolean(paymentStatus) ||
    Boolean(requestStatus);

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <section className="page-section page-content max-w-7xl">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">
              Yönetim Paneli
            </p>

            <h1 className="display-title mt-3 text-4xl text-text sm:text-5xl">
              Sipariş Yönetimi
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-text-soft">
              Ödeme durumlarını takip edin,
              hazırlanan siparişleri kargoya
              aktarın ve teslimat sürecini
              yönetin.
            </p>
          </div>

          {updated === "1" && (
            <OrderStatusMessage message="Sipariş durumu başarıyla güncellendi." />
          )}

          {shipped === "1" && (
            <OrderStatusMessage message="Sipariş kargoya verildi ve takip bilgileri kaydedildi." />
          )}

          {refunded === "1" && (
            <OrderStatusMessage message="Ödeme başarıyla iade edildi. Sipariş iptal edildi ve ürün stokları geri eklendi." />
          )}

          {requestApproved === "1" && (
            <OrderStatusMessage message="İptal / iade talebi onaylandı. Ödeme iade edildi ve ürün stokları geri eklendi." />
          )}

          {requestRejected === "1" && (
            <OrderStatusMessage message="İptal / iade talebi reddedildi." />
          )}

          {requestError === "invalid" && (
            <OrderStatusMessage
              type="error"
              message="Geçersiz talep bilgisi."
            />
          )}

          {requestError === "not-found" && (
            <OrderStatusMessage
              type="error"
              message="Talebin bağlı olduğu sipariş bulunamadı."
            />
          )}

          {requestError === "not-pending" && (
            <OrderStatusMessage
              type="error"
              message="Bu talep artık inceleniyor durumda değil."
            />
          )}

          {requestError === "status" && (
            <OrderStatusMessage
              type="error"
              message="Siparişin mevcut durumu bu iptal / iade talebinin onaylanmasına uygun değil."
            />
          )}

          {requestError ===
            "return-expired" && (
            <OrderStatusMessage
              type="error"
              message="Bu sipariş için 15 günlük iade süresi sona ermiş."
            />
          )}

          {requestError ===
            "already-refunded" && (
            <OrderStatusMessage
              type="error"
              message="Bu siparişin ödemesi zaten iade edilmiş."
            />
          )}

          {requestError === "payment" && (
            <OrderStatusMessage
              type="error"
              message="Talep için iade edilebilir başarılı ödeme bulunamadı."
            />
          )}

          {requestError ===
            "processing" && (
            <OrderStatusMessage
              type="error"
              message="Bu ödeme üzerinde başka bir işlem devam ediyor."
            />
          )}

          {requestError === "provider" && (
            <OrderStatusMessage
              type="error"
              message="iyzico iade işlemini tamamlayamadı."
            />
          )}

          {requestError === "1" && (
            <OrderStatusMessage
              type="error"
              message="Talep güncellenirken bir hata meydana geldi."
            />
          )}

          {error === "not-found" && (
            <OrderStatusMessage
              type="error"
              message="Sipariş bulunamadı."
            />
          )}

          {error === "same-status" && (
            <OrderStatusMessage
              type="error"
              message="Sipariş zaten seçilen durumda."
            />
          )}

          {error ===
            "invalid-transition" && (
            <OrderStatusMessage
              type="error"
              message="Bu sipariş için seçilen durum geçişine izin verilmiyor."
            />
          )}

          {error === "paid-cancel" && (
            <OrderStatusMessage
              type="error"
              message="Ödemesi alınmış sipariş doğrudan iptal edilemez. Önce ödeme iadesi yapılmalıdır."
            />
          )}

          {error === "invalid" && (
            <OrderStatusMessage
              type="error"
              message="Geçersiz sipariş veya durum bilgisi."
            />
          )}

          {error === "1" && (
            <OrderStatusMessage
              type="error"
              message="Sipariş durumu güncellenirken bir hata meydana geldi."
            />
          )}

          {shippingError === "invalid" && (
            <OrderStatusMessage
              type="error"
              message="Kargo firması ve takip numarasını doğru şekilde girmelisiniz. Takip bağlantısı girilecekse geçerli bir bağlantı olmalıdır."
            />
          )}

          {shippingError ===
            "not-found" && (
            <OrderStatusMessage
              type="error"
              message="Kargoya verilecek sipariş bulunamadı."
            />
          )}

          {shippingError === "status" && (
            <OrderStatusMessage
              type="error"
              message="Yalnızca hazırlanmakta olan siparişler kargoya verilebilir."
            />
          )}

          {shippingError ===
            "payment" && (
            <OrderStatusMessage
              type="error"
              message="Ödemesi tamamlanmamış sipariş kargoya verilemez."
            />
          )}

          {shippingError ===
            "request" && (
            <OrderStatusMessage
              type="error"
              message="Bu sipariş için bekleyen iptal talebi bulunduğu için sipariş kargoya verilemez."
            />
          )}

          {shippingError === "1" && (
            <OrderStatusMessage
              type="error"
              message="Sipariş kargoya verilirken bir hata meydana geldi."
            />
          )}

          {refundError === "invalid" && (
            <OrderStatusMessage
              type="error"
              message="Geçersiz iade isteği."
            />
          )}

          {refundError === "not-found" && (
            <OrderStatusMessage
              type="error"
              message="İade edilecek sipariş bulunamadı."
            />
          )}

          {refundError ===
            "already-refunded" && (
            <OrderStatusMessage
              type="error"
              message="Bu siparişin ödemesi zaten iade edilmiş."
            />
          )}

          {refundError === "payment" && (
            <OrderStatusMessage
              type="error"
              message="Bu sipariş için iade edilebilir başarılı bir ödeme bulunamadı."
            />
          )}

          {refundError ===
            "provider-id" && (
            <OrderStatusMessage
              type="error"
              message="iyzico ödeme kimliği bulunamadığı için iade başlatılamadı."
            />
          )}

          {refundError ===
            "processing" && (
            <OrderStatusMessage
              type="error"
              message="Bu ödeme üzerinde başka bir işlem devam ediyor."
            />
          )}

          {refundError === "provider" && (
            <OrderStatusMessage
              type="error"
              message="iyzico iade işlemini tamamlayamadı."
            />
          )}

          {refundError === "status" && (
            <OrderStatusMessage
              type="error"
              message="Bu sipariş mevcut durumunda manuel olarak iade edilemez."
            />
          )}

          {refundError === "request" && (
            <OrderStatusMessage
              type="error"
              message="Bu sipariş için bekleyen bir iptal / iade talebi bulunduğundan manuel ödeme iadesi yapılamaz."
            />
          )}

          {refundError === "1" && (
            <OrderStatusMessage
              type="error"
              message="Ödeme iade edilirken bir hata meydana geldi."
            />
          )}

          <section className="panel mb-7 p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft">
                  Arama ve Filtreleme
                </p>

                <h2 className="mt-2 font-serif text-xl font-semibold text-text">
                  Siparişleri Bul
                </h2>
              </div>

              <p className="text-sm text-text-muted">
                {filteredOrders.length} /{" "}
                {orders.length} sipariş
              </p>
            </div>

            <form
              method="GET"
              action="/admin/orders"
              className="mt-5 grid gap-3 xl:grid-cols-[minmax(280px,1.6fr)_minmax(150px,0.8fr)_minmax(150px,0.8fr)_minmax(170px,0.9fr)_auto] xl:items-end"
            >
              <div>
                <label
                  htmlFor="q"
                  className="mb-2 block text-sm font-semibold text-text"
                >
                  Ara
                </label>

                <input
                  id="q"
                  name="q"
                  type="search"
                  defaultValue={q ?? ""}
                  placeholder="Sipariş no, müşteri, e-posta veya ürün"
                  className="field w-full px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="orderStatus"
                  className="mb-2 block text-sm font-semibold text-text"
                >
                  Sipariş Durumu
                </label>

                <select
                  id="orderStatus"
                  name="orderStatus"
                  defaultValue={
                    orderStatus ?? ""
                  }
                  className="field w-full px-4 py-2.5 text-sm"
                >
                  <option value="">
                    Tümü
                  </option>
                  <option value="PENDING">
                    Ödeme Bekleniyor
                  </option>
                  <option value="PROCESSING">
                    Hazırlanıyor
                  </option>
                  <option value="SHIPPED">
                    Kargoda
                  </option>
                  <option value="DELIVERED">
                    Teslim Edildi
                  </option>
                  <option value="CANCELLED">
                    İptal Edildi
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="paymentStatus"
                  className="mb-2 block text-sm font-semibold text-text"
                >
                  Ödeme Durumu
                </label>

                <select
                  id="paymentStatus"
                  name="paymentStatus"
                  defaultValue={
                    paymentStatus ?? ""
                  }
                  className="field w-full px-4 py-2.5 text-sm"
                >
                  <option value="">
                    Tümü
                  </option>
                  <option value="PENDING">
                    Ödeme Bekleniyor
                  </option>
                  <option value="PROCESSING">
                    İşleniyor
                  </option>
                  <option value="SUCCEEDED">
                    Ödendi
                  </option>
                  <option value="FAILED">
                    Başarısız
                  </option>
                  <option value="CANCELLED">
                    Ödeme İptal
                  </option>
                  <option value="REFUNDED">
                    İade Edildi
                  </option>
                  <option value="PARTIALLY_REFUNDED">
                    Kısmi İade
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="requestStatus"
                  className="mb-2 block text-sm font-semibold text-text"
                >
                  İptal / İade Talebi
                </label>

                <select
                  id="requestStatus"
                  name="requestStatus"
                  defaultValue={
                    requestStatus ?? ""
                  }
                  className="field w-full px-4 py-2.5 text-sm"
                >
                  <option value="">
                    Tümü
                  </option>
                  <option value="PENDING">
                    İnceleniyor
                  </option>
                  <option value="APPROVED">
                    Onaylandı
                  </option>
                  <option value="REJECTED">
                    Reddedildi
                  </option>
                  <option value="NONE">
                    Talep Yok
                  </option>
                </select>
              </div>

              <div className="flex gap-2">
                {hasActiveFilters && (
                  <Link
                    href="/admin/orders"
                    className="secondary-button flex min-h-11 items-center justify-center whitespace-nowrap px-4 py-2.5 text-sm"
                  >
                    Temizle
                  </Link>
                )}

                <button
                  type="submit"
                  className="brand-button min-h-11 whitespace-nowrap px-5 py-2.5 text-sm"
                >
                  Filtrele
                </button>
              </div>
            </form>
          </section>

          {orders.length === 0 ? (
            <div className="empty-state flex min-h-[270px] flex-col items-center justify-center px-6 py-12 text-center sm:px-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-white text-brand shadow-sm">
                <PackageIcon />
              </div>

              <h2 className="mt-5 font-serif text-2xl font-semibold text-text">
                Henüz sipariş yok
              </h2>

              <p className="mt-2 text-sm leading-6 text-text-soft">
                Oluşturulan siparişler burada
                görüntülenecek.
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-state flex min-h-[270px] flex-col items-center justify-center px-6 py-12 text-center sm:px-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-white text-brand shadow-sm">
                <PackageIcon />
              </div>

              <h2 className="mt-5 font-serif text-2xl font-semibold text-text">
                Sonuç bulunamadı
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-text-soft">
                Arama kelimenizi veya seçtiğiniz
                filtreleri değiştirerek tekrar
                deneyebilirsiniz.
              </p>

              <Link
                href="/admin/orders"
                className="secondary-button mt-5 px-5 py-3 text-sm"
              >
                Filtreleri Temizle
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map(
                (order) => {
                  const nextStatuses =
                    getNextStatuses(
                      order.status,
                    );

                  const latestPayment =
                    order.payments[0];

                  const customerName =
                    [
                      order.user
                        .firstName,
                      order.user
                        .lastName,
                    ]
                      .filter(Boolean)
                      .join(" ") ||
                    order.user.name ||
                    "İsimsiz Kullanıcı";

                  const hasPendingRequest =
                    order.requestStatus ===
                    "PENDING";

                  const canRefund =
                    order.status ===
                      "PROCESSING" &&
                    latestPayment?.status ===
                      "SUCCEEDED" &&
                    !hasPendingRequest;

                  const canShip =
                    order.status ===
                      "PROCESSING" &&
                    latestPayment?.status ===
                      "SUCCEEDED" &&
                    !hasPendingRequest;

                  const hasShippingInfo =
                    Boolean(
                      order.shippingCarrier,
                    ) &&
                    Boolean(
                      order.shippingTrackingNumber,
                    );

                  return (
                    <article
                      key={order.id}
                      className="overflow-hidden rounded-[22px] border border-border bg-surface shadow-sm"
                    >
                      <div className="grid gap-6 border-b border-border p-6 md:grid-cols-5">
                        <div>
                          <p className="text-sm text-text-muted">
                            Müşteri
                          </p>

                          <p className="mt-1 font-semibold text-text">
                            {customerName}
                          </p>

                          <p className="mt-1 break-all text-sm text-text-muted">
                            {order.user.email ??
                              "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-text-muted">
                            Tarih
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
                            {formatMoney(
                              order.total,
                            )}{" "}
                            ₺
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-text-muted">
                            Ödeme
                          </p>

                          <span
                            className={`${getPaymentStatusClass(
                              latestPayment?.status,
                            )} mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold`}
                          >
                            {getPaymentStatusLabel(
                              latestPayment?.status,
                            )}
                          </span>
                        </div>

                        <div>
                          <p className="text-sm text-text-muted">
                            Sipariş
                          </p>

                          <span
                            className={`${getOrderStatusClass(
                              order.status,
                            )} mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold`}
                          >
                            {getStatusLabel(
                              order.status,
                            )}
                          </span>
                        </div>
                      </div>

                      {order.requestStatus && (
                        <div
                          className={
                            order.requestStatus ===
                            "PENDING"
                              ? "border-b border-[#ead8a8] bg-[#fff9e8] p-6"
                              : "border-b border-border bg-surface-soft p-6"
                          }
                        >
                          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft">
                                İptal / İade Talebi
                              </p>

                              <div className="mt-3 flex flex-wrap items-center gap-3">
                                <h3 className="font-serif text-xl font-semibold text-text">
                                  {getRequestTypeLabel(
                                    order.requestType,
                                  )}
                                </h3>

                                <span
                                  className={`${getRequestStatusClass(
                                    order.requestStatus,
                                  )} inline-flex rounded-full px-3 py-1.5 text-xs font-semibold`}
                                >
                                  {getRequestStatusLabel(
                                    order.requestStatus,
                                  )}
                                </span>
                              </div>

                              {order.requestReason && (
                                <div className="mt-4 max-w-2xl rounded-[18px] border border-border bg-white/70 p-4">
                                  <p className="text-xs font-semibold text-text-muted">
                                    Talep Sebebi
                                  </p>

                                  <p className="mt-2 text-sm leading-6 text-text-soft">
                                    {
                                      order.requestReason
                                    }
                                  </p>
                                </div>
                              )}

                              {order.requestCreatedAt && (
                                <p className="mt-3 text-xs text-text-muted">
                                  Talep tarihi:{" "}
                                  {order.requestCreatedAt.toLocaleDateString(
                                    "tr-TR",
                                    {
                                      day: "2-digit",
                                      month:
                                        "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute:
                                        "2-digit",
                                    },
                                  )}
                                </p>
                              )}
                            </div>

                            {hasPendingRequest && (
                              <div className="flex shrink-0 flex-wrap gap-3">
                                <form
                                  action={
                                    approveOrderRequest
                                  }
                                >
                                  <input
                                    type="hidden"
                                    name="orderId"
                                    value={
                                      order.id
                                    }
                                  />

                                  <button
                                    type="submit"
                                    className="brand-button px-5 py-3 text-sm"
                                  >
                                    Talebi Onayla ve İade Et
                                  </button>
                                </form>

                                <form
                                  action={
                                    rejectOrderRequest
                                  }
                                >
                                  <input
                                    type="hidden"
                                    name="orderId"
                                    value={
                                      order.id
                                    }
                                  />

                                  <button
                                    type="submit"
                                    className="rounded-xl border border-[#d8a9a2] bg-[#fff4f2] px-5 py-3 text-sm font-semibold text-[#9a4138] transition hover:bg-[#fde7e3]"
                                  >
                                    Talebi Reddet
                                  </button>
                                </form>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="divide-y divide-border">
                        {order.items.map(
                          (item) => (
                            <div
                              key={item.id}
                              className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center"
                            >
                              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-soft">
                                {item.product
                                  .imageUrl ? (
                                  <img
                                    src={
                                      item
                                        .product
                                        .imageUrl
                                    }
                                    alt={
                                      item
                                        .product
                                        .name
                                    }
                                    className="h-full w-full object-contain p-2"
                                  />
                                ) : (
                                  <span className="text-xs text-text-muted">
                                    Görsel Yok
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-text">
                                  {
                                    item
                                      .product
                                      .name
                                  }
                                </p>

                                <p className="mt-1 text-sm text-text-soft">
                                  {
                                    item.quantity
                                  }{" "}
                                  adet ×{" "}
                                  {formatMoney(
                                    item.unitPrice,
                                  )}{" "}
                                  ₺
                                </p>
                              </div>

                              <p className="font-bold text-brand">
                                {formatMoney(
                                  moneyToNumber(
                                    item.unitPrice,
                                  ) *
                                    item.quantity,
                                )}{" "}
                                ₺
                              </p>
                            </div>
                          ),
                        )}
                      </div>

                      {hasShippingInfo && (
                        <div className="border-t border-border bg-[#f1f5ed] p-6">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-soft">
                            Kargo Bilgileri
                          </p>

                          <div className="mt-4 grid gap-4 sm:grid-cols-3">
                            <div>
                              <p className="text-xs text-text-muted">
                                Kargo Firması
                              </p>

                              <p className="mt-1 font-semibold text-text">
                                {
                                  order.shippingCarrier
                                }
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-text-muted">
                                Takip Numarası
                              </p>

                              <p className="mt-1 break-all font-semibold text-text">
                                {
                                  order.shippingTrackingNumber
                                }
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-text-muted">
                                Takip Bağlantısı
                              </p>

                              {order.shippingTrackingUrl ? (
                                <a
                                  href={
                                    order.shippingTrackingUrl
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-1 inline-flex font-semibold text-brand underline underline-offset-4"
                                >
                                  Kargoyu Takip Et
                                </a>
                              ) : (
                                <p className="mt-1 text-sm text-text-muted">
                                  Eklenmedi
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="border-t border-border bg-surface-soft p-6">
                        {canShip && (
                          <div className="mb-6 rounded-[20px] border border-[#d5dfcc] bg-[#f5f8f2] p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-soft">
                              Kargo İşlemi
                            </p>

                            <h3 className="mt-2 font-serif text-xl font-semibold text-text">
                              Siparişi Kargoya Ver
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-text-soft">
                              Sipariş kargoya
                              verildiğinde firma
                              ve takip bilgilerini
                              kaydedin.
                            </p>

                            <form
                              action={shipOrder}
                              className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_1.3fr_auto] lg:items-end"
                            >
                              <input
                                type="hidden"
                                name="orderId"
                                value={order.id}
                              />

                              <div>
                                <label
                                  htmlFor={`shipping-carrier-${order.id}`}
                                  className="text-sm font-semibold text-text"
                                >
                                  Kargo Firması
                                </label>

                                <input
                                  id={`shipping-carrier-${order.id}`}
                                  name="shippingCarrier"
                                  type="text"
                                  required
                                  minLength={2}
                                  maxLength={100}
                                  placeholder="Örn. Yurtiçi Kargo"
                                  className="field mt-2 px-4 py-3 text-sm"
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor={`shipping-number-${order.id}`}
                                  className="text-sm font-semibold text-text"
                                >
                                  Takip Numarası
                                </label>

                                <input
                                  id={`shipping-number-${order.id}`}
                                  name="shippingTrackingNumber"
                                  type="text"
                                  required
                                  minLength={2}
                                  maxLength={100}
                                  placeholder="Örn. 123456789"
                                  className="field mt-2 px-4 py-3 text-sm"
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor={`shipping-url-${order.id}`}
                                  className="text-sm font-semibold text-text"
                                >
                                  Takip Linki
                                </label>

                                <input
                                  id={`shipping-url-${order.id}`}
                                  name="shippingTrackingUrl"
                                  type="url"
                                  placeholder="https://..."
                                  className="field mt-2 px-4 py-3 text-sm"
                                />
                              </div>

                              <button
                                type="submit"
                                className="brand-button px-5 py-3 text-sm"
                              >
                                Kargoya Ver
                              </button>
                            </form>
                          </div>
                        )}

                        <div className="flex flex-wrap items-end justify-between gap-5">
                          <div className="min-w-0 flex-1">
                            {nextStatuses.length >
                            0 ? (
                              <form
                                action={
                                  updateOrderStatus
                                }
                                className="flex flex-wrap items-center gap-3"
                              >
                                <input
                                  type="hidden"
                                  name="orderId"
                                  value={
                                    order.id
                                  }
                                />

                                <select
                                  name="status"
                                  defaultValue=""
                                  required
                                  className="field max-w-xs rounded-full px-5 py-3 text-sm"
                                >
                                  <option
                                    value=""
                                    disabled
                                  >
                                    Yeni durum seç
                                  </option>

                                  {nextStatuses.map(
                                    (
                                      status,
                                    ) => (
                                      <option
                                        key={
                                          status.value
                                        }
                                        value={
                                          status.value
                                        }
                                      >
                                        {
                                          status.label
                                        }
                                      </option>
                                    ),
                                  )}
                                </select>

                                <button
                                  type="submit"
                                  className="brand-button px-5 py-3 text-sm"
                                >
                                  Durumu Güncelle
                                </button>
                              </form>
                            ) : order.status ===
                              "PROCESSING" ? (
                              <p className="text-sm text-text-soft">
                                {hasPendingRequest
                                  ? "Bu sipariş için bekleyen iptal talebi bulunuyor."
                                  : "Sipariş hazırlanıyor. Kargoya vermek için yukarıdaki kargo bilgilerini doldurun."}
                              </p>
                            ) : (
                              <p className="text-sm text-text-soft">
                                {order.status ===
                                "DELIVERED"
                                  ? "Bu sipariş teslim edilmiştir."
                                  : order.status ===
                                      "CANCELLED"
                                    ? "Bu sipariş iptal edilmiştir."
                                    : "Sipariş süreci devam ediyor."}
                              </p>
                            )}

                            {latestPayment?.status ===
                              "REFUNDED" && (
                              <p className="mt-3 text-xs font-medium text-[#3f6b46]">
                                Bu siparişin
                                ödemesi tamamen
                                iade edilmiştir.
                              </p>
                            )}
                          </div>

                          {canRefund && (
                            <div className="rounded-[18px] border border-[#e4c7c2] bg-[#fff8f6] p-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a4138]">
                                Ödeme İadesi
                              </p>

                              <p className="mt-1 max-w-xs text-xs leading-5 text-text-muted">
                                Bu işlem sipariş
                                tutarının tamamını
                                iyzico üzerinden
                                iade eder.
                              </p>

                              <form
                                action={
                                  refundOrder
                                }
                                className="mt-3"
                              >
                                <input
                                  type="hidden"
                                  name="orderId"
                                  value={
                                    order.id
                                  }
                                />

                                <button
                                  type="submit"
                                  className="rounded-xl border border-[#d8a9a2] bg-[#fff4f2] px-5 py-2.5 text-sm font-semibold text-[#9a4138] transition hover:bg-[#fde7e3]"
                                >
                                  Ödemeyi Tam İade Et
                                </button>
                              </form>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}