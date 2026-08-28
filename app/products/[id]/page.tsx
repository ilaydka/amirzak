import Link from "next/link";

import { auth } from "@/auth";
import AddToCartForm from "@/components/AddToCartForm";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import ReviewForm from "@/components/ReviewForm";
import ReviewOwnerActions from "@/components/ReviewOwnerActions";
import {
  moneyToNumber,
  optionalMoneyToNumber,
} from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { deleteReview } from "@/lib/review-actions";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function LeafIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M20 4C12 4 6 8 6 15c0 2.8 2.2 5 5 5 7 0 9-8 9-16Z" />
      <path d="M2.5 22c2.5-6 7-10 13.5-13" />
    </svg>
  );
}

function ReviewIcon() {
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
      <path d="M21 12a8 8 0 0 1-8 8H7l-4 2 1.3-4A8 8 0 1 1 21 12Z" />

      <circle
        cx="8"
        cy="12"
        r="0.8"
        fill="currentColor"
        stroke="none"
      />

      <circle
        cx="12"
        cy="12"
        r="0.8"
        fill="currentColor"
        stroke="none"
      />

      <circle
        cx="16"
        cy="12"
        r="0.8"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const session = await auth();

  const productId = Number(id);

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!product || !product.isActive) {
    return (
      <>
        <Navbar />

        <main className="page-shell">
          <section className="page-section page-content flex min-h-[65vh] items-center justify-center">
            <div className="max-w-xl rounded-[30px] border border-border bg-surface px-8 py-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-pale text-brand">
                <LeafIcon />
              </div>

              <h1 className="mt-5 font-serif text-3xl font-semibold text-text">
                Ürün bulunamadı
              </h1>

              <p className="mt-3 leading-7 text-text-soft">
                Aradığınız ürün mevcut değil veya satıştan kaldırılmış olabilir.
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </>
    );
  }

  const productPrice =
    moneyToNumber(product.price);

  const productDiscountPrice =
    optionalMoneyToNumber(
      product.discountPrice,
    );

  const inStock = product.stock > 0;

  const hasDiscount =
    productDiscountPrice !== null &&
    productDiscountPrice < productPrice;

  const currentPrice =
    hasDiscount &&
    productDiscountPrice !== null
      ? productDiscountPrice
      : productPrice;

  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce(
          (total, review) =>
            total + review.rating,
          0,
        ) / product.reviews.length
      : 0;

  const currentUserReview =
    product.reviews.find(
      (review) =>
        review.user.id ===
        session?.user?.id,
    );

  const hasPurchasedProduct =
    session?.user?.id
      ? Boolean(
          await prisma.order.findFirst({
            where: {
              userId:
                session.user.id,
              status: "DELIVERED",
              items: {
                some: {
                  productId:
                    product.id,
                },
              },
            },
            select: {
              id: true,
            },
          }),
        )
      : false;

  const sameCategoryProducts =
    await prisma.product.findMany({
      where: {
        id: {
          not: product.id,
        },
        category: product.category,
        isActive: true,
        approvalStatus: "APPROVED",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
    });

  let relatedProducts =
    sameCategoryProducts;

  if (relatedProducts.length < 4) {
    const extraProducts =
      await prisma.product.findMany({
        where: {
          id: {
            notIn: [
              product.id,
              ...relatedProducts.map(
                (item) => item.id,
              ),
            ],
          },
          isActive: true,
          approvalStatus:
            "APPROVED",
        },
        orderBy: {
          createdAt: "desc",
        },
        take:
          4 -
          relatedProducts.length,
      });

    relatedProducts = [
      ...relatedProducts,
      ...extraProducts,
    ];
  }

  const plantFeatures = [
    product.lightRequirement
      ? {
          label: "Işık İhtiyacı",
          value:
            product.lightRequirement,
        }
      : null,

    product.watering
      ? {
          label: "Sulama",
          value: product.watering,
        }
      : null,

    product.careLevel
      ? {
          label: "Bakım Seviyesi",
          value: product.careLevel,
        }
      : null,

    product.environment
      ? {
          label: "Uygun Ortam",
          value:
            product.environment,
        }
      : null,

    product.plantSize
      ? {
          label: "Boyut",
          value:
            product.plantSize,
        }
      : null,

    product.petSafe !== null
      ? {
          label:
            "Evcil Hayvan Dostu",
          value: product.petSafe
            ? "Evet"
            : "Hayır",
        }
      : null,

    product.bloomSeason
      ? {
          label:
            "Çiçeklenme Dönemi",
          value:
            product.bloomSeason,
        }
      : null,
  ].filter(
    (
      feature,
    ): feature is {
      label: string;
      value: string;
    } => feature !== null,
  );

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <section className="page-section page-content">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-stretch">
            <div className="relative overflow-hidden rounded-[30px] border border-border bg-[#f8f6ef] shadow-sm">
              <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-2">
                {hasDiscount && (
                  <span className="rounded-full border border-[#ead8a8] bg-[#fff4cf] px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#8a6419]">
                    İndirim
                  </span>
                )}

                <span
                  className={
                    inStock
                      ? "rounded-full border border-[#bed5b8] bg-[#e9f2e5] px-4 py-2 text-xs font-semibold text-[#315b34]"
                      : "rounded-full border border-[#e8bdb5] bg-[#fbe8e4] px-4 py-2 text-xs font-semibold text-[#963f35]"
                  }
                >
                  {inStock
                    ? "Stokta"
                    : "Tükendi"}
                </span>
              </div>

              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="block h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[500px] items-center justify-center p-8 text-center">
                  <div>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-pale text-brand">
                      <LeafIcon />
                    </div>

                    <p className="mt-4 font-serif text-xl font-semibold text-text">
                      Ürün görseli
                    </p>

                    <p className="mt-2 text-sm text-text-muted">
                      Bu ürün için görsel yakında eklenecek.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex h-full flex-col rounded-[30px] border border-border bg-surface p-6 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand-pale px-3 py-1.5 text-[11px] font-semibold text-brand">
                  {product.category}
                </span>

                {product.brand && (
                  <span className="rounded-full border border-border bg-white px-3 py-1.5 text-[11px] font-semibold text-text-soft">
                    {product.brand}
                  </span>
                )}
              </div>

              <h1 className="display-title mt-4 text-3xl text-text sm:text-4xl">
                {product.name}
              </h1>

              {product.scientificName && (
                <p className="mt-1.5 font-serif text-base italic text-brand-soft">
                  {
                    product.scientificName
                  }
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {product.reviews
                  .length > 0 ? (
                  <>
                    <span className="text-base text-[#d4a218]">
                      {"★".repeat(
                        Math.round(
                          averageRating,
                        ),
                      )}
                      {"☆".repeat(
                        5 -
                          Math.round(
                            averageRating,
                          ),
                      )}
                    </span>

                    <span className="text-xs text-text-muted">
                      {averageRating.toFixed(
                        1,
                      )}{" "}
                      / 5 ·{" "}
                      {
                        product.reviews
                          .length
                      }{" "}
                      yorum
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-text-muted">
                    Henüz değerlendirme
                    yok
                  </span>
                )}
              </div>

              <div className="mt-5">
                {hasDiscount && (
                  <p className="text-sm text-text-muted line-through">
                    {productPrice.toLocaleString(
                      "tr-TR",
                    )}{" "}
                    ₺
                  </p>
                )}

                <p className="mt-1 text-3xl font-bold tracking-tight text-brand">
                  {currentPrice.toLocaleString(
                    "tr-TR",
                  )}{" "}
                  ₺
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    inStock
                      ? "bg-[#5d8655]"
                      : "bg-[#bd6256]"
                  }`}
                />

                <span className="font-medium text-text-soft">
                  {inStock
                    ? `${product.stock} adet stokta`
                    : "Bu ürün şu anda stokta yok"}
                </span>
              </div>

              {product.description && (
                <div className="mt-5 border-t border-border pt-4">
                  <h2 className="font-serif text-lg font-semibold text-text">
                    Ürün Açıklaması
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-5 text-text-soft">
                    {
                      product.description
                    }
                  </p>
                </div>
              )}

              <div className="mt-auto pt-4">
                <AddToCartForm
                  productId={product.id}
                  disabled={!inStock}
                />

                {inStock ? (
                  <Link
                    href={`/checkout?productId=${product.id}&quantity=1`}
                    className="brand-button mt-3 flex min-h-12 w-full items-center justify-center rounded-xl px-6 py-4 text-sm"
                  >
                    Hemen Sipariş Ver
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="brand-button mt-3 min-h-12 w-full rounded-xl px-6 py-4 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Stokta Yok
                  </button>
                )}
              </div>
            </div>
          </div>

          {plantFeatures.length >
            0 && (
            <div className="mt-6 rounded-[30px] border border-[#d6e1d0] bg-[#eef4ea] p-7 shadow-sm sm:p-9">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand shadow-sm">
                  <LeafIcon />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-soft">
                    Bitki Rehberi
                  </p>

                  <h2 className="mt-1 font-serif text-2xl font-semibold text-text">
                    Bakım Bilgileri
                  </h2>
                </div>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {plantFeatures.map(
                  (feature) => (
                    <div
                      key={
                        feature.label
                      }
                      className="rounded-[20px] border border-[#d5dfcc] bg-white/80 px-5 py-5 shadow-sm"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                        {
                          feature.label
                        }
                      </p>

                      <p className="mt-2 font-semibold leading-6 text-text">
                        {
                          feature.value
                        }
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </section>

        <section className="page-section pb-14">
          <div className="grid items-start gap-10 lg:grid-cols-[1.35fr_0.65fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-soft">
                Değerlendirmeler
              </p>

              <h2 className="mt-3 font-serif text-3xl font-semibold text-text">
                Müşteri Yorumları
              </h2>

              {product.reviews.length ===
              0 ? (
                <div className="mt-6 rounded-[26px] border border-border bg-surface p-7 shadow-sm">
                  <h3 className="font-serif text-xl font-semibold text-text">
                    Henüz yorum
                    yapılmamış
                  </h3>

                  <p className="mt-2 text-text-soft">
                    Bu ürün için ilk
                    değerlendirmeyi teslim
                    alan müşterilerden biri
                    yapabilir.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {product.reviews.map(
                    (review) => {
                      const isOwner =
                        session?.user
                          ?.id ===
                        review.user.id;

                      return (
                        <article
                          key={
                            review.id
                          }
                          className="rounded-[26px] border border-border bg-surface p-6 shadow-sm"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <p className="font-semibold text-text">
                                {review
                                  .user
                                  .name ??
                                  "AMİRZAK Kullanıcısı"}
                              </p>

                              <p className="mt-1 text-xs text-text-muted">
                                {review.createdAt.toLocaleDateString(
                                  "tr-TR",
                                )}
                              </p>
                            </div>

                            <div className="text-lg text-[#d4a218]">
                              {"★".repeat(
                                review.rating,
                              )}
                              {"☆".repeat(
                                5 -
                                  review.rating,
                              )}
                            </div>
                          </div>

                          <p className="mt-4 leading-7 text-text-soft">
                            {
                              review.comment
                            }
                          </p>

                          {isOwner && (
                            <ReviewOwnerActions
                              reviewId={
                                review.id
                              }
                              rating={
                                review.rating
                              }
                              comment={
                                review.comment
                              }
                              deleteAction={
                                deleteReview
                              }
                            />
                          )}
                        </article>
                      );
                    },
                  )}
                </div>
              )}
            </div>

            <div className="lg:sticky lg:top-6">
              {currentUserReview ? (
                <div className="rounded-[26px] border border-border bg-surface p-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-pale font-bold text-brand">
                    ✓
                  </div>

                  <h3 className="mt-4 font-serif text-xl font-semibold text-text">
                    Değerlendirmeniz Alındı
                  </h3>

                  <p className="mt-3 leading-7 text-text-soft">
                    Yorumunuzu mevcut
                    değerlendirme kartınız
                    üzerinden düzenleyebilir
                    veya silebilirsiniz.
                  </p>
                </div>
              ) : hasPurchasedProduct ? (
                <ReviewForm
                  productId={
                    product.id
                  }
                />
              ) : (
                <div className="rounded-[26px] border border-border bg-surface p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-soft">
                        Değerlendirme
                      </p>

                      <h3 className="mt-2 font-serif text-2xl font-semibold text-text">
                        Ürünü Değerlendir
                      </h3>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-pale text-brand">
                      <ReviewIcon />
                    </div>
                  </div>

                  <div className="mt-6 rounded-[20px] bg-surface-soft p-5">
                    <p className="text-sm font-semibold text-text">
                      Satın alma doğrulaması
                      gerekli
                    </p>

                    <p className="mt-2 text-sm leading-6 text-text-soft">
                      Yalnızca bu ürünü satın
                      alıp teslim alan
                      müşteriler değerlendirme
                      yapabilir.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {relatedProducts.length >
          0 && (
          <section className="page-section pb-16 pt-0">
            <div className="mb-7">
              <h2 className="font-serif text-3xl font-semibold text-text">
                Bunlar da İlginizi
                Çekebilir
              </h2>
            </div>

            <div className="grid grid-cols-4 gap-6">
              {relatedProducts.map(
                (relatedProduct) => (
                  <ProductCard
                    key={
                      relatedProduct.id
                    }
                    id={
                      relatedProduct.id
                    }
                    name={
                      relatedProduct.name
                    }
                    category={
                      relatedProduct.category
                    }
                    price={moneyToNumber(
                      relatedProduct.price,
                    )}
                    discountPrice={optionalMoneyToNumber(
                      relatedProduct.discountPrice,
                    )}
                    imageUrl={
                      relatedProduct.imageUrl
                    }
                    stock={
                      relatedProduct.stock
                    }
                  />
                ),
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}