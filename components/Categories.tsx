import Link from "next/link";

const categories = [
  "İç Mekan Bitkileri",
  "Dış Mekan Bitkileri",
  "Çiçekli Bitkiler",
  "Sukulent & Kaktüs",
  "Orkideler",
  "Buket & Kesme Çiçek",
  "Saksı & Aksesuar",
  "Bitki Bakım Ürünleri",
];

export default function Categories() {
  return (
    <section className="bg-background px-6 pb-8 pt-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/products?category=${encodeURIComponent(
                category,
              )}`}
              className="group flex min-h-20 items-center justify-center rounded-2xl border border-border bg-surface px-4 py-4 text-center transition duration-300 hover:-translate-y-1 hover:border-border-brand hover:bg-brand-pale hover:shadow-md"
            >
              <span className="text-sm font-semibold leading-5 text-text transition-colors duration-300 group-hover:text-brand">
                {category}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}