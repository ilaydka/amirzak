const benefits = [
  {
    icon: "truck",
    title: "Hızlı Kargo",
    description:
      "Siparişlerinizi güvenli şekilde hazırlayıp hızlıca yola çıkarıyoruz.",
  },
  {
    icon: "shield",
    title: "Güvenli Alışveriş",
    description:
      "Ürün, sipariş ve hesap süreçlerinizi sade ve güvenilir bir deneyimle yönetin.",
  },
  {
    icon: "box",
    title: "Kolay İade",
    description:
      "İade süreçlerini karmaşıklaştırmadan, anlaşılır ve kolay bir şekilde takip edin.",
  },
  {
    icon: "support",
    title: "Müşteri Desteği",
    description:
      "Sorularınız ve talepleriniz için destek merkezimiz her zaman yanınızda.",
  },
];

function BenefitIcon({
  type,
}: {
  type: string;
}) {
  if (type === "truck") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M3 7h10v8H3z" />
        <path d="M13 10h4l3 3v2h-7z" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    );
  }

  if (type === "shield") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M12 3 5 6v5c0 5 3.5 8 7 10 3.5-2 7-5 7-10V6z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }

  if (type === "box") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M21 8 12 3 3 8l9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
        <path d="m7.5 5.5 9 5" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M4 13a8 8 0 0 1 16 0" />
      <path d="M4 13v4a2 2 0 0 0 2 2h1v-6H4z" />
      <path d="M20 13v4a2 2 0 0 1-2 2h-1v-6h3z" />
      <path d="M17 19c0 1.1-.9 2-2 2h-3" />
    </svg>
  );
}

export default function Benefits() {
  return (
    <section className="relative -mt-1 overflow-hidden px-6 pb-10 pt-7 sm:pb-12 sm:pt-9">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#f4eee3]/20 via-[#eef1e7]/65 to-background" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-x-8 gap-y-7 border-t border-brand/10 pt-7 sm:grid-cols-2 xl:grid-cols-4">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="group flex items-start gap-4"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand/10 bg-white/65 text-brand shadow-[0_4px_18px_rgba(31,53,28,0.04)] backdrop-blur-sm transition duration-200 group-hover:bg-brand-pale">
                <BenefitIcon type={benefit.icon} />
              </div>

              <div className="pt-0.5">
                <h3 className="font-serif text-lg font-semibold text-brand">
                  {benefit.title}
                </h3>

                <p className="mt-1.5 max-w-[250px] text-sm leading-6 text-text-soft">
                  {benefit.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}