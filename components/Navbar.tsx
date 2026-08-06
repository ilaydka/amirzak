import Link from "next/link";

import { auth, signOut } from "@/auth";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-8 py-5 text-white">
      <Link href="/" className="text-2xl font-bold text-red-500">
        AutoHub
      </Link>

      <ul className="flex items-center gap-8">
        <li>
          <Link href="/products" className="transition hover:text-red-500">
            Ürünler
          </Link>
        </li>

        <li>
          <Link href="/brands" className="transition hover:text-red-500">
            Markalar
          </Link>
        </li>

        <li>
          <Link href="/dealers" className="transition hover:text-red-500">
            Satıcılar
          </Link>
        </li>
      </ul>

      <div className="flex items-center gap-4">
        {session?.user ? (
          <>
            <span className="text-sm text-zinc-300">
              {session.user.name ?? session.user.email}
            </span>

            <form
              action={async () => {
                "use server";

                await signOut({
                  redirectTo: "/",
                });
              }}
            >
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-5 py-2 font-semibold transition hover:bg-red-500"
              >
                Çıkış Yap
              </button>
            </form>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-lg border border-zinc-700 px-5 py-2 font-semibold transition hover:border-red-500"
            >
              Giriş Yap
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-red-600 px-5 py-2 font-semibold transition hover:bg-red-500"
            >
              Kayıt Ol
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}