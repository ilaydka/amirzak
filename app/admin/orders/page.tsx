import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import OrderStatusMessage from "@/components/OrderStatusMessage";
import { updateOrderStatus } from "@/lib/admin-order-actions";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

type AdminOrdersPageProps = {
  searchParams: Promise<{
    updated?: string;
    error?: string;
  }>;
};

function getStatusLabel(status: string) {
  switch (status) {
    case "PENDING":
      return "Beklemede";

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

function getNextStatuses(status: string) {
  switch (status) {
    case "PENDING":
      return [
        {
          value: "PROCESSING",
          label: "Hazırlanıyor",
        },
        {
          value: "CANCELLED",
          label: "İptal Et",
        },
      ];

    case "PROCESSING":
      return [
        {
          value: "SHIPPED",
          label: "Kargoda",
        },
        {
          value: "CANCELLED",
          label: "İptal Et",
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

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  await requireAdmin();

  const { updated, error } = await searchParams;

  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: {
          name: true,
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
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
        <section className="mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
              Yönetim Paneli
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Sipariş Yönetimi
            </h1>

            <p className="mt-3 text-zinc-400">
              Gelen siparişleri görüntüleyebilir ve
              sipariş durumlarını yönetebilirsiniz.
            </p>
          </div>

          {updated === "1" && (
            <OrderStatusMessage message="Sipariş durumu başarıyla güncellendi." />
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

          {error === "invalid-transition" && (
            <OrderStatusMessage
              type="error"
              message="Bu sipariş için seçilen durum geçişine izin verilmiyor."
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

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
              <h2 className="text-2xl font-bold">
                Henüz sipariş yok
              </h2>

              <p className="mt-3 text-zinc-400">
                Oluşturulan siparişler burada görüntülenecek.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const nextStatuses =
                  getNextStatuses(order.status);

                return (
                  <article
                    key={order.id}
                    className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
                  >
                    <div className="grid gap-6 border-b border-zinc-800 p-6 md:grid-cols-4">
                      <div>
                        <p className="text-sm text-zinc-500">
                          Müşteri
                        </p>

                        <p className="mt-1 font-semibold">
                          {order.user.name ??
                            "İsimsiz Kullanıcı"}
                        </p>

                        <p className="mt-1 text-sm text-zinc-400">
                          {order.user.email ?? "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-zinc-500">
                          Tarih
                        </p>

                        <p className="mt-1 font-semibold">
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
                        <p className="text-sm text-zinc-500">
                          Toplam
                        </p>

                        <p className="mt-1 text-xl font-bold">
                          {order.total.toLocaleString(
                            "tr-TR",
                          )}{" "}
                          ₺
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-zinc-500">
                          Durum
                        </p>

                        <p
                          className={
                            order.status === "PROCESSING"
                              ? "mt-1 font-semibold text-yellow-400"
                              : order.status === "DELIVERED"
                                ? "mt-1 font-semibold text-green-400"
                                : order.status === "CANCELLED"
                                  ? "mt-1 font-semibold text-red-500"
                                  : order.status === "SHIPPED"
                                    ? "mt-1 font-semibold text-blue-400"
                                    : "mt-1 font-semibold text-zinc-300"
                          }
                        >
                          {getStatusLabel(order.status)}
                        </p>
                      </div>
                    </div>

                    <div className="divide-y divide-zinc-800">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center"
                        >
                          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-800">
                            {item.product.imageUrl ? (
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="h-full w-full object-contain p-2"
                              />
                            ) : (
                              <span className="text-xs text-zinc-500">
                                Görsel Yok
                              </span>
                            )}
                          </div>

                          <div className="flex-1">
                            <p className="font-semibold">
                              {item.product.name}
                            </p>

                            <p className="mt-1 text-sm text-zinc-400">
                              {item.quantity} adet ×{" "}
                              {item.unitPrice.toLocaleString(
                                "tr-TR",
                              )}{" "}
                              ₺
                            </p>
                          </div>

                          <p className="font-bold">
                            {(
                              item.quantity *
                              item.unitPrice
                            ).toLocaleString(
                              "tr-TR",
                            )}{" "}
                            ₺
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-zinc-800 bg-zinc-950/40 p-6">
                      {nextStatuses.length > 0 ? (
                        <form
                          action={updateOrderStatus}
                          className="flex flex-wrap items-center gap-3"
                        >
                          <input
                            type="hidden"
                            name="orderId"
                            value={order.id}
                          />

                          <select
                            name="status"
                            defaultValue=""
                            required
                            className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-red-500"
                          >
                            <option
                              value=""
                              disabled
                            >
                              Yeni durum seç
                            </option>

                            {nextStatuses.map(
                              (status) => (
                                <option
                                  key={status.value}
                                  value={status.value}
                                >
                                  {status.label}
                                </option>
                              ),
                            )}
                          </select>

                          <button
                            type="submit"
                            className="rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold transition hover:bg-red-500"
                          >
                            Durumu Güncelle
                          </button>
                        </form>
                      ) : (
                        <p className="text-sm text-zinc-400">
                          {order.status === "DELIVERED"
                            ? "Bu sipariş teslim edilmiştir."
                            : "Bu sipariş iptal edilmiştir."}
                        </p>
                      )}
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