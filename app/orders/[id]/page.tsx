import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import AutoDismissMessage from "@/components/AutoDismissMessage";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  formatMoney,
  moneyToNumber,
} from "@/lib/money";
import { createOrderRequest } from "@/lib/order-request-actions";
import { prisma } from "@/lib/prisma";

type OrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    requestCreated?: string;
    requestError?: string;
  }>;
};

const RETURN_WINDOW_DAYS = 15;

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

function getPaymentStatusClass(status?: string) {
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

function getRequestErrorMessage(
  error?: string,
) {
  switch (error) {
    case "invalid":
      return "Talep sebebinizi en az 3 karakter olacak şekilde yazmalısınız.";

    case "not-found":
      return "Sipariş bulunamadı.";

    case "pending":
      return "Bu sipariş için zaten incelenmekte olan bir talebiniz var.";

    case "approved":
      return "Bu sipariş için daha önce onaylanmış bir talep bulunuyor.";

    case "cancelled":
      return "İptal edilmiş bir sipariş için yeni talep oluşturulamaz.";

    case "refunded":
      return "Bu siparişin ödemesi zaten iade edilmiş. Yeni bir talep oluşturulamaz.";

    case "payment":
      return "Bu sipariş için tamamlanmış bir ödeme bulunamadı.";

    case "delivery-date":
      return "Siparişin teslim tarihi bulunamadığı için iade talebi oluşturulamıyor.";

    case "return-expired":
      return "Bu sipariş için 15 günlük iade talebi süresi sona ermiş.";

    case "not-allowed":
      return "Siparişin mevcut durumunda iptal veya iade talebi oluşturulamaz.";

    case "1":
      return "Talep oluşturulurken bir hata meydana geldi.";

    default:
      return null;
  }
}

function getReturnDeadline(
  deliveredAt: Date,
) {
  return new Date(
    deliveredAt.getTime() +
      RETURN_WINDOW_DAYS *
        24 *
        60 *
        60 *
        1000,
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
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M3 6h11v10H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  );
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: OrderDetailPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const {
    requestCreated,
    requestError,
  } = await searchParams;

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: session.user.id,
    },

    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              category: true,
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
          amount: true,
          currency: true,
          paidAt: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const total =
    moneyToNumber(order.total);

  const items = order.items.map((item) => ({
    ...item,
    unitPrice:
      moneyToNumber(item.unitPrice),
  }));

  const latestPayment =
    order.payments[0];

  const paymentAlreadyRefunded =
    latestPayment?.status ===
    "REFUNDED";

  const shippingName =
    [
      order.shippingFirstName,
      order.shippingLastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Belirtilmemiş";

  const shippingPhone =
    order.shippingPhone
      ? [
          order.shippingPhoneCountryCode,
          order.shippingPhone,
        ]
          .filter(Boolean)
          .join(" ")
      : "Belirtilmemiş";

  const shippingLocation =
    [
      order.shippingPostalCode,
      order.shippingCity,
      order.shippingCountryCode,
    ]
      .filter(Boolean)
      .join(" · ");

  const hasShippingTracking =
    Boolean(order.shippingCarrier) ||
    Boolean(order.shippingTrackingNumber) ||
    Boolean(order.shippingTrackingUrl);

  const returnDeadline =
    order.deliveredAt
      ? getReturnDeadline(
          order.deliveredAt,
        )
      : null;

  const returnWindowExpired =
    returnDeadline
      ? new Date() > returnDeadline
      : false;

  const canCreateCancellationRequest =
    order.status === "PROCESSING" &&
    !paymentAlreadyRefunded &&
    order.requestStatus !== "PENDING" &&
    order.requestStatus !== "APPROVED";

  const canCreateReturnRequest =
    order.status === "DELIVERED" &&
    Boolean(order.deliveredAt) &&
    !returnWindowExpired &&
    !paymentAlreadyRefunded &&
    order.requestStatus !== "PENDING" &&
    order.requestStatus !== "APPROVED";

  const canCreateRequest =
    canCreateCancellationRequest ||
    canCreateReturnRequest;

  const requestTitle =
    canCreateCancellationRequest
      ? "İptal Talebi Oluştur"
      : "İade Talebi Oluştur";

  const requestDescription =
    canCreateCancellationRequest
      ? "Siparişiniz henüz kargoya verilmedi. İptal talebiniz yönetici tarafından incelendikten sonra ödeme iadesi gerçekleştirilebilir."
      : "Teslim edilen siparişiniz için teslim tarihinden itibaren 15 gün içinde iade talebi oluşturabilirsiniz. Talebiniz yönetici tarafından incelendikten sonra ödeme iadesi gerçekleştirilebilir.";

  const requestErrorMessage =
    getRequestErrorMessage(
      requestError,
    );

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <section className="page-section page-content max-w-6xl">
          <div className="mb-8">
            <Link
              href="/orders"
              className="text-sm font-semibold text-brand transition hover:opacity-70"
            >
              ← Siparişlerime Dön
            </Link>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">
              Sipariş Detayı
            </p>

            <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
              <div>
                <h1 className="display-title text-4xl text-text sm:text-5xl">
                  Siparişiniz
                </h1>

                <p className="mt-3 break-all text-sm text-text-muted">
                  Sipariş No: {order.id}
                </p>
              </div>

              <span
                className={`${getStatusClass(
                  order.status,
                )} inline-flex rounded-full px-4 py-2 text-sm font-semibold`}
              >
                {getStatusLabel(order.status)}
              </span>
            </div>
          </div>

          {requestCreated === "1" && (
            <AutoDismissMessage
              message="Talebiniz başarıyla oluşturuldu. Yönetici tarafından incelendikten sonra durum burada güncellenecektir."
              duration={3000}
            />
          )}

          {requestErrorMessage && (
            <div className="status-danger mb-6 rounded-[20px] px-5 py-4 text-sm font-medium leading-6">
              {requestErrorMessage}
            </div>
          )}

          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-6">
              <section className="panel overflow-hidden">
                <div className="border-b border-border p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft">
                    Ürünler
                  </p>

                  <h2 className="mt-2 font-serif text-2xl font-semibold text-text">
                    Sipariş İçeriği
                  </h2>
                </div>

                <div className="divide-y divide-border">
                  {items.map((item) => (
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
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-soft">
                          {item.product.category}
                        </p>

                        <Link
                          href={`/products/${item.product.id}`}
                          className="mt-1 block text-lg font-semibold text-text transition hover:text-brand"
                        >
                          {item.product.name}
                        </Link>

                        <p className="mt-2 text-sm text-text-soft">
                          {item.quantity} adet ×{" "}
                          {formatMoney(
                            item.unitPrice,
                          )}{" "}
                          ₺
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
              </section>

              <section className="panel p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft">
                  Teslimat
                </p>

                <h2 className="mt-2 font-serif text-2xl font-semibold text-text">
                  Teslimat Bilgileri
                </h2>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="panel-soft p-4">
                    <p className="text-xs text-text-muted">
                      Alıcı
                    </p>

                    <p className="mt-1 font-semibold text-text">
                      {shippingName}
                    </p>
                  </div>

                  <div className="panel-soft p-4">
                    <p className="text-xs text-text-muted">
                      Telefon
                    </p>

                    <p className="mt-1 font-semibold text-text">
                      {shippingPhone}
                    </p>
                  </div>
                </div>

                <div className="mt-4 panel-soft p-5">
                  <p className="text-xs text-text-muted">
                    Teslimat Adresi
                  </p>

                  <p className="mt-2 leading-7 text-text-soft">
                    {order.shippingAddress ??
                      "Adres bilgisi bulunamadı."}
                  </p>

                  {shippingLocation && (
                    <p className="mt-2 text-sm text-text-muted">
                      {shippingLocation}
                    </p>
                  )}
                </div>

                {order.deliveredAt && (
                  <div className="mt-4 panel-soft p-5">
                    <p className="text-xs text-text-muted">
                      Teslim Tarihi
                    </p>

                    <p className="mt-1 font-semibold text-text">
                      {order.deliveredAt.toLocaleDateString(
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
                )}
              </section>

              {hasShippingTracking && (
                <section className="rounded-[24px] border border-[#d6e1d0] bg-[#eef4ea] p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand shadow-sm">
                      <TruckIcon />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft">
                        Kargo
                      </p>

                      <h2 className="mt-1 font-serif text-2xl font-semibold text-text">
                        Kargo Bilgileri
                      </h2>

                      {order.shippingCarrier && (
                        <p className="mt-4 font-semibold text-text">
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

                      {order.shippingTrackingUrl && (
                        <a
                          href={
                            order.shippingTrackingUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="secondary-button mt-4 inline-flex px-5 py-2.5 text-sm"
                        >
                          Kargoyu Takip Et →
                        </a>
                      )}
                    </div>
                  </div>
                </section>
              )}
            </div>

            <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              <section className="panel p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft">
                  Sipariş Özeti
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs text-text-muted">
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

                  <div className="border-t border-border pt-4">
                    <p className="text-xs text-text-muted">
                      Ürün Sayısı
                    </p>

                    <p className="mt-1 font-semibold text-text">
                      {items.reduce(
                        (totalCount, item) =>
                          totalCount +
                          item.quantity,
                        0,
                      )}{" "}
                      adet
                    </p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="text-xs text-text-muted">
                      Kargo
                    </p>

                    <p className="mt-1 font-semibold text-[#3f6b46]">
                      Ücretsiz
                    </p>
                  </div>

                  <div className="border-t border-border pt-5">
                    <p className="text-sm text-text-muted">
                      Genel Toplam
                    </p>

                    <p className="mt-1 text-3xl font-bold tracking-tight text-brand">
                      {formatMoney(total)} ₺
                    </p>
                  </div>
                </div>
              </section>

              <section className="panel p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft">
                  Ödeme
                </p>

                <h2 className="mt-2 font-serif text-xl font-semibold text-text">
                  Ödeme Durumu
                </h2>

                <span
                  className={`${getPaymentStatusClass(
                    latestPayment?.status,
                  )} mt-4 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold`}
                >
                  {getPaymentStatusLabel(
                    latestPayment?.status,
                  )}
                </span>

                {latestPayment && (
                  <div className="mt-5 space-y-3 text-sm">
                    <div>
                      <p className="text-text-muted">
                        Tutar
                      </p>

                      <p className="mt-1 font-semibold text-text">
                        {formatMoney(
                          latestPayment.amount,
                        )}{" "}
                        {latestPayment.currency}
                      </p>
                    </div>

                    {latestPayment.paidAt && (
                      <div>
                        <p className="text-text-muted">
                          Ödeme Tarihi
                        </p>

                        <p className="mt-1 font-semibold text-text">
                          {latestPayment.paidAt.toLocaleDateString(
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
                    )}
                  </div>
                )}
              </section>

              {order.requestStatus && (
                <section className="panel p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft">
                    İptal / İade
                  </p>

                  <h2 className="mt-2 font-serif text-xl font-semibold text-text">
                    {getRequestTypeLabel(
                      order.requestType,
                    )}
                  </h2>

                  <span
                    className={`${getRequestStatusClass(
                      order.requestStatus,
                    )} mt-4 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold`}
                  >
                    {getRequestStatusLabel(
                      order.requestStatus,
                    )}
                  </span>

                  {order.requestReason && (
                    <div className="mt-5 rounded-2xl bg-surface-soft p-4">
                      <p className="text-xs text-text-muted">
                        Talep Sebebi
                      </p>

                      <p className="mt-2 text-sm leading-6 text-text-soft">
                        {order.requestReason}
                      </p>
                    </div>
                  )}

                  {order.requestCreatedAt && (
                    <p className="mt-4 text-xs text-text-muted">
                      Talep Tarihi:{" "}
                      {order.requestCreatedAt.toLocaleDateString(
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
                  )}

                  {order.requestStatus ===
                    "PENDING" && (
                    <p className="mt-4 text-sm leading-6 text-text-soft">
                      Talebiniz yönetici tarafından
                      inceleniyor.
                    </p>
                  )}

                  {order.requestStatus ===
                    "APPROVED" && (
                    <p className="mt-4 text-sm leading-6 text-text-soft">
                      Talebiniz onaylandı. Ödeme iadesi
                      tamamlandığında ödeme durumunda
                      görüntülenecektir.
                    </p>
                  )}

                  {order.requestStatus ===
                    "REJECTED" && (
                    <p className="mt-4 text-sm leading-6 text-text-soft">
                      Talebiniz reddedildi. Gerekirse
                      destek ekibiyle iletişime
                      geçebilirsiniz.
                    </p>
                  )}
                </section>
              )}

              {order.status ===
                "DELIVERED" &&
                order.deliveredAt &&
                returnDeadline &&
                !paymentAlreadyRefunded && (
                  <section className="panel p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft">
                      İade Süresi
                    </p>

                    <h2 className="mt-2 font-serif text-xl font-semibold text-text">
                      15 Günlük İade Hakkı
                    </h2>

                    {returnWindowExpired ? (
                      <div className="status-neutral mt-4 rounded-2xl px-4 py-4 text-sm leading-6">
                        Bu sipariş için 15 günlük iade talebi
                        süresi sona erdi.
                      </div>
                    ) : (
                      <>
                        <p className="mt-3 text-sm leading-6 text-text-soft">
                          İade talebinizi aşağıdaki tarihe
                          kadar oluşturabilirsiniz.
                        </p>

                        <p className="mt-3 font-semibold text-brand">
                          {returnDeadline.toLocaleDateString(
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
                      </>
                    )}
                  </section>
                )}

              {order.status ===
                "SHIPPED" &&
                !paymentAlreadyRefunded && (
                  <section className="panel p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft">
                      İade
                    </p>

                    <p className="mt-2 text-sm leading-6 text-text-soft">
                      Ürün teslim edildikten sonra 15 gün
                      içinde iade talebi oluşturabilirsiniz.
                    </p>
                  </section>
                )}

              {canCreateRequest && (
                <section className="panel p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft">
                    İptal / İade
                  </p>

                  <h2 className="mt-2 font-serif text-xl font-semibold text-text">
                    {requestTitle}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-text-soft">
                    {requestDescription}
                  </p>

                  {order.requestStatus ===
                    "REJECTED" && (
                    <div className="status-warning mt-4 rounded-2xl px-4 py-3 text-xs leading-5">
                      Önceki talebiniz reddedildi. Yeni bir
                      talep oluşturabilirsiniz.
                    </div>
                  )}

                  <form
                    action={createOrderRequest}
                    className="mt-5"
                  >
                    <input
                      type="hidden"
                      name="orderId"
                      value={order.id}
                    />

                    <label
                      htmlFor="reason"
                      className="text-sm font-semibold text-text"
                    >
                      Talep Sebebi
                    </label>

                    <textarea
                      id="reason"
                      name="reason"
                      rows={4}
                      required
                      minLength={3}
                      maxLength={500}
                      placeholder={
                        canCreateCancellationRequest
                          ? "Siparişi neden iptal etmek istediğinizi yazın."
                          : "Ürünü neden iade etmek istediğinizi yazın."
                      }
                      className="field mt-2 resize-y px-4 py-3 text-sm placeholder:text-text-muted"
                    />

                    <button
                      type="submit"
                      className="mt-4 w-full rounded-xl border border-[#d8a9a2] bg-[#fff4f2] px-5 py-3 text-sm font-semibold text-[#9a4138] transition hover:bg-[#fde7e3]"
                    >
                      {requestTitle}
                    </button>
                  </form>
                </section>
              )}

              <Link
                href="/support"
                className="secondary-button flex w-full items-center justify-center px-5 py-3 text-sm"
              >
                Sipariş İçin Destek Al
              </Link>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}