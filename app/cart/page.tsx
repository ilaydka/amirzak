import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import CartItemCard from "@/components/CartItemCard";
import CheckoutButton from "@/components/CheckoutButton";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";

type CartPageProps = {
  searchParams: Promise<{
    orderSuccess?: string;
  }>;
};

function getCurrentPrice(
  price: number,
  discountPrice: number | null,
) {
  if (
    discountPrice !== null &&
    discountPrice < price
  ) {
    return discountPrice;
  }

  return price;
}

export default async function CartPage({
  searchParams,
}: CartPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { orderSuccess } = await searchParams;

  const cart = await prisma.cart.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      items: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          product: true,
        },
      },
    },
  });

  const cartItems = cart?.items ?? [];

  const subtotal = cartItems.reduce(
    (total, item) => {
      const currentPrice = getCurrentPrice(
        item.product.price,
        item.product.discountPrice,
      );

      return total + currentPrice * item.quantity;
    },
    0,
  );

  const totalItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const hasInactiveProduct = cartItems.some(
    (item) => !item.product.isActive,
  );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
        <section className="mx-auto max-w-5xl">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
              Alışveriş Sepeti
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Sepetim
            </h1>

            {cartItems.length > 0 && (
              <p className="mt-3 text-zinc-400">
                Sepetinizde toplam {totalItemCount} ürün var.
              </p>
            )}
          </div>

          {orderSuccess ? (
            <div className="rounded-2xl border border-green-800 bg-green-950 p-8">
              <h2 className="text-2xl font-bold text-green-300">
                Siparişiniz başarıyla oluşturuldu.
              </h2>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-500"
                >
                  Alışverişe Devam Et
                </Link>

                <Link
                  href="/orders"
                  className="rounded-lg border border-green-700 px-6 py-3 font-semibold text-green-200 transition hover:border-green-500 hover:text-white"
                >
                  Siparişlerimi Gör
                </Link>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
              <h2 className="text-2xl font-bold">
                Sepetiniz boş
              </h2>

              <p className="mt-3 text-zinc-400">
                Sepetinize henüz bir ürün eklemediniz.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/products"
                  className="rounded-lg bg-red-600 px-6 py-3 font-semibold transition hover:bg-red-500"
                >
                  Ürünleri İncele
                </Link>

                <Link
                  href="/orders"
                  className="rounded-lg border border-zinc-700 px-6 py-3 font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                >
                  Siparişlerimi Gör
                </Link>
              </div>
            </div>
          ) : (
            <>
              {hasInactiveProduct && (
                <div className="mb-6 rounded-2xl border border-red-900 bg-red-950 p-5 text-red-300">
                  Sepetinizde artık satışta olmayan bir ürün bulunuyor.
                  Sipariş vermeden önce bu ürünü sepetinizden kaldırın.
                </div>
              )}

              <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                    />
                  ))}
                </div>

                <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                  <h2 className="text-xl font-bold">
                    Sipariş Özeti
                  </h2>

                  <div className="mt-6 flex items-center justify-between text-zinc-300">
                    <span>Ara toplam</span>

                    <span>
                      {subtotal.toLocaleString("tr-TR")} ₺
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-zinc-300">
                    <span>Kargo</span>
                    <span>Ücretsiz</span>
                  </div>

                  <div className="mt-6 border-t border-zinc-800 pt-6">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        Genel toplam
                      </span>

                      <span className="text-2xl font-bold">
                        {subtotal.toLocaleString("tr-TR")} ₺
                      </span>
                    </div>
                  </div>

                  {!hasInactiveProduct && (
                    <CheckoutButton />
                  )}
                </aside>
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}