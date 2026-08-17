import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";

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

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

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

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
        <section className="mx-auto max-w-5xl">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
              Hesabım
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Siparişlerim
            </h1>

            <p className="mt-3 text-zinc-400">
              Geçmiş siparişlerinizi ve sipariş durumlarını buradan
              takip edebilirsiniz.
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
              <h2 className="text-2xl font-bold">
                Henüz siparişiniz yok
              </h2>

              <p className="mt-3 text-zinc-400">
                İlk siparişinizi oluşturmak için ürünleri inceleyebilirsiniz.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-block rounded-lg bg-red-600 px-6 py-3 font-semibold transition hover:bg-red-500"
              >
                Ürünleri İncele
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 p-6">
                    <div>
                      <p className="text-sm text-zinc-500">
                        Sipariş Tarihi
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

                    <div className="text-right">
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
                                : "mt-1 font-semibold"
                        }
                        style={
                          order.status === "SHIPPED"
                            ? {
                                color: "#3b82f6",
                              }
                            : undefined
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
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-800">
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
                          <Link
                            href={`/products/${item.productId}`}
                            className="text-lg font-semibold transition hover:text-red-400"
                          >
                            {item.product.name}
                          </Link>

                          <p className="mt-2 text-sm text-zinc-400">
                            Adet: {item.quantity}
                          </p>

                          <p className="mt-1 text-sm text-zinc-400">
                            Birim fiyat:{" "}
                            {item.unitPrice.toLocaleString(
                              "tr-TR",
                            )}{" "}
                            ₺
                          </p>
                        </div>

                        <p className="text-lg font-bold">
                          {(
                            item.unitPrice *
                            item.quantity
                          ).toLocaleString(
                            "tr-TR",
                          )}{" "}
                          ₺
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-950/40 p-6">
                    <span className="font-semibold">
                      Sipariş Toplamı
                    </span>

                    <span className="text-2xl font-bold">
                      {order.total.toLocaleString("tr-TR")} ₺
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}