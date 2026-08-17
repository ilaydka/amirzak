import { auth } from "@/auth";
import AddToCartForm from "@/components/AddToCartForm";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ReviewForm from "@/components/ReviewForm";
import ReviewOwnerActions from "@/components/ReviewOwnerActions";
import { prisma } from "@/lib/prisma";
import { deleteReview } from "@/lib/review-actions";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

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

        <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
          <div className="text-center">
            <h1 className="text-3xl font-bold">
              Ürün bulunamadı.
            </h1>

            <p className="mt-3 text-zinc-400">
              Aradığınız ürün mevcut değil, kaldırılmış veya satıştan
              kaldırılmış olabilir.
            </p>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  const inStock = product.stock > 0;

  const hasDiscount =
    product.discountPrice !== null &&
    product.discountPrice < product.price;

  const currentPrice =
  hasDiscount && product.discountPrice !== null
    ? product.discountPrice
    : product.price;

  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce(
          (total, review) => total + review.rating,
          0,
        ) / product.reviews.length
      : 0;

  const currentUserReview = product.reviews.find(
    (review) => review.user.id === session?.user?.id,
  );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
        <section className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          <div className="relative flex min-h-[480px] items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            {hasDiscount && (
              <span className="absolute left-5 top-5 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white">
                İndirim
              </span>
            )}

            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-contain p-8"
              />
            ) : (
              <div className="text-center">
                <p className="text-lg font-semibold text-zinc-500">
                  Ürün Görseli Yok
                </p>

                <p className="mt-2 text-sm text-zinc-600">
                  Bu ürün için henüz görsel eklenmemiş.
                </p>
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-red-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-400">
                {product.category}
              </span>

              {product.brand && (
                <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-300">
                  {product.brand}
                </span>
              )}

              <span
                className={
                  inStock
                    ? "rounded-full bg-green-950 px-3 py-1 text-xs font-semibold text-green-300"
                    : "rounded-full bg-red-950 px-3 py-1 text-xs font-semibold text-red-300"
                }
              >
                {inStock ? "Stokta" : "Tükendi"}
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-bold">
              {product.name}
            </h1>

            {product.reviews.length > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-lg text-yellow-400">
                  {"★".repeat(Math.round(averageRating))}
                  {"☆".repeat(5 - Math.round(averageRating))}
                </span>

                <span className="text-sm text-zinc-400">
                  {averageRating.toFixed(1)} / 5
                  {" · "}
                  {product.reviews.length} yorum
                </span>
              </div>
            )}

            <div className="mt-7">
              {hasDiscount && (
                <p className="text-lg text-zinc-500 line-through">
                  {product.price.toLocaleString("tr-TR")} ₺
                </p>
              )}

              <p className="mt-1 text-4xl font-bold">
                {currentPrice.toLocaleString("tr-TR")} ₺
              </p>
            </div>

            {product.description && (
              <div className="mt-8">
                <h2 className="text-lg font-bold">
                  Ürün Açıklaması
                </h2>

                <p className="mt-3 leading-7 text-zinc-400">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mt-8 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="flex items-start justify-between gap-6">
                <span className="text-zinc-400">
                  Marka
                </span>

                <span className="text-right font-semibold">
                  {product.brand ?? "Belirtilmemiş"}
                </span>
              </div>

              <div className="border-t border-zinc-800" />

              <div className="flex items-start justify-between gap-6">
                <span className="text-zinc-400">
                  Kategori
                </span>

                <span className="text-right font-semibold">
                  {product.category}
                </span>
              </div>

              <div className="border-t border-zinc-800" />

              <div className="flex items-start justify-between gap-6">
                <span className="text-zinc-400">
                  Stok
                </span>

                <span
                  className={
                    inStock
                      ? "text-right font-semibold text-green-400"
                      : "text-right font-semibold text-red-400"
                  }
                >
                  {inStock
                    ? `${product.stock} adet`
                    : "Tükendi"}
                </span>
              </div>
            </div>

            <AddToCartForm
              productId={product.id}
              disabled={!inStock}
            />
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
            <div>
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
                  Değerlendirmeler
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  Müşteri Yorumları
                </h2>

                {product.reviews.length > 0 && (
                  <p className="mt-3 text-zinc-400">
                    Ortalama puan:{" "}
                    {averageRating.toFixed(1)} / 5
                  </p>
                )}
              </div>

              {product.reviews.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
                  <h3 className="text-xl font-bold">
                    Henüz yorum yapılmamış.
                  </h3>

                  <p className="mt-3 text-zinc-400">
                    Bu ürün için ilk değerlendirmeyi siz yapabilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {product.reviews.map((review) => {
                    const isOwner =
                      session?.user?.id === review.user.id;

                    return (
                      <article
                        key={review.id}
                        className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold">
                              {review.user.name ??
                                "AMİRZAK Kullanıcısı"}
                            </p>

                            <p className="mt-1 text-sm text-zinc-500">
                              {review.createdAt.toLocaleDateString(
                                "tr-TR",
                              )}
                            </p>
                          </div>

                          <div className="text-lg text-yellow-400">
                            {"★".repeat(review.rating)}
                            {"☆".repeat(
                              5 - review.rating,
                            )}
                          </div>
                        </div>

                        <p className="mt-5 leading-7 text-zinc-300">
                          {review.comment}
                        </p>

                        {isOwner && (
                          <ReviewOwnerActions
                            reviewId={review.id}
                            rating={review.rating}
                            comment={review.comment}
                            deleteAction={deleteReview}
                          />
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              {currentUserReview ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                  <h3 className="text-xl font-bold">
                    Değerlendirmeniz Alındı
                  </h3>

                  <p className="mt-3 leading-7 text-zinc-400">
                    Bu ürün için bir değerlendirme yaptınız.
                    Yorumunuzu yorum kartından düzenleyebilir
                    veya silebilirsiniz.
                  </p>
                </div>
              ) : (
                <ReviewForm productId={product.id} />
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}