import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

type ProfileProductsPageProps = {
  searchParams: Promise<{
    submitted?: string;
  }>;
};

function getApprovalLabel(status: string) {
  switch (status) {
    case "PENDING":
      return "Onay Bekliyor";

    case "APPROVED":
      return "Onaylandı";

    case "REJECTED":
      return "Reddedildi";

    default:
      return status;
  }
}

function getApprovalClass(status: string) {
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

export default async function ProfileProductsPage({
  searchParams,
}: ProfileProductsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { submitted } = await searchParams;

  const products = await prisma.product.findMany({
    where: {
      sellerId: session.user.id,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <section className="page-section page-content max-w-6xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">
                Hesabım
              </p>

              <h1 className="display-title mt-3 text-4xl text-text sm:text-5xl">
                Ürünlerim
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-text-soft">
                Satış için gönderdiğiniz ürünleri ve inceleme
                durumlarını buradan takip edebilirsiniz.
              </p>
            </div>

            <Link
              href="/profile/products/new"
              className="brand-button px-5 py-3 text-sm"
            >
              + Ürün Gönder
            </Link>
          </div>

          {submitted === "1" && (
            <div className="status-success mb-6 rounded-[20px] px-5 py-4 text-sm font-medium">
              Ürününüz inceleme için başarıyla gönderildi.
            </div>
          )}

          {products.length === 0 ? (
            <div className="empty-state flex min-h-[290px] flex-col items-center justify-center px-6 py-12 text-center sm:px-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-pale text-brand">
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
                  <path d="M20 4C12 4 6 8 6 15c0 2.8 2.2 5 5 5 7 0 9-8 9-16Z" />
                  <path d="M4 20c2-5 6-8 12-11" />
                </svg>
              </div>

              <h2 className="mt-5 font-serif text-2xl font-semibold text-text">
                Henüz ürün göndermediniz
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-text-soft">
                Satışa sunmak istediğiniz bitki veya çiçeği
                inceleme için AMİRZAK yönetimine
                gönderebilirsiniz.
              </p>

              <Link
                href="/profile/products/new"
                className="brand-button mt-6 px-6 py-3 text-sm"
              >
                İlk Ürünümü Gönder
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {products.map((product) => {
                const hasDiscount =
                  product.discountPrice !== null &&
                  product.discountPrice < product.price;

                return (
                  <article
                    key={product.id}
                    className="overflow-hidden rounded-[24px] border border-border bg-surface shadow-sm"
                  >
                    <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[130px_minmax(0,1fr)_220px] lg:items-center">
                      <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[20px] border border-border bg-surface-soft">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-contain p-3"
                          />
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-8 w-8 text-brand"
                            aria-hidden="true"
                          >
                            <path d="M20 4C12 4 6 8 6 15c0 2.8 2.2 5 5 5 7 0 9-8 9-16Z" />
                            <path d="M4 20c2-5 6-8 12-11" />
                          </svg>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`${getApprovalClass(
                              product.approvalStatus,
                            )} inline-flex rounded-full px-3 py-1.5 text-xs font-semibold`}
                          >
                            {getApprovalLabel(
                              product.approvalStatus,
                            )}
                          </span>

                          {product.approvalStatus ===
                            "APPROVED" && (
                            <span
                              className={
                                product.isActive
                                  ? "status-success inline-flex rounded-full px-3 py-1.5 text-xs font-semibold"
                                  : "status-neutral inline-flex rounded-full px-3 py-1.5 text-xs font-semibold"
                              }
                            >
                              {product.isActive
                                ? "Yayında"
                                : "Pasif"}
                            </span>
                          )}
                        </div>

                        <h2 className="mt-4 font-serif text-2xl font-semibold text-text">
                          {product.name}
                        </h2>

                        {product.scientificName && (
                          <p className="mt-1 font-serif italic text-brand-soft">
                            {product.scientificName}
                          </p>
                        )}

                        <p className="mt-3 text-sm text-text-soft">
                          {product.category}
                          {product.brand
                            ? ` · ${product.brand}`
                            : ""}
                        </p>

                        {product.approvalStatus ===
                          "REJECTED" &&
                          product.rejectionReason && (
                            <div className="status-danger mt-4 rounded-[18px] px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.14em]">
                                Red Sebebi
                              </p>

                              <p className="mt-2 text-sm leading-6">
                                {product.rejectionReason}
                              </p>
                            </div>
                          )}
                      </div>

                      <div className="lg:text-right">
                        {hasDiscount ? (
                          <>
                            <p className="text-sm text-text-muted line-through">
                              {formatMoney(product.price)} ₺
                            </p>

                            <p className="mt-1 text-2xl font-bold text-brand">
                              {product.discountPrice !== null
                                ? formatMoney(product.discountPrice)
                                : ""}{" "}
                              ₺
                            </p>
                          </>
                        ) : (
                          <p className="text-2xl font-bold text-brand">
                            {formatMoney(product.price)} ₺
                          </p>
                        )}

                        <p className="mt-2 text-sm text-text-muted">
                          {product.stock} adet stok
                        </p>

                        {product.approvalStatus ===
                          "APPROVED" &&
                          product.isActive && (
                            <Link
                              href={`/products/${product.id}`}
                              className="secondary-button mt-4 inline-flex px-4 py-2.5 text-sm"
                            >
                              Ürünü Gör
                            </Link>
                          )}
                      </div>
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