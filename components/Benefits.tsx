const benefits = [
  {
    title: "Araç Uyumluluğu",
    description:
      "Aracının marka, model, kasa ve motor bilgilerine uygun parçaları kolayca bul.",
  },
  {
    title: "Güvenilir Satıcılar",
    description:
      "Yönetici onayından geçmiş satıcıların ürünlerini güvenle incele.",
  },
  {
    title: "Detaylı Ürün Bilgisi",
    description:
      "Ürünlerin teknik özelliklerini, fiyatlarını ve uyumlu araçlarını karşılaştır.",
  },
];

export default function Benefits() {
  return (
    <section className="bg-zinc-900 px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
            Neden AutoHub?
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Doğru parçayı güvenle bul
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="rounded-xl border border-zinc-800 bg-zinc-950 p-6"
            >
              <h3 className="text-xl font-bold">{benefit.title}</h3>

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