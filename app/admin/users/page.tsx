import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import UserManagementMessage from "@/components/UserManagementMessage";
import { requireAdmin } from "@/lib/admin";
import { updateUserRole } from "@/lib/admin-user-actions";
import { prisma } from "@/lib/prisma";

type AdminUsersPageProps = {
  searchParams: Promise<{
    updated?: string;
    error?: string;
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
      return "text-red-400";

    case "DEALER":
      return "text-yellow-400";

    default:
      return "text-zinc-300";
  }
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const admin = await requireAdmin();

  const { updated, error } = await searchParams;

  const users = await prisma.user.findMany({
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

  const totalUsers = users.length;

  const adminCount = users.filter(
    (user) => user.role === "ADMIN",
  ).length;

  const dealerCount = users.filter(
    (user) => user.role === "DEALER",
  ).length;

  const customerCount = users.filter(
    (user) => user.role === "USER",
  ).length;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
        <section className="mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
              Yönetim Paneli
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Kullanıcı Yönetimi
            </h1>

            <p className="mt-3 text-zinc-400">
              Kayıtlı kullanıcıları görüntüleyebilir ve hesap
              rollerini yönetebilirsiniz.
            </p>
          </div>

          {updated === "1" && (
            <UserManagementMessage message="Kullanıcı rolü başarıyla güncellendi." />
          )}

          {error === "self-role" && (
            <UserManagementMessage
              type="error"
              message="Kendi admin yetkinizi kaldıramazsınız."
            />
          )}

          {error === "last-admin" && (
            <UserManagementMessage
              type="error"
              message="Sistemde en az bir admin hesabı bulunmalıdır."
            />
          )}

          {error === "same-role" && (
            <UserManagementMessage
              type="error"
              message="Kullanıcı zaten seçilen role sahip."
            />
          )}

          {error === "not-found" && (
            <UserManagementMessage
              type="error"
              message="Kullanıcı bulunamadı."
            />
          )}

          {error === "invalid" && (
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

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-500">
                Toplam Kullanıcı
              </p>

              <p className="mt-2 text-3xl font-bold">
                {totalUsers}
              </p>
            </article>

            <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-500">
                Kullanıcı
              </p>

              <p className="mt-2 text-3xl font-bold">
                {customerCount}
              </p>
            </article>

            <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-500">
                Satıcı
              </p>

              <p className="mt-2 text-3xl font-bold text-yellow-400">
                {dealerCount}
              </p>
            </article>

            <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-500">
                Admin
              </p>

              <p className="mt-2 text-3xl font-bold text-red-400">
                {adminCount}
              </p>
            </article>
          </div>

          {users.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
              <h2 className="text-2xl font-bold">
                Kullanıcı bulunamadı
              </h2>

              <p className="mt-3 text-zinc-400">
                Kayıtlı kullanıcılar burada görüntülenecek.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => {
                const fullName =
                  user.name ||
                  [user.firstName, user.lastName]
                    .filter(Boolean)
                    .join(" ") ||
                  "İsimsiz Kullanıcı";

                const isCurrentAdmin =
                  user.id === admin.id;

                return (
                  <article
                    key={user.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
                  >
                    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-lg font-bold">
                            {fullName}
                          </h2>

                          {isCurrentAdmin && (
                            <span className="rounded-full bg-red-950 px-3 py-1 text-xs font-semibold text-red-300">
                              Siz
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-zinc-400">
                          {user.email ?? "E-posta belirtilmemiş"}
                        </p>

                        <p className="mt-2 text-xs text-zinc-600">
                          Kayıt:{" "}
                          {user.createdAt.toLocaleDateString(
                            "tr-TR",
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-zinc-500">
                          İletişim
                        </p>

                        <p className="mt-1 text-sm">
                          {user.phone
                            ? `${user.phoneCountryCode ?? ""} ${user.phone}`
                            : "Telefon belirtilmemiş"}
                        </p>

                        <p className="mt-1 text-sm text-zinc-400">
                          {user.city ?? "Şehir belirtilmemiş"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-zinc-500">
                          Aktivite
                        </p>

                        <p className="mt-1 text-sm">
                          {user._count.orders} sipariş
                        </p>

                        <p className="mt-1 text-sm text-zinc-400">
                          {user._count.reviews} yorum ·{" "}
                          {user._count.supportTickets} destek talebi
                        </p>
                      </div>

                      <div className="min-w-52">
                        <p className="mb-2 text-sm text-zinc-500">
                          Rol
                        </p>

                        <p
                          className={`mb-3 text-sm font-semibold ${getRoleClass(
                            user.role,
                          )}`}
                        >
                          {getRoleLabel(user.role)}
                        </p>

                        <form
                          action={updateUserRole}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="hidden"
                            name="userId"
                            value={user.id}
                          />

                          <select
                            name="role"
                            defaultValue={user.role}
                            disabled={isCurrentAdmin}
                            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-50"
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
                            disabled={isCurrentAdmin}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Güncelle
                          </button>
                        </form>
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