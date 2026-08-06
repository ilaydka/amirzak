import Link from "next/link";

type ProductCardProps = {
  id: number;
  name: string;
  category: string;
  price: string;
  compatibility: string;
  imageUrl?: string | null;
};

export default function ProductCard({
  id,
  name,
  category,
  price,
  compatibility,
  imageUrl,
}: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      <div className="flex h-52 items-center justify-center bg-zinc-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-contain p-4"
          />
        ) : (
          <p className="text-zinc-500">Ürün Görseli</p>
        )}
      </div>

      <div className="p-5">
        <p className="text-sm font-semibold text-red-500">{category}</p>

        <h3 className="mt-2 text-xl font-bold text-white">{name}</h3>

        <p className="mt-2 text-sm text-zinc-400">
          Uyumlu araç: {compatibility}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-xl font-bold text-white">{price}</span>

          <Link
            href={`/products/${id}`}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
          >
            İncele
          </Link>
        </div>
      </div>
    </article>
  );
}