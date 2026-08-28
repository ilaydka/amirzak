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
    <article className="panel grid gap-6 p-5 md:grid-cols-[140px_minmax(0,1fr)_auto]">
      <div className="flex h-32 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface-soft">
        {item.product.imageUrl ? (
          <img
            src={item.product.imageUrl}
            alt={item.product.name}
            className="h-full w-full object-contain p-3"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-center text-text-muted">
            <span className="text-2xl">
              ◇
            </span>

            <span className="text-sm">
              Ürün Görseli Yok
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-soft">
          {item.product.category}
        </p>

        <h2 className="mt-2 font-serif text-xl font-semibold leading-snug text-text">
          {item.product.name}
        </h2>

        <div className="mt-4">
          {hasDiscount && (
            <p className="text-sm text-text-muted line-through">
              {item.product.price.toLocaleString("tr-TR")} ₺
            </p>
          )}

          <p className="mt-1 text-sm text-text-soft">
            Birim fiyat:{" "}
            <span className="font-semibold text-brand">
              {currentPrice.toLocaleString("tr-TR")} ₺
            </span>
          </p>
        </div>

        {unavailable && (
          <div className="status-danger mt-4 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold">
            Bu ürün artık satışta değil
          </div>
        )}

        {!unavailable && outOfStock && (
          <div className="status-danger mt-4 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold">
            Tükendi
          </div>
        )}

        {!unavailable && lowStock && (
          <div className="status-warning mt-4 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold">
            Son {item.product.stock} ürün
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="flex items-center overflow-hidden rounded-full border border-border bg-surface">
            <form action={decreaseCartItem}>
              <input
                type="hidden"
                name="cartItemId"
                value={item.id}
              />

              <button
                type="submit"
                className="flex h-10 w-10 items-center justify-center text-lg font-semibold text-brand transition hover:bg-brand-pale"
                aria-label="Ürün adedini azalt"
              >
                −
              </button>
            </form>

            <span className="min-w-10 text-center text-sm font-semibold text-text">
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
                className="flex h-10 w-10 items-center justify-center text-lg font-semibold text-brand transition hover:bg-brand-pale disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Ürün adedini artır"
              >
                +
              </button>
            </form>
          </div>

          <form action={removeCartItem}>
            <input
              type="hidden"
              name="cartItemId"
              value={item.id}
            />

            <button
              type="submit"
              className="rounded-full border border-danger px-4 py-2 text-sm font-semibold text-danger transition hover:bg-danger-bg"
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

      <div className="flex flex-col justify-end border-t border-border pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0 md:text-right">
        <div>
          <p className="text-sm text-text-muted">
            Satır toplamı
          </p>

          <p className="mt-1 text-xl font-bold tracking-tight text-brand">
            {lineTotal.toLocaleString("tr-TR")} ₺
          </p>
        </div>
      </div>
    </article>
  );
}