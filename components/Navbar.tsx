import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function Navbar() {
  const session = await auth();

  let cartItemCount = 0;
  let isAdmin = false;

  if (session?.user?.id) {
    const [cart, user] = await Promise.all([
      prisma.cart.findUnique({
        where: {
          userId: session.user.id,
        },
        include: {
          items: true,
        },
      }),

      prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: {
          role: true,
        },
      }),
    ]);

    cartItemCount =
      cart?.items.reduce(
        (total, item) => total + item.quantity,
        0,
      ) ?? 0;

    isAdmin = user?.role === "ADMIN";
  }

  return (
    <header className="border-b border-zinc-800 bg-zinc-950 text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight"
        >
          AMİR<span className="text-red-500">ZAK</span>
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
          >
            Ana Sayfa
          </Link>

          <Link
            href="/products"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
          >
            Ürünler
          </Link>

          <Link
            href="/support"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
          >
            Destek
          </Link>

          {session?.user?.id ? (
            <>
              <Link
                href="/cart"
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
              >
                Sepetim

                {cartItemCount > 0 && (
                  <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              <Link
                href="/orders"
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
              >
                Siparişlerim
              </Link>

              <Link
                href="/profile"
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
              >
                Profilim
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-lg border border-red-600 px-3 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-600 hover:text-white"
                >
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
              >
                Giriş Yap
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}