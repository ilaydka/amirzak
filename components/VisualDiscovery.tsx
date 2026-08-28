import Image from "next/image";
import Link from "next/link";

const discoveries = [
  {
    title: "Evinize Yeşil Bir Dokunuş",
    description:
      "Yaşam alanınıza karakter kazandıracak iç mekan bitkilerini keşfedin.",
    href: "/products?category=İç%20Mekan%20Bitkileri",
    image: "/images/home/indoor-plants.jpg",
  },
  {
    title: "Orkideler",
    description:
      "Zarif çiçekleriyle yaşam alanınızı tamamlayan seçimler.",
    href: "/products?category=Orkideler",
    image: "/images/home/orchids.jpg",
  },
  {
    title: "Sukulent & Kaktüs",
    description:
      "Kompakt, karakterli ve dekoratif seçenekler.",
    href: "/products?category=Sukulent%20%26%20Kaktüs",
    image: "/images/home/succulents.jpg",
  },
];

const imageTextStyle = {
  color: "#ffffff",
  textShadow: "0 2px 12px rgba(0, 0, 0, 0.55)",
};

export default function VisualDiscovery() {
  return (
    <section className="bg-background px-6 pb-14 pt-8 sm:pb-16 sm:pt-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h2 className="display-title text-3xl text-brand sm:text-4xl">
              İlham Veren Seçimler
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-soft sm:text-base">
              Evinize ve yaşam alanınıza farklı bir hava katacak
              botanik seçimleri keşfedin.
            </p>
          </div>

          <Link
            href="/products"
            className="text-sm font-semibold text-brand transition hover:text-brand-soft"
          >
            Tümünü keşfet →
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <Link
            href={discoveries[0].href}
            className="group relative block min-h-[500px] overflow-hidden rounded-[30px] border border-border bg-surface shadow-sm"
          >
            <Image
              src={discoveries[0].image}
              alt={discoveries[0].title}
              fill
              priority
              className="object-cover transition duration-700 group-hover:scale-[1.025]"
              sizes="(max-width: 1024px) 100vw, 65vw"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 z-10 p-7 sm:p-9">
              <h3
                className="font-serif text-3xl font-semibold sm:text-4xl"
                style={imageTextStyle}
              >
                {discoveries[0].title}
              </h3>

              <p
                className="mt-2 max-w-lg text-sm leading-6 sm:text-base"
                style={imageTextStyle}
              >
                {discoveries[0].description}
              </p>

              <span
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold"
                style={imageTextStyle}
              >
                Keşfet

                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </div>
          </Link>

          <div className="grid gap-5">
            {discoveries.slice(1).map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group relative block h-[240px] overflow-hidden rounded-[30px] border border-border bg-surface shadow-sm sm:h-[270px] lg:h-auto lg:min-h-[240px]"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.035]"
                  sizes="(max-width: 1024px) 100vw, 35vw"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 z-10 p-6">
                  <h3
                    className="font-serif text-2xl font-semibold sm:text-3xl"
                    style={imageTextStyle}
                  >
                    {item.title}
                  </h3>

                  <p
                    className="mt-1.5 max-w-sm text-sm leading-5"
                    style={imageTextStyle}
                  >
                    {item.description}
                  </p>

                  <span
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold"
                    style={imageTextStyle}
                  >
                    Keşfet

                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}