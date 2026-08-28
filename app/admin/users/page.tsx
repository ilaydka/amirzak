import Link from "next/link";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import UserManagementMessage from "@/components/UserManagementMessage";
import { updateUserRole } from "@/lib/admin-user-actions";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

type AdminUsersPageProps = {
  searchParams: Promise<{
    updated?: string;
    error?: string;
    q?: string;
    role?: string;
  }>;
};

function getRoleLabel(role: string) {
  switch (role) {
    case "ADMIN":
      return "Admin";

    case "DEALER":
      return "Satıcı";

    default:
      return "Kullanıcı";
  }
}

function getRoleClass(role: string) {
  switch (role) {
    case "ADMIN":
      return "border-[#efc5bd] bg-[#fce8e4] text-[#b74738]";

    case "DEALER":
      return "border-[#ead49a] bg-[#fff2cc] text-[#9a6a12]";

    default:
      return "border-[#c9dcc0] bg-[#e8f1e7] text-[#3f6b46]";
  }
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const admin = await requireAdmin();

  const {
    updated,
    error,
    q,
    role,
  } = await searchParams;

  const searchQuery =
    q?.trim().toLocaleLowerCase(
      "tr-TR",
    ) ?? "";

  const users =
    await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneCountryCode: true,
        phone: true,
        city: true,
        role: true,
        createdAt: true,

        _count: {
          select: {
            orders: true,
            reviews: true,
            supportTickets: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  const totalUsers =
    users.length;

  const adminCount =
    users.filter(
      (user) =>
        user.role === "ADMIN",
    ).length;

  const dealerCount =
    users.filter(
      (user) =>
        user.role === "DEALER",
    ).length;

  const customerCount =
    users.filter(
      (user) =>
        user.role === "USER",
    ).length;

  const filteredUsers =
    users.filter((user) => {
      const fullName = [
        user.name,
        user.firstName,
        user.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase(
          "tr-TR",
        );

      const email =
        user.email
          ?.toLocaleLowerCase(
            "tr-TR",
          ) ?? "";

      const phone = [
        user.phoneCountryCode,
        user.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase(
          "tr-TR",
        );

      const city =
        user.city
          ?.toLocaleLowerCase(
            "tr-TR",
          ) ?? "";

      const matchesSearch =
        !searchQuery ||
        fullName.includes(
          searchQuery,
        ) ||
        email.includes(
          searchQuery,
        ) ||
        phone.includes(
          searchQuery,
        ) ||
        city.includes(
          searchQuery,
        );

      const matchesRole =
        !role ||
        user.role === role;

      return (
        matchesSearch &&
        matchesRole
      );
    });

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(role);

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <section className="page-section page-content max-w-7xl">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">
              Yönetim Paneli
            </p>

            <h1 className="display-title mt-3 text-4xl text-text sm:text-5xl">
              Kullanıcı Yönetimi
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-text-soft">
              Kayıtlı kullanıcıları
              görüntüleyebilir ve hesap
              rollerini yönetebilirsiniz.
            </p>
          </div>

          {updated === "1" && (
            <UserManagementMessage message="Kullanıcı rolü başarıyla güncellendi." />
          )}

          {error ===
            "self-role" && (
            <UserManagementMessage
              type="error"
              message="Kendi admin yetkinizi kaldıramazsınız."
            />
          )}

          {error ===
            "last-admin" && (
            <UserManagementMessage
              type="error"
              message="Sistemde en az bir admin hesabı bulunmalıdır."
            />
          )}

          {error ===
            "same-role" && (
            <UserManagementMessage
              type="error"
              message="Kullanıcı zaten seçilen role sahip."
            />
          )}

          {error ===
            "not-found" && (
            <UserManagementMessage
              type="error"
              message="Kullanıcı bulunamadı."
            />
          )}

          {error ===
            "invalid" && (
            <UserManagementMessage
              type="error"
              message="Geçersiz kullanıcı veya rol bilgisi."
            />
          )}

          {error === "1" && (
            <UserManagementMessage
              type="error"
              message="Kullanıcı rolü güncellenirken bir hata meydana geldi."
            />
          )}

          <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="panel p-5">
              <p className="text-sm text-text-muted">
                Toplam Kullanıcı
              </p>

              <p className="mt-2 text-3xl font-bold text-text">
                {totalUsers}
              </p>
            </article>

            <article className="panel p-5">
              <p className="text-sm text-text-muted">
                Kullanıcı
              </p>

              <p className="mt-2 text-3xl font-bold text-[#3f6b46]">
                {customerCount}
              </p>
            </article>

            <article className="panel p-5">
              <p className="text-sm text-text-muted">
                Satıcı
              </p>

              <p className="mt-2 text-3xl font-bold text-[#b07816]">
                {dealerCount}
              </p>
            </article>

            <article className="panel p-5">
              <p className="text-sm text-text-muted">
                Admin
              </p>

              <p className="mt-2 text-3xl font-bold text-[#c34f3f]">
                {adminCount}
              </p>
            </article>
          </div>

          <section className="panel mb-7 p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft">
                  Arama ve Filtreleme
                </p>

                <h2 className="mt-2 font-serif text-xl font-semibold text-text">
                  Kullanıcıları Bul
                </h2>
              </div>

              <p className="text-sm text-text-muted">
                {filteredUsers.length} /{" "}
                {users.length} kullanıcı
              </p>
            </div>

            <form
              method="GET"
              action="/admin/users"
              className="mt-5 grid gap-3 xl:grid-cols-[minmax(320px,1.7fr)_minmax(180px,0.8fr)_auto] xl:items-end"
            >
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
                  placeholder="Ad, e-posta, telefon veya şehir"
                  className="field w-full px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="mb-2 block text-sm font-semibold text-text"
                >
                  Rol
                </label>

                <select
                  id="role"
                  name="role"
                  defaultValue={
                    role ?? ""
                  }
                  className="field w-full px-4 py-2.5 text-sm"
                >
                  <option value="">
                    Tüm Roller
                  </option>

                  <option value="USER">
                    Kullanıcı
                  </option>

                  <option value="DEALER">
                    Satıcı
                  </option>

                  <option value="ADMIN">
                    Admin
                  </option>
                </select>
              </div>

              <div className="flex gap-2">
                {hasActiveFilters && (
                  <Link
                    href="/admin/users"
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

          {users.length === 0 ? (
            <div className="empty-state flex min-h-[270px] flex-col items-center justify-center px-6 py-12 text-center sm:px-10">
              <h2 className="font-serif text-2xl font-semibold text-text">
                Kullanıcı bulunamadı
              </h2>

              <p className="mt-3 text-sm leading-6 text-text-soft">
                Kayıtlı kullanıcılar burada
                görüntülenecek.
              </p>
            </div>
          ) : filteredUsers.length ===
            0 ? (
            <div className="empty-state flex min-h-[270px] flex-col items-center justify-center px-6 py-12 text-center sm:px-10">
              <h2 className="font-serif text-2xl font-semibold text-text">
                Sonuç bulunamadı
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-text-soft">
                Arama kelimenizi veya rol
                filtresini değiştirerek tekrar
                deneyebilirsiniz.
              </p>

              <Link
                href="/admin/users"
                className="secondary-button mt-5 px-5 py-3 text-sm"
              >
                Filtreleri Temizle
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredUsers.map(
                (user) => {
                  const fullName =
                    user.name ||
                    [
                      user.firstName,
                      user.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ") ||
                    "İsimsiz Kullanıcı";

                  const isCurrentAdmin =
                    user.id ===
                    admin.id;

                  return (
                    <article
                      key={user.id}
                      className="overflow-hidden rounded-[22px] border border-border bg-surface shadow-sm"
                    >
                      <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(210px,auto)] lg:items-center">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="break-words font-serif text-xl font-semibold text-text">
                              {fullName}
                            </h2>

                            {isCurrentAdmin && (
                              <span className="status-danger inline-flex rounded-full px-3 py-1 text-xs font-semibold">
                                Siz
                              </span>
                            )}
                          </div>

                          <p className="mt-1 break-all text-sm text-text-soft">
                            {user.email ??
                              "E-posta belirtilmemiş"}
                          </p>

                          <p className="mt-2 text-xs text-text-muted">
                            Kayıt:{" "}
                            {user.createdAt.toLocaleDateString(
                              "tr-TR",
                            )}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm text-text-muted">
                            İletişim
                          </p>

                          <p className="mt-1 break-words text-sm font-medium text-text">
                            {user.phone
                              ? `${user.phoneCountryCode ?? ""} ${user.phone}`
                              : "Telefon belirtilmemiş"}
                          </p>

                          <p className="mt-1 break-words text-sm text-text-soft">
                            {user.city ??
                              "Şehir belirtilmemiş"}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm text-text-muted">
                            Aktivite
                          </p>

                          <p className="mt-1 text-sm font-medium text-text">
                            {
                              user._count
                                .orders
                            }{" "}
                            sipariş
                          </p>

                          <p className="mt-1 break-words text-sm text-text-soft">
                            {
                              user._count
                                .reviews
                            }{" "}
                            yorum ·{" "}
                            {
                              user._count
                                .supportTickets
                            }{" "}
                            destek talebi
                          </p>
                        </div>

                        <div className="min-w-0 lg:min-w-[210px]">
                          <p className="mb-2 text-sm text-text-muted">
                            Rol
                          </p>

                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getRoleClass(
                              user.role,
                            )}`}
                          >
                            {getRoleLabel(
                              user.role,
                            )}
                          </span>

                          <form
                            action={
                              updateUserRole
                            }
                            className="mt-3 flex flex-wrap items-center gap-2"
                          >
                            <input
                              type="hidden"
                              name="userId"
                              value={
                                user.id
                              }
                            />

                            <select
                              name="role"
                              defaultValue={
                                user.role
                              }
                              disabled={
                                isCurrentAdmin
                              }
                              className="field min-w-0 flex-1 px-3 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <option value="USER">
                                Kullanıcı
                              </option>

                              <option value="DEALER">
                                Satıcı
                              </option>

                              <option value="ADMIN">
                                Admin
                              </option>
                            </select>

                            <button
                              type="submit"
                              disabled={
                                isCurrentAdmin
                              }
                              className="brand-button shrink-0 px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Güncelle
                            </button>
                          </form>
                        </div>
                      </div>
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