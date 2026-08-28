import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import AccountActions from "@/components/AccountActions";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";

function getRoleLabel(role: string) {
  switch (role) {
    case "ADMIN":
      return "Yönetici";

    case "DEALER":
      return "Satıcı";

    default:
      return "Kullanıcı";
  }
}

function AccountIcon({
  type,
}: {
  type:
    | "profile"
    | "orders"
    | "card"
    | "support"
    | "products";
}) {
  const common = "h-6 w-6";

 if (type === "orders") {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={common}
      aria-hidden="true"
    >
      <path d="M21 8 12 3 3 8l9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
      <path d="m7.5 5.5 9 5" />
    </svg>
  );
}

  if (type === "card") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={common}
        aria-hidden="true"
      >
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
        />
        <path d="M3 10h18" />
        <path d="M7 15h3" />
      </svg>
    );
  }

  if (type === "support") {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={common}
      aria-hidden="true"
    >
      <path d="M4 13a8 8 0 0 1 16 0" />
      <path d="M4 13v4a2 2 0 0 0 2 2h1v-6H4z" />
      <path d="M20 13v4a2 2 0 0 1-2 2h-1v-6h3z" />
      <path d="M17 19c0 1.1-.9 2-2 2h-3" />
    </svg>
  );
}

  if (type === "products") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={common}
        aria-hidden="true"
      >
        <path d="M20.5 3.5C13.2 3.7 7.7 6.2 6.2 11.2C5.1 14.9 7.2 18.1 10.6 18.4C15.9 18.9 19.8 12.7 20.5 3.5Z" />
        <path d="M3.5 21C6.2 15.8 10.3 11.7 16.8 7.5" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={common}
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          orders: true,
          paymentMethods: true,
          supportTickets: true,
          sellerProducts: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const displayName =
    [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ") ||
    user.name ||
    "AMİRZAK Kullanıcısı";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f8f5ed] px-6 py-14 text-[#233018]">
        <section className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#74815f]">
                Hesabım
              </p>

              <h1 className="mt-2 font-serif text-4xl font-semibold text-[#344b20] sm:text-5xl">
                Profilim
              </h1>

              <p className="mt-3 max-w-2xl text-[#77766f]">
                Hesap bilgilerinizi, siparişlerinizi,
                ürünlerinizi, ödeme yöntemlerinizi ve destek
                taleplerinizi tek yerden yönetin.
              </p>
            </div>

            <div className="rounded-full border border-[#ddd6c8] bg-[#fffdf8] px-4 py-2 text-sm text-[#66705a]">
              {getRoleLabel(user.role)}
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-[#e3dccf] bg-[#fffdf8] p-5 shadow-[0_10px_30px_rgba(52,75,32,0.04)]">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#344b20] text-lg font-semibold text-white">
                {displayName
                  .charAt(0)
                  .toLocaleUpperCase("tr-TR")}
              </div>

              <div>
                <p className="font-serif text-xl font-semibold text-[#344b20]">
                  {displayName}
                </p>

                <p className="mt-1 text-sm text-[#85837a]">
                  {user.email}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#99968d]">
              Üyelik:{" "}
              {user.createdAt.toLocaleDateString(
                "tr-TR",
                {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                },
              )}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <Link
              href="/profile/edit"
              className="group rounded-2xl border border-[#e3dccf] bg-[#fffdf8] p-5 transition hover:-translate-y-1 hover:border-[#aab79a] hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef1e8] text-[#344b20]">
                  <AccountIcon type="profile" />
                </div>

                <span className="text-[#74815f] transition group-hover:translate-x-1">
                  →
                </span>
              </div>

              <h2 className="mt-5 font-serif text-xl font-semibold text-[#344b20]">
                Profil Bilgilerim
              </h2>

              <p className="mt-2 text-sm leading-5 text-[#85837a]">
                Kişisel ve adres bilgilerinizi düzenleyin.
              </p>
            </Link>

            <Link
              href="/orders"
              className="group rounded-2xl border border-[#e3dccf] bg-[#fffdf8] p-5 transition hover:-translate-y-1 hover:border-[#aab79a] hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef1e8] text-[#344b20]">
                  <AccountIcon type="orders" />
                </div>

                <span className="text-[#74815f] transition group-hover:translate-x-1">
                  →
                </span>
              </div>

              <h2 className="mt-5 font-serif text-xl font-semibold text-[#344b20]">
                Siparişlerim
              </h2>

              <p className="mt-2 text-sm text-[#85837a]">
                {user._count.orders} sipariş
              </p>
            </Link>

            <Link
              href="/profile/products"
              className="group rounded-2xl border border-[#e3dccf] bg-[#fffdf8] p-5 transition hover:-translate-y-1 hover:border-[#aab79a] hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef1e8] text-[#344b20]">
                  <AccountIcon type="products" />
                </div>

                <span className="text-[#74815f] transition group-hover:translate-x-1">
                  →
                </span>
              </div>

              <h2 className="mt-5 font-serif text-xl font-semibold text-[#344b20]">
                Ürünlerim
              </h2>

              <p className="mt-2 text-sm text-[#85837a]">
                {user._count.sellerProducts} ürün
              </p>
            </Link>

            <Link
              href="/profile/payment-methods"
              className="group rounded-2xl border border-[#e3dccf] bg-[#fffdf8] p-5 transition hover:-translate-y-1 hover:border-[#aab79a] hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef1e8] text-[#344b20]">
                  <AccountIcon type="card" />
                </div>

                <span className="text-[#74815f] transition group-hover:translate-x-1">
                  →
                </span>
              </div>

              <h2 className="mt-5 font-serif text-xl font-semibold text-[#344b20]">
                Kayıtlı Kartlarım
              </h2>

              <p className="mt-2 text-sm text-[#85837a]">
                {user._count.paymentMethods} kayıtlı kart
              </p>
            </Link>

            <Link
              href="/support"
              className="group rounded-2xl border border-[#e3dccf] bg-[#fffdf8] p-5 transition hover:-translate-y-1 hover:border-[#aab79a] hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef1e8] text-[#344b20]">
                  <AccountIcon type="support" />
                </div>

                <span className="text-[#74815f] transition group-hover:translate-x-1">
                  →
                </span>
              </div>

              <h2 className="mt-5 font-serif text-xl font-semibold text-[#344b20]">
                Destek Taleplerim
              </h2>

              <p className="mt-2 text-sm text-[#85837a]">
                {user._count.supportTickets} destek talebi
              </p>
            </Link>
          </div>

          <AccountActions />
        </section>
      </main>

      <Footer />
    </>
  );
}