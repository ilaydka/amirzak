const categories = [
  "Elektronik",
  "Giyim",
  "Ev & Yaşam",
  "Kitap",
  "Kozmetik",
  "Spor",
  "Otomotiv",
  "Oyuncak",
];

export default function Categories() {
  return (
    <section className="bg-zinc-900 px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
            Kategoriler
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Popüler Kategorileri Keşfet
          </h2>

          <p className="mt-3 text-zinc-400">
            İhtiyacınıza uygun ürünleri farklı kategorilerde inceleyin.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {categories.map((category) => (
            <div
              key={category}
              className="cursor-pointer rounded-xl border border-zinc-700 bg-zinc-950 p-6 text-center transition hover:border-red-500 hover:bg-zinc-800"
            >
              <h3 className="font-semibold">
                {category}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}