import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import CheckoutForm from "@/components/CheckoutForm";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  moneyToNumber,
  optionalMoneyToNumber,
} from "@/lib/money";
import { prisma } from "@/lib/prisma";

type CheckoutPageProps = {
  searchParams: Promise<{
    productId?: string;
    quantity?: string;
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

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;

  const productId = params.productId
    ? Number(params.productId)
    : undefined;

  const quantity = params.quantity
    ? Number(params.quantity)
    : 1;

  const isBuyNow =
    productId !== undefined &&
    Number.isInteger(productId) &&
    productId > 0 &&
    Number.isInteger(quantity) &&
    quantity > 0;

  const [user, cart, directProduct] =
    await Promise.all([
      prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: {
          firstName: true,
          lastName: true,
          name: true,
          email: true,
          phoneCountryCode: true,
          phone: true,
          countryCode: true,
          city: true,
          postalCode: true,
          address: true,
        },
      }),

      isBuyNow
        ? Promise.resolve(null)
        : prisma.cart.findUnique({
            where: {
              userId: session.user.id,
            },
            include: {
              items: {
                include: {
                  product: true,
                },
                orderBy: {
                  createdAt: "desc",
                },
              },
            },
          }),

      isBuyNow && productId !== undefined
        ? prisma.product.findUnique({
            where: {
              id: productId,
            },
          })
        : Promise.resolve(null),
    ]);

  if (!user) {
    redirect("/login");
  }

  if (isBuyNow && !directProduct) {
    redirect("/products");
  }

  const cartItems = cart?.items ?? [];

  if (!isBuyNow && cartItems.length === 0) {
    redirect("/cart");
  }

  const normalizedDirectProduct =
    directProduct
      ? {
          ...directProduct,
          price: moneyToNumber(
            directProduct.price,
          ),
          discountPrice:
            optionalMoneyToNumber(
              directProduct.discountPrice,
            ),
        }
      : null;

  const normalizedCartItems =
    cartItems.map((item) => ({
      ...item,
      product: {
        ...item.product,
        price: moneyToNumber(
          item.product.price,
        ),
        discountPrice:
          optionalMoneyToNumber(
            item.product.discountPrice,
          ),
      },
    }));

  const hasUnavailableProduct = isBuyNow
    ? !normalizedDirectProduct?.isActive ||
      normalizedDirectProduct.stock < quantity
    : normalizedCartItems.some(
        (item) =>
          !item.product.isActive ||
          item.product.stock < item.quantity,
      );

  const subtotal =
    isBuyNow && normalizedDirectProduct
      ? getCurrentPrice(
          normalizedDirectProduct.price,
          normalizedDirectProduct.discountPrice,
        ) * quantity
      : normalizedCartItems.reduce(
          (total, item) => {
            const unitPrice = getCurrentPrice(
              item.product.price,
              item.product.discountPrice,
            );

            return (
              total +
              unitPrice * item.quantity
            );
          },
          0,
        );

  const fullName =
    [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ") ||
    user.name ||
    "Belirtilmemiş";

  const hasCompleteAddress =
    Boolean(user.phone?.trim()) &&
    Boolean(user.city?.trim()) &&
    Boolean(user.address?.trim());

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <section className="page-section page-content max-w-6xl">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">
              Güvenli Ödeme
            </p>

            <h1 className="display-title mt-3 text-4xl text-text sm:text-5xl">
              Siparişi Tamamla
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-text-soft">
              Teslimat bilgilerinizi kontrol edin ve güvenli ödeme adımına geçin.
            </p>
          </div>

          {hasUnavailableProduct && (
            <div className="status-danger mb-6 rounded-2xl p-5 text-sm font-medium leading-6">
              Seçtiğiniz ürünlerden biri için yeterli stok bulunmuyor veya ürün artık satışta değil.
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-6">
              <section className="panel p-6 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-soft">
                      Teslimat
                    </p>

                    <h2 className="mt-2 font-serif text-2xl font-semibold text-text">
                      Teslimat Bilgileri
                    </h2>
                  </div>

                  <Link
                    href="/profile/edit"
                    className="secondary-button px-4 py-2.5 text-sm"
                  >
                    Bilgileri Düzenle
                  </Link>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div className="panel-soft p-4">
                    <p className="text-sm text-text-muted">
                      Ad Soyad
                    </p>

                    <p className="mt-1.5 font-semibold text-text">
                      {fullName}
                    </p>
                  </div>

                  <div className="panel-soft p-4">
                    <p className="text-sm text-text-muted">
                      E-posta
                    </p>

                    <p className="mt-1.5 break-all font-semibold text-text">
                      {user.email ?? "Belirtilmemiş"}
                    </p>
                  </div>

                  <div className="panel-soft p-4">
                    <p className="text-sm text-text-muted">
                      Telefon
                    </p>

                    <p className="mt-1.5 font-semibold text-text">
                      {user.phone
                        ? `${user.phoneCountryCode ?? ""} ${user.phone}`
                        : "Belirtilmemiş"}
                    </p>
                  </div>

                  <div className="panel-soft p-4">
                    <p className="text-sm text-text-muted">
                      Şehir
                    </p>

                    <p className="mt-1.5 font-semibold text-text">
                      {user.city ?? "Belirtilmemiş"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-border bg-surface-soft p-5">
                  <p className="text-sm text-text-muted">
                    Teslimat Adresi
                  </p>

                  <p className="mt-2 leading-7 text-text-soft">
                    {user.address ??
                      "Adres bilgisi eklenmemiş."}
                  </p>

                  {(user.postalCode ||
                    user.countryCode) && (
                    <p className="mt-2 text-sm text-text-muted">
                      {[
                        user.postalCode,
                        user.countryCode,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>

                {!hasCompleteAddress && (
                  <div className="status-warning mt-6 rounded-2xl p-4 text-sm font-medium leading-6">
                    Sipariş verebilmek için telefon, şehir ve açık adres bilgilerinizi tamamlayın.
                  </div>
                )}
              </section>

              <section className="panel p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-soft">
                  Ödeme
                </p>

                <h2 className="mt-2 font-serif text-2xl font-semibold text-text">
                  Güvenli Ödeme
                </h2>

                <p className="mt-2 text-sm leading-6 text-text-soft">
                  Kart bilgileriniz iyzico güvenli ödeme altyapısı üzerinden işlenecektir.
                </p>

                <CheckoutForm
                  disabled={
                    !hasCompleteAddress ||
                    hasUnavailableProduct
                  }
                  productId={
                    isBuyNow
                      ? productId
                      : undefined
                  }
                  quantity={
                    isBuyNow
                      ? quantity
                      : undefined
                  }
                />
              </section>
            </div>

            <aside className="panel h-fit p-6 lg:sticky lg:top-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft">
                Özet
              </p>

              <h2 className="mt-2 font-serif text-2xl font-semibold text-text">
                Sipariş Özeti
              </h2>

              <div className="mt-6 space-y-5">
                {isBuyNow && normalizedDirectProduct ? (
                  <div className="flex gap-4 rounded-2xl border border-border bg-surface-soft p-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface">
                      {normalizedDirectProduct.imageUrl ? (
                        <img
                          src={normalizedDirectProduct.imageUrl}
                          alt={normalizedDirectProduct.name}
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <span className="text-[10px] text-text-muted">
                          Görsel Yok
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-text">
                        {normalizedDirectProduct.name}
                      </p>

                      <p className="mt-1 text-sm text-text-muted">
                        {quantity} adet
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-semibold text-brand">
                      {(
                        getCurrentPrice(
                          normalizedDirectProduct.price,
                          normalizedDirectProduct.discountPrice,
                        ) * quantity
                      ).toLocaleString("tr-TR")}{" "}
                      ₺
                    </p>
                  </div>
                ) : (
                  normalizedCartItems.map((item) => {
                    const unitPrice =
                      getCurrentPrice(
                        item.product.price,
                        item.product.discountPrice,
                      );

                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 rounded-2xl border border-border bg-surface-soft p-3"
                      >
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface">
                          {item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="h-full w-full object-contain p-2"
                            />
                          ) : (
                            <span className="text-[10px] text-text-muted">
                              Görsel Yok
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-text">
                            {item.product.name}
                          </p>

                          <p className="mt-1 text-sm text-text-muted">
                            {item.quantity} adet
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-semibold text-brand">
                          {(
                            unitPrice *
                            item.quantity
                          ).toLocaleString("tr-TR")}{" "}
                          ₺
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-6 border-t border-border pt-6">
                <div className="flex items-center justify-between text-text-soft">
                  <span>Ara toplam</span>

                  <span className="font-semibold text-text">
                    {subtotal.toLocaleString("tr-TR")} ₺
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-text-soft">
                  <span>Kargo</span>

                  <span className="font-semibold text-[#3f6b46]">
                    Ücretsiz
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
                  <span className="font-semibold text-text">
                    Toplam
                  </span>

                  <span className="text-2xl font-bold tracking-tight text-brand">
                    {subtotal.toLocaleString("tr-TR")} ₺
                  </span>
                </div>
              </div>

              <Link
                href={
                  isBuyNow && normalizedDirectProduct
                    ? `/products/${normalizedDirectProduct.id}`
                    : "/cart"
                }
                className="ghost-button mt-6 w-full px-4 py-3 text-sm"
              >
                ← Geri dön
              </Link>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}