type ProductCardProps = {
  name: string;
  category: string;
  price: string;
  compatibility: string;
};

export default function ProductCard({
  name,
  category,
  price,
  compatibility,
}: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      <div className="flex h-52 items-center justify-center bg-zinc-800 text-zinc-500">
        Ürün Görseli
      </div>

      <div className="p-5">
        <p className="text-sm font-semibold text-red-500">
          {category}
        </p>

        <h3 className="mt-2 text-xl font-bold">
          {name}
        </h3>

        <p className="mt-2 text-sm text-zinc-400">
          Uyumlu Araç: {compatibility}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-xl font-bold">
            {price}
          </span>

          <button className="rounded-lg bg-red-600 px-4 py-2 font-semibold hover:bg-red-500">
            İncele
          </button>
        </div>
      </div>
    </article>
  );
}