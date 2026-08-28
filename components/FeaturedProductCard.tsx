import Link from "next/link";

type FeaturedProductCardProps = {
  id: number;
  name: string;
  category: string;
  price: number;
  discountPrice?: number | null;
  imageUrl?: string | null;
};

export default function FeaturedProductCard({
  id,
  name,
  category,
  price,
  discountPrice,
  imageUrl,
}: FeaturedProductCardProps) {
  const hasDiscount =
    discountPrice !== null &&
    discountPrice !== undefined &&
    discountPrice < price;

  const currentPrice = hasDiscount
    ? discountPrice
    : price;

  return (
    <Link
      href={`/products/${id}`}
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[#f0eee7]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#eef1e8]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 text-brand-soft"
              aria-hidden="true"
            >
              <path d="M20.5 3.5C13.2 3.7 7.7 6.2 6.2 11.2C5.1 14.9 7.2 18.1 10.6 18.4C15.9 18.9 19.8 12.7 20.5 3.5Z" />
              <path d="M3.5 21C6.2 15.8 10.3 11.7 16.8 7.5" />
            </svg>
          </div>
        )}

        {hasDiscount && (
          <div className="absolute left-4 top-4 rounded-full bg-[#fffdf8]/95 px-3 py-1.5 text-xs font-semibold text-brand shadow-sm backdrop-blur">
            İndirim
          </div>
        )}

        <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#fffdf8]/95 text-lg text-brand shadow-sm backdrop-blur transition duration-300 group-hover:translate-x-1">
          →
        </div>
      </div>

      <div className="px-1 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-soft">
          {category}
        </p>

        <div className="mt-1.5 flex items-start justify-between gap-5">
          <h3 className="font-serif text-xl font-semibold leading-snug text-text transition group-hover:text-brand">
            {name}
          </h3>

          <div className="shrink-0 text-right">
            {hasDiscount && (
              <p className="text-xs text-text-muted line-through">
                {price.toLocaleString("tr-TR")} ₺
              </p>
            )}

            <p className="font-semibold text-brand">
              {currentPrice.toLocaleString("tr-TR")} ₺
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}