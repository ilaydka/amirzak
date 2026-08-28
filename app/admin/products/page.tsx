import Link from "next/link";

import DeleteProductButton from "@/components/DeleteProductButton";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductSuccessMessage from "@/components/ProductSuccessMessage";
import {
  approveProduct,
  rejectProduct,
} from "@/lib/admin-product-actions";
import { requireAdmin } from "@/lib/admin";
import {
  moneyToNumber,
  optionalMoneyToNumber,
} from "@/lib/money";
import { deleteProduct } from "@/lib/product-actions";
import { prisma } from "@/lib/prisma";

type AdminProductsPageProps = {
  searchParams: Promise<{
    updated?: string;
    created?: string;
    deleted?: string;
    deleteError?: string;
    approved?: string;
    rejected?: string;
    approvalError?: string;
    rejectionError?: string;
    view?: string;
    q?: string;
    stock?: string;
    active?: string;
  }>;
};

type ProductView =
  | "all"
  | "pending"
  | "approved"
  | "rejected";

function FlowerVaseIcon() {
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
      <circle cx="12" cy="6.5" r="1.25" />
      <circle cx="12" cy="3.8" r="2" />
      <circle cx="9.3" cy="6.5" r="2" />
      <circle cx="14.7" cy="6.5" r="2" />
      <circle cx="12" cy="9.2" r="2" />
      <path d="M12 10.5V13" />
      <path d="M7.5 13h9l-.7 7H8.2l-.7-7Z" />
    </svg>
  );
}

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

function getSellerName(product: {
  seller: {
    firstName: string | null;
    lastName: string | null;
    name: string | null;
    email: string | null;
  } | null;
}) {
  if (!product.seller) {
    return "AMİRZAK";
  }

  const fullName = [
    product.seller.firstName,
    product.seller.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    fullName ||
    product.seller.name ||
    product.seller.email ||
    "Satıcı"
  );
}

function buildProductsUrl({
  view,
  q,
  stock,
  active,
}: {
  view: ProductView;
  q?: string;
  stock?: string;
  active?: string;
}) {
  const params = new URLSearchParams();

  if (view !== "all") {
    params.set("view", view);
  }

  if (q?.trim()) {
    params.set("q", q.trim());
  }

  if (stock) {
    params.set("stock", stock);
  }

  if (active) {
    params.set("active", active);
  }

  const query = params.toString();

  return query
    ? `/admin/products?${query}`
    : "/admin/products";
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  await requireAdmin();

  const {
    updated,
    created,
    deleted,
    deleteError,
    approved,
    rejected,
    approvalError,
    rejectionError,
    view,
    q,
    stock,
    active,
  } = await searchParams;

  const activeView: ProductView =
    view === "pending" ||
    view === "approved" ||
    view === "rejected"
      ? view
      : "all";

  const searchQuery =
    q?.trim().toLocaleLowerCase(
      "tr-TR",
    ) ?? "";

  const products =
    await prisma.product.findMany({
      include: {
        seller: {
          select: {
            name: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },

      orderBy: {
        id: "desc",
      },
    });

  const normalizedProducts =
    products.map((product) => ({
      ...product,
      price: moneyToNumber(
        product.price,
      ),
      discountPrice:
        optionalMoneyToNumber(
          product.discountPrice,
        ),
    }));

  const pendingProducts =
    normalizedProducts.filter(
      (product) =>
        product.approvalStatus ===
        "PENDING",
    );

  const approvedProducts =
    normalizedProducts.filter(
      (product) =>
        product.approvalStatus ===
        "APPROVED",
    );

  const rejectedProducts =
    normalizedProducts.filter(
      (product) =>
        product.approvalStatus ===
        "REJECTED",
    );

  const productsByView =
    activeView === "pending"
      ? pendingProducts
      : activeView === "approved"
        ? approvedProducts
        : activeView === "rejected"
          ? rejectedProducts
          : normalizedProducts;

  const visibleProducts =
    productsByView.filter(
      (product) => {
        const sellerName =
          getSellerName(
            product,
          ).toLocaleLowerCase(
            "tr-TR",
          );

        const searchableText = [
          product.id,
          product.name,
          product.scientificName,
          product.category,
          product.brand,
          product.description,
          sellerName,
          product.seller?.email,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase(
            "tr-TR",
          );

        const matchesSearch =
          !searchQuery ||
          searchableText.includes(
            searchQuery,
          );

        const matchesStock =
          !stock ||
          (stock === "out" &&
            product.stock < 1) ||
          (stock === "low" &&
            product.stock > 0 &&
            product.stock <= 3) ||
          (stock === "available" &&
            product.stock > 3);

        const matchesActive =
          !active ||
          (active === "active" &&
            product.isActive) ||
          (active === "passive" &&
            !product.isActive);

        return (
          matchesSearch &&
          matchesStock &&
          matchesActive
        );
      },
    );

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(stock) ||
    Boolean(active);

  const tabs: {
    value: ProductView;
    label: string;
    count: number;
  }[] = [
    {
      value: "all",
      label: "Tümü",
      count:
        normalizedProducts.length,
    },
    {
      value: "pending",
      label: "Onay Bekleyenler",
      count:
        pendingProducts.length,
    },
    {
      value: "approved",
      label: "Onaylananlar",
      count:
        approvedProducts.length,
    },
    {
      value: "rejected",
      label: "Reddedilenler",
      count:
        rejectedProducts.length,
    },
  ];

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <section className="page-section page-content max-w-7xl">
          <div className="mb-10">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">
                  Yönetim Paneli
                </p>

                <h1 className="display-title mt-3 text-4xl text-text sm:text-5xl">
                  Ürün Yönetimi
                </h1>

                <p className="mt-3 max-w-2xl leading-7 text-text-soft">
                  AMİRZAK ürünlerini ve
                  satıcılar tarafından
                  gönderilen ürünleri yönetin.
                  Onay bekleyen ürünleri
                  inceleyebilir, onaylayabilir
                  veya gerekçesiyle
                  reddedebilirsiniz.
                </p>
              </div>

              <Link
                href="/admin/products/new"
                className="brand-button shrink-0 px-5 py-3 text-sm"
              >
                + Yeni Ürün
              </Link>
            </div>
          </div>

          {updated === "1" && (
            <ProductSuccessMessage message="Ürün başarıyla güncellendi." />
          )}

          {created === "1" && (
            <ProductSuccessMessage message="Ürün başarıyla oluşturuldu." />
          )}

          {deleted === "1" && (
            <ProductSuccessMessage message="Ürün başarıyla silindi." />
          )}

          {approved === "1" && (
            <ProductSuccessMessage message="Ürün başarıyla onaylandı." />
          )}

          {rejected === "1" && (
            <ProductSuccessMessage message="Ürün reddedildi." />
          )}

          {deleteError ===
            "ordered" && (
            <ProductSuccessMessage
              type="error"
              message="Bu ürün daha önce siparişlerde kullanıldığı için silinemez. Ürünü pasif hale getirebilirsiniz."
            />
          )}

          {deleteError === "1" && (
            <ProductSuccessMessage
              type="error"
              message="Ürün silinirken bir hata meydana geldi."
            />
          )}

          {approvalError && (
            <ProductSuccessMessage
              type="error"
              message="Ürün onaylanırken bir hata meydana geldi."
            />
          )}

          {rejectionError ===
            "reason" && (
            <ProductSuccessMessage
              type="error"
              message="Geçerli bir red sebebi yazmalısınız."
            />
          )}

          {rejectionError &&
            rejectionError !==
              "reason" && (
              <ProductSuccessMessage
                type="error"
                message="Ürün reddedilirken bir hata meydana geldi."
              />
            )}

          <div className="mb-7 overflow-hidden rounded-[22px] border border-border bg-surface shadow-sm">
            <div className="flex gap-7 overflow-x-auto px-6 pt-5">
              {tabs.map((tab) => {
                const isActive =
                  activeView ===
                  tab.value;

                return (
                  <Link
                    key={tab.value}
                    href={buildProductsUrl(
                      {
                        view:
                          tab.value,
                        q,
                        stock,
                        active,
                      },
                    )}
                    className={
                      isActive
                        ? "whitespace-nowrap border-b-2 border-brand pb-4 text-sm font-semibold text-brand"
                        : "whitespace-nowrap pb-4 text-sm font-semibold text-text-soft transition hover:text-brand"
                    }
                  >
                    {tab.label}

                    <span className="ml-2 rounded-full bg-brand-pale px-2 py-0.5 text-xs text-brand">
                      {tab.count}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <section className="panel mb-7 p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft">
                  Arama ve Filtreleme
                </p>

                <h2 className="mt-2 font-serif text-xl font-semibold text-text">
                  Ürünleri Bul
                </h2>
              </div>

              <p className="text-sm text-text-muted">
                {
                  visibleProducts.length
                }{" "}
                /{" "}
                {
                  productsByView.length
                }{" "}
                ürün
              </p>
            </div>

            <form
              method="GET"
              action="/admin/products"
              className="mt-5 grid gap-3 xl:grid-cols-[minmax(320px,1.7fr)_minmax(170px,0.8fr)_minmax(170px,0.8fr)_auto] xl:items-end"
            >
              {activeView !==
                "all" && (
                <input
                  type="hidden"
                  name="view"
                  value={
                    activeView
                  }
                />
              )}

              <div>
                <label
                  htmlFor="q"
                  className="mb-2 block text-sm font-semibold text-text"
                >
                  Ara
                </label>

                <input
                  id="q"
                  name="q"
                  type="search"
                  defaultValue={
                    q ?? ""
                  }
                  placeholder="Ürün, kategori, marka, satıcı veya ID"
                  className="field w-full px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="stock"
                  className="mb-2 block text-sm font-semibold text-text"
                >
                  Stok Durumu
                </label>

                <select
                  id="stock"
                  name="stock"
                  defaultValue={
                    stock ?? ""
                  }
                  className="field w-full px-4 py-2.5 text-sm"
                >
                  <option value="">
                    Tüm Stoklar
                  </option>

                  <option value="available">
                    Stokta Var
                  </option>

                  <option value="low">
                    Kritik Stok
                  </option>

                  <option value="out">
                    Stok Yok
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="active"
                  className="mb-2 block text-sm font-semibold text-text"
                >
                  Yayın Durumu
                </label>

                <select
                  id="active"
                  name="active"
                  defaultValue={
                    active ?? ""
                  }
                  className="field w-full px-4 py-2.5 text-sm"
                >
                  <option value="">
                    Tümü
                  </option>

                  <option value="active">
                    Aktif
                  </option>

                  <option value="passive">
                    Pasif
                  </option>
                </select>
              </div>

              <div className="flex gap-2">
                {hasActiveFilters && (
                  <Link
                    href={buildProductsUrl(
                      {
                        view:
                          activeView,
                      },
                    )}
                    className="secondary-button flex min-h-11 items-center justify-center whitespace-nowrap px-4 py-2.5 text-sm"
                  >
                    Temizle
                  </Link>
                )}

                <button
                  type="submit"
                  className="brand-button min-h-11 whitespace-nowrap px-5 py-2.5 text-sm"
                >
                  Filtrele
                </button>
              </div>
            </form>
          </section>

          {productsByView.length ===
          0 ? (
            <div className="empty-state flex min-h-[270px] flex-col items-center justify-center px-6 py-12 text-center sm:px-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-white text-brand shadow-sm">
                <FlowerVaseIcon />
              </div>

              <h2 className="mt-5 font-serif text-2xl font-semibold text-text">
                {activeView ===
                "pending"
                  ? "Onay bekleyen ürün yok"
                  : activeView ===
                      "rejected"
                    ? "Reddedilen ürün yok"
                    : activeView ===
                        "approved"
                      ? "Onaylanmış ürün yok"
                      : "Henüz ürün yok"}
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-text-soft">
                {activeView ===
                "pending"
                  ? "Satıcılardan yeni ürün gönderildiğinde burada görüntülenecek."
                  : activeView ===
                      "rejected"
                    ? "Reddettiğiniz ürünler burada görüntülenecek."
                    : activeView ===
                        "approved"
                      ? "Onaylanmış ürünler burada görüntülenecek."
                      : "Yeni ürün eklediğinizde burada görüntülenecek."}
              </p>
            </div>
          ) : visibleProducts.length ===
            0 ? (
            <div className="empty-state flex min-h-[270px] flex-col items-center justify-center px-6 py-12 text-center sm:px-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-white text-brand shadow-sm">
                <FlowerVaseIcon />
              </div>

              <h2 className="mt-5 font-serif text-2xl font-semibold text-text">
                Sonuç bulunamadı
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-text-soft">
                Arama kelimenizi veya
                seçtiğiniz filtreleri
                değiştirerek tekrar
                deneyebilirsiniz.
              </p>

              <Link
                href={buildProductsUrl(
                  {
                    view:
                      activeView,
                  },
                )}
                className="secondary-button mt-5 px-5 py-3 text-sm"
              >
                Filtreleri Temizle
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {visibleProducts.map(
                (product) => {
                  const hasDiscount =
                    product.discountPrice !==
                      null &&
                    product.discountPrice <
                      product.price;

                  const lowStock =
                    product.stock > 0 &&
                    product.stock <=
                      3;

                  const outOfStock =
                    product.stock < 1;

                  const sellerName =
                    getSellerName(
                      product,
                    );

                  const isPending =
                    product.approvalStatus ===
                    "PENDING";

                  const isRejected =
                    product.approvalStatus ===
                    "REJECTED";

                  return (
                    <article
                      key={
                        product.id
                      }
                      className="overflow-hidden rounded-[22px] border border-border bg-surface shadow-sm"
                    >
                      <div className="p-6">
                        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
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

                              <span
                                className={
                                  product.isActive
                                    ? "status-success inline-flex rounded-full px-3 py-1.5 text-xs font-semibold"
                                    : "status-neutral inline-flex rounded-full px-3 py-1.5 text-xs font-semibold"
                                }
                              >
                                {product.isActive
                                  ? "Aktif"
                                  : "Pasif"}
                              </span>

                              {outOfStock ? (
                                <span className="status-danger inline-flex rounded-full px-3 py-1.5 text-xs font-semibold">
                                  Stok
                                  Yok
                                </span>
                              ) : lowStock ? (
                                <span className="status-warning inline-flex rounded-full px-3 py-1.5 text-xs font-semibold">
                                  Kritik
                                  Stok:{" "}
                                  {
                                    product.stock
                                  }
                                </span>
                              ) : (
                                <span className="status-success inline-flex rounded-full px-3 py-1.5 text-xs font-semibold">
                                  {
                                    product.stock
                                  }{" "}
                                  stok
                                </span>
                              )}
                            </div>

                            <h2 className="mt-4 break-words font-serif text-2xl font-semibold text-text">
                              {
                                product.name
                              }
                            </h2>

                            {product.scientificName && (
                              <p className="mt-1 break-words font-serif italic text-brand-soft">
                                {
                                  product.scientificName
                                }
                              </p>
                            )}

                            <div className="mt-4 grid gap-3 text-sm text-text-soft sm:grid-cols-2 xl:grid-cols-4">
                              <p className="min-w-0 break-words">
                                <span className="text-text-muted">
                                  ID:
                                </span>{" "}
                                #
                                {
                                  product.id
                                }
                              </p>

                              <p className="min-w-0 break-words">
                                <span className="text-text-muted">
                                  Kategori:
                                </span>{" "}
                                {
                                  product.category
                                }
                              </p>

                              <p className="min-w-0 break-words">
                                <span className="text-text-muted">
                                  Marka:
                                </span>{" "}
                                {product.brand ??
                                  "-"}
                              </p>

                              <p className="min-w-0 break-words">
                                <span className="text-text-muted">
                                  Satıcı:
                                </span>{" "}
                                {
                                  sellerName
                                }
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-left lg:min-w-40 lg:text-right">
                            {hasDiscount ? (
                              <>
                                <p className="text-sm text-text-muted line-through">
                                  {product.price.toLocaleString(
                                    "tr-TR",
                                  )}{" "}
                                  ₺
                                </p>

                                <p className="mt-1 text-2xl font-bold text-brand">
                                  {product.discountPrice?.toLocaleString(
                                    "tr-TR",
                                  )}{" "}
                                  ₺
                                </p>
                              </>
                            ) : (
                              <p className="text-2xl font-bold text-brand">
                                {product.price.toLocaleString(
                                  "tr-TR",
                                )}{" "}
                                ₺
                              </p>
                            )}
                          </div>
                        </div>

                        {product.description && (
                          <div className="mt-5 rounded-2xl border border-border bg-surface-soft p-5">
                            <p className="break-words text-sm leading-7 text-text-soft">
                              {
                                product.description
                              }
                            </p>
                          </div>
                        )}

                        {isRejected &&
                          product.rejectionReason && (
                            <div className="status-danger mt-5 rounded-2xl px-5 py-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.14em]">
                                Red
                                Sebebi
                              </p>

                              <p className="mt-2 break-words text-sm leading-6">
                                {
                                  product.rejectionReason
                                }
                              </p>
                            </div>
                          )}

                        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="secondary-button px-5 py-2.5 text-sm"
                          >
                            Düzenle
                          </Link>

                          {!isPending && (
                            <DeleteProductButton
                              productId={
                                product.id
                              }
                              productName={
                                product.name
                              }
                              action={
                                deleteProduct
                              }
                            />
                          )}
                        </div>
                      </div>

                      {isPending && (
                        <div className="border-t border-border bg-surface-soft p-6">
                          <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft">
                                Ürün
                                Onayı
                              </p>

                              <h3 className="mt-2 font-serif text-xl font-semibold text-text">
                                Karar
                                Ver
                              </h3>

                              <p className="mt-2 text-sm leading-6 text-text-soft">
                                Ürün
                                bilgilerini
                                kontrol
                                ederek
                                yayına
                                alabilir
                                veya
                                gerekçesiyle
                                reddedebilirsiniz.
                              </p>

                              <form
                                action={
                                  approveProduct
                                }
                                className="mt-5"
                              >
                                <input
                                  type="hidden"
                                  name="productId"
                                  value={
                                    product.id
                                  }
                                />

                                <button
                                  type="submit"
                                  className="brand-button w-full px-5 py-3 text-sm"
                                >
                                  ✓
                                  Ürünü
                                  Onayla
                                </button>
                              </form>
                            </div>

                            <form
                              action={
                                rejectProduct
                              }
                              className="min-w-0"
                            >
                              <input
                                type="hidden"
                                name="productId"
                                value={
                                  product.id
                                }
                              />

                              <label
                                htmlFor={`rejectionReason-${product.id}`}
                                className="text-sm font-semibold text-text"
                              >
                                Red
                                Sebebi
                              </label>

                              <p className="mt-1 text-xs leading-5 text-text-muted">
                                Satıcının
                                ürünü neden
                                yayınlayamadığını
                                anlayabilmesi
                                için açık
                                bir gerekçe
                                yazın.
                              </p>

                              <textarea
                                id={`rejectionReason-${product.id}`}
                                name="rejectionReason"
                                rows={
                                  4
                                }
                                required
                                minLength={
                                  3
                                }
                                maxLength={
                                  500
                                }
                                placeholder="Örn. Ürün görseli yeterli kalitede değil. Lütfen daha net bir ürün görseli yükleyin."
                                className="field mt-3 resize-y px-4 py-3 placeholder:text-text-muted"
                              />

                              <button
                                type="submit"
                                className="mt-3 rounded-xl border border-[#d8a9a2] bg-[#fff4f2] px-5 py-3 text-sm font-semibold text-[#9a4138] transition hover:bg-[#fde7e3]"
                              >
                                Ürünü
                                Reddet
                              </button>
                            </form>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                },
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}