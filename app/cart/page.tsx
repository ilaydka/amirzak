import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import CartItemCard from "@/components/CartItemCard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";

export default async function CartPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

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
    (total, item) => total + item.product.price * item.quantity,
    0,
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

            <h1 className="mt-3 text-4xl font-bold">Sepetim</h1>
          </div>

          {cartItems.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
              <h2 className="text-2xl font-bold">Sepetiniz boş</h2>

              <p className="mt-3 text-zinc-400">
                Sepetinize henüz bir ürün eklemediniz.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-block rounded-lg bg-red-600 px-6 py-3 font-semibold transition hover:bg-red-500"
              >
                Ürünleri İncele
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItemCard key={item.id} item={item} />
                ))}
              </div>

              <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <h2 className="text-xl font-bold">Sipariş Özeti</h2>

                <div className="mt-6 flex items-center justify-between text-zinc-300">
                  <span>Ara toplam</span>
                  <span>{subtotal.toLocaleString("tr-TR")} ₺</span>
                </div>

                <div className="mt-4 flex items-center justify-between text-zinc-300">
                  <span>Kargo</span>
                  <span>Ücretsiz</span>
                </div>

                <div className="mt-6 border-t border-zinc-800 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Genel toplam</span>
                    <span className="text-2xl font-bold">
                      {subtotal.toLocaleString("tr-TR")} ₺
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-6 w-full rounded-lg bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-500"
                >
                  Siparişi Tamamla
                </button>
              </aside>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}