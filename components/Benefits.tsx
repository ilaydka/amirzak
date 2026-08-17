const benefits = [
  {
    title: "Geniş Ürün Seçeneği",
    description:
      "Farklı kategorilerdeki ürünleri tek platformda keşfet, ihtiyaçlarına uygun ürünleri kolayca bul.",
  },
  {
    title: "Güvenilir Alışveriş",
    description:
      "Ürünleri, satıcıları ve kullanıcı değerlendirmelerini inceleyerek alışverişini güvenle yap.",
  },
  {
    title: "Kolay ve Hızlı Deneyim",
    description:
      "Ürünleri karşılaştır, sepetine ekle ve siparişlerini tek bir yerden kolayca takip et.",
  },
];

export default function Benefits() {
  return (
    <section className="bg-zinc-900 px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
            Neden AMİRZAK?
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Aradığın her şeyi tek yerde keşfet
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="rounded-xl border border-zinc-800 bg-zinc-950 p-6"
            >
              <h3 className="text-xl font-bold">
                {benefit.title}
              </h3>

              <p className="mt-3 leading-7 text-zinc-400">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}