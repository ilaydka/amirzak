import Link from "next/link";

export default function Hero() {
  return (
    <main className="bg-zinc-950 text-white">
      <section className="flex min-h-[calc(100vh-81px)] flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
          AMİRZAK
        </p>

        <h1 className="max-w-4xl text-5xl font-bold sm:text-7xl">
          Aradığın ürünleri tek yerde keşfet.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          Farklı kategorilerdeki ürünleri keşfet,
          karşılaştır ve güvenli bir alışveriş deneyimiyle
          kolayca satın al.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/products"
            className="rounded-lg bg-red-600 px-6 py-3 font-semibold transition hover:bg-red-500"
          >
            Ürünleri Keşfet
          </Link>

          <Link
            href="/products"
            className="rounded-lg border border-zinc-700 px-6 py-3 font-semibold transition hover:bg-zinc-900"
          >
            Alışverişe Başla
          </Link>
        </div>
      </section>
    </main>
  );
}