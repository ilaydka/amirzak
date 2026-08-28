import Image from "next/image";
import Link from "next/link";

const collections = [
  {
    title: "Başlangıç İçin",
    description:
      "Bitki bakımına yeni başlayanlar için daha kolay seçenekleri keşfedin.",
    image: "/images/home/beginner-plants.jpg",
    href: "/products?care=Kolay",
  },
  {
    title: "Evcil Hayvan Dostu",
    description:
      "Evcil hayvanlarla yaşayanlar için uygun seçenekleri keşfedin.",
    image: "/images/home/pet-friendly.jpg",
    href: "/products?petSafe=true",
  },
  {
    title: "Az Işık Sevenler",
    description:
      "Daha az ışık alan yaşam alanlarına uygun bitkileri inceleyin.",
    image: "/images/home/low-light.jpg",
    href: "/products?light=Düşük%20ışık",
  },
  {
    title: "Bakımı Kolay",
    description:
      "Günlük rutininize kolayca uyum sağlayabilecek bitkileri keşfedin.",
    image: "/images/home/easy-care.jpg",
    href: "/products?care=Kolay",
  },
];

export default function PlantCollections() {
  return (
    <section className="bg-background px-6 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h2 className="display-title text-3xl text-brand sm:text-4xl">
            Size Uygun Bitkiyi Keşfedin
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-soft sm:text-base">
            Bakım alışkanlıklarınıza ve yaşam tarzınıza göre
            size uygun seçeneklere daha kolay ulaşın.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((collection) => (
            <Link
              key={collection.title}
              href={collection.href}
              className="group overflow-hidden rounded-[26px] border border-border bg-surface shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative aspect-[3/2] overflow-hidden">
                <Image
                  src={collection.image}
                  alt={collection.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-serif text-xl font-semibold text-text">
                    {collection.title}
                  </h3>

                  <span className="shrink-0 text-brand-soft transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-text-soft">
                  {collection.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}