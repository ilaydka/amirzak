import QuickOrderButton from "@/components/QuickOrderButton";

import {
  decreaseCartItem,
  increaseCartItem,
  removeCartItem,
} from "@/lib/cart-actions";

type CartItemCardProps = {
  item: {
    id: string;
    quantity: number;
    product: {
      name: string;
      category: string;
      price: number;
      discountPrice: number | null;
      imageUrl: string | null;
      stock: number;
      isActive: boolean;
    };
  };
};

export default function CartItemCard({
  item,
}: CartItemCardProps) {
  const hasDiscount =
    item.product.discountPrice !== null &&
    item.product.discountPrice < item.product.price;

  const currentPrice =
    hasDiscount && item.product.discountPrice !== null
      ? item.product.discountPrice
      : item.product.price;

  const lineTotal =
    currentPrice * item.quantity;

  const lowStock =
    item.product.stock > 0 &&
    item.product.stock <= 3;

  const outOfStock =
    item.product.stock < 1;

  const unavailable =
    !item.product.isActive;

  return (
    <article className="grid gap-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 md:grid-cols-[140px_1fr_auto]">
      <div className="flex h-32 items-center justify-center overflow-hidden rounded-xl bg-zinc-800">
        {item.product.imageUrl ? (
          <img
            src={item.product.imageUrl}
            alt={item.product.name}
            className="h-full w-full object-contain p-3"
          />
        ) : (
          <span className="text-center text-sm text-zinc-500">
            Ürün Görseli Yok
          </span>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-red-500">
          {item.product.category}
        </p>

        <h2 className="mt-2 text-xl font-bold">
          {item.product.name}
        </h2>

        <div className="mt-4">
          {hasDiscount && (
            <p className="text-sm text-zinc-500 line-through">
              {item.product.price.toLocaleString("tr-TR")} ₺
            </p>
          )}

          <p className="text-sm text-zinc-300">
            Birim fiyat:{" "}
            <span className="font-semibold text-white">
              {currentPrice.toLocaleString("tr-TR")} ₺
            </span>
          </p>
        </div>

        {unavailable && (
          <p className="mt-3 text-sm font-semibold text-red-400">
            Bu ürün artık satışta değil.
          </p>
        )}

        {!unavailable && outOfStock && (
          <p className="mt-3 text-sm font-semibold text-red-400">
            Tükendi
          </p>
        )}

        {!unavailable && lowStock && (
          <p className="mt-3 text-sm font-semibold text-orange-400">
            Son {item.product.stock} ürün!
          </p>
        )}

        <div className="mt-5 flex items-center gap-3">
          <form action={decreaseCartItem}>
            <input
              type="hidden"
              name="cartItemId"
              value={item.id}
            />

            <button
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 text-lg font-bold transition hover:border-red-500 hover:text-red-500"
              aria-label="Ürün adedini azalt"
            >
              −
            </button>
          </form>

          <span className="min-w-8 text-center font-semibold">
            {item.quantity}
          </span>

          <form action={increaseCartItem}>
            <input
              type="hidden"
              name="cartItemId"
              value={item.id}
            />

            <button
              type="submit"
              disabled={
                unavailable ||
                item.quantity >= item.product.stock
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 text-lg font-bold transition hover:border-red-500 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Ürün adedini artır"
            >
              +
            </button>
          </form>

          <form action={removeCartItem}>
            <input
              type="hidden"
              name="cartItemId"
              value={item.id}
            />

            <button
              type="submit"
              className="ml-3 rounded-lg px-3 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-950 hover:text-red-300"
            >
              Sil
            </button>
          </form>
        </div>

        {!unavailable && !outOfStock && (
          <QuickOrderButton
            cartItemId={item.id}
          />
        )}
      </div>

      <div className="flex flex-col justify-end md:text-right">
        <div>
          <p className="text-sm text-zinc-400">
            Satır toplamı
          </p>

          <p className="mt-1 text-xl font-bold">
            {lineTotal.toLocaleString("tr-TR")} ₺
          </p>
        </div>
      </div>
    </article>
  );
}