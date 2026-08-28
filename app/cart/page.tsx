import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import CartItemCard from "@/components/CartItemCard";
import CheckoutButton from "@/components/CheckoutButton";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  moneyToNumber,
  optionalMoneyToNumber,
} from "@/lib/money";
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

function EmptyCartIcon() {
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
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 8H6" />
    </svg>
  );
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

  const normalizedCartItems =
    cartItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        name: item.product.name,
        category: item.product.category,
        price: moneyToNumber(
          item.product.price,
        ),
        discountPrice:
          optionalMoneyToNumber(
            item.product.discountPrice,
          ),
        imageUrl:
          item.product.imageUrl,
        stock: item.product.stock,
        isActive:
          item.product.isActive,
      },
    }));

  const subtotal =
    normalizedCartItems.reduce(
      (total, item) => {
        const currentPrice =
          getCurrentPrice(
            item.product.price,
            item.product.discountPrice,
          );

        return (
          total +
          currentPrice *
            item.quantity
        );
      },
      0,
    );

  const totalItemCount =
    normalizedCartItems.reduce(
      (total, item) =>
        total + item.quantity,
      0,
    );

  const hasInactiveProduct =
    normalizedCartItems.some(
      (item) =>
        !item.product.isActive,
    );

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <section className="page-section page-content max-w-5xl">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">
              Alışveriş Sepeti
            </p>

            <h1 className="display-title mt-3 text-4xl text-text sm:text-5xl">
              Sepetim
            </h1>

            {normalizedCartItems.length >
              0 && (
              <p className="mt-3 text-text-soft">
                Sepetinizde toplam{" "}
                {totalItemCount} ürün
                var.
              </p>
            )}
          </div>

          {orderSuccess ? (
            <div className="status-success rounded-[22px] p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3f6b46] text-lg font-bold text-white">
                  ✓
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-2xl font-semibold">
                    Siparişiniz
                    başarıyla
                    oluşturuldu.
                  </h2>

                  <p className="mt-2 text-sm opacity-80">
                    Siparişinizi
                    hesabınızdan takip
                    edebilir veya
                    alışverişe devam
                    edebilirsiniz.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/products"
                      className="brand-button px-6 py-3 text-sm"
                    >
                      Alışverişe Devam
                      Et
                    </Link>

                    <Link
                      href="/orders"
                      className="secondary-button px-6 py-3 text-sm"
                    >
                      Siparişlerimi Gör
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : normalizedCartItems.length ===
            0 ? (
            <div className="empty-state flex min-h-[310px] flex-col items-center justify-center px-6 py-12 text-center sm:px-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-pale text-brand">
                <EmptyCartIcon />
              </div>

              <div className="mt-5 flex flex-col items-center">
                <h2 className="font-serif text-2xl font-semibold text-text">
                  Sepetiniz boş
                </h2>

                <p className="mt-6 max-w-md text-center text-sm leading-6 text-text-soft">
                  Henüz sepetinize bir
                  ürün eklemediniz.
                  AMİRZAK bitki ve
                  çiçek koleksiyonunu
                  keşfederek
                  alışverişe
                  başlayabilirsiniz.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/products"
                  className="brand-button px-6 py-3 text-sm"
                >
                  Bitkileri Keşfet
                </Link>

                <Link
                  href="/orders"
                  className="secondary-button px-6 py-3 text-sm"
                >
                  Siparişlerimi Gör
                </Link>
              </div>
            </div>
          ) : (
            <>
              {hasInactiveProduct && (
                <div className="status-danger mb-6 rounded-2xl p-5 text-sm font-medium leading-6">
                  Sepetinizde artık
                  satışta olmayan bir
                  ürün bulunuyor.
                  Sipariş vermeden önce
                  bu ürünü sepetinizden
                  kaldırın.
                </div>
              )}

              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-4">
                  {normalizedCartItems.map(
                    (item) => (
                      <CartItemCard
                        key={item.id}
                        item={item}
                      />
                    ),
                  )}
                </div>

                <aside className="panel h-fit p-6 lg:sticky lg:top-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft">
                    Özet
                  </p>

                  <h2 className="mt-2 font-serif text-2xl font-semibold text-text">
                    Sipariş Özeti
                  </h2>

                  <div className="mt-6 space-y-4 text-sm text-text-soft">
                    <div className="flex items-center justify-between gap-4">
                      <span>
                        Ara toplam
                      </span>

                      <span className="font-semibold text-text">
                        {subtotal.toLocaleString(
                          "tr-TR",
                        )}{" "}
                        ₺
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span>
                        Kargo
                      </span>

                      <span className="font-semibold text-[#3f6b46]">
                        Ücretsiz
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-border pt-6">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-text-soft">
                          Genel toplam
                        </p>

                        <p className="mt-1 text-xs text-text-muted">
                          KDV dahil
                        </p>
                      </div>

                      <span className="text-2xl font-bold tracking-tight text-brand">
                        {subtotal.toLocaleString(
                          "tr-TR",
                        )}{" "}
                        ₺
                      </span>
                    </div>
                  </div>

                  {!hasInactiveProduct && (
                    <div className="mt-6">
                      <CheckoutButton />
                    </div>
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