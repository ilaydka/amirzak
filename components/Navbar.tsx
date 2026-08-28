import Image from "next/image";
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
    <header className="border-b border-border bg-surface/95 text-text backdrop-blur">
      <nav className="mx-auto max-w-7xl px-6">
        <div className="grid h-[82px] grid-cols-[1fr_auto_1fr] items-center gap-8">
          <Link
            href="/"
            aria-label="AMİRZAK Ana Sayfa"
            className="group flex h-[82px] items-center justify-self-start overflow-visible"
          >
            <Image
              src="/brand/amirzak-logo.png"
              alt="AMİRZAK"
              width={700}
              height={240}
              priority
              className="h-auto w-[260px] max-w-none object-contain transition duration-200 group-hover:opacity-85"
            />
          </Link>

          <div className="flex items-center justify-center gap-12">
            <Link
              href="/"
              className="rounded-full px-6 py-2.5 text-[16px] font-semibold text-brand transition hover:bg-brand-pale"
            >
              Ana Sayfa
            </Link>

            <Link
              href="/products"
              className="rounded-full px-6 py-2.5 text-[16px] font-semibold text-brand transition hover:bg-brand-pale"
            >
              Ürünler
            </Link>

            <Link
              href="/support"
              className="rounded-full px-6 py-2.5 text-[16px] font-semibold text-brand transition hover:bg-brand-pale"
            >
              Destek
            </Link>
          </div>

          <div className="flex items-center justify-self-end gap-3">
            {session?.user?.id ? (
              <>
                <Link
                  href="/cart"
                  aria-label="Sepetim"
                  title="Sepetim"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-brand bg-white text-brand shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-pale hover:shadow-md"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <circle cx="9" cy="20" r="1" />
                    <circle cx="19" cy="20" r="1" />
                    <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 8H6" />
                  </svg>

                  {cartItemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                      {cartItemCount}
                    </span>
                  )}
                </Link>

                <Link
                  href="/profile"
                  aria-label="Profilim"
                  title="Profilim"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-brand bg-white text-brand shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-pale hover:shadow-md"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
                  </svg>
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="rounded-full border border-brand bg-white px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand-pale"
                  >
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full border border-brand bg-white px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand-pale"
                >
                  Giriş Yap
                </Link>

                <Link
                  href="/register"
                  className="rounded-full border border-brand bg-white px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand-pale"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}