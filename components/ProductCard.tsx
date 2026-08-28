"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useState,
} from "react";

import {
  addToCart,
  type AddToCartState,
} from "@/lib/cart-actions";

type ProductCardProps = {
  id: number;
  name: string;
  category: string;
  price: number;
  discountPrice?: number | null;
  imageUrl?: string | null;
  stock: number;
};

const initialCartState: AddToCartState = {
  success: false,
  message: "",
};

export default function ProductCard({
  id,
  name,
  category,
  price,
  discountPrice,
  imageUrl,
  stock,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);

  const [
    cartState,
    cartAction,
    isCartPending,
  ] = useActionState(
    addToCart,
    initialCartState,
  );

  const [
    showCartMessage,
    setShowCartMessage,
  ] = useState(false);

  useEffect(() => {
    if (!cartState.message) {
      return;
    }

    setShowCartMessage(true);

    const timer = setTimeout(() => {
      setShowCartMessage(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [cartState]);

  const outOfStock = stock < 1;

  const hasDiscount =
    discountPrice !== null &&
    discountPrice !== undefined &&
    discountPrice < price;

  const currentPrice = hasDiscount
    ? discountPrice
    : price;

  function increaseQuantity() {
    setQuantity((current) =>
      Math.min(
        current + 1,
        Math.max(stock, 1),
      ),
    );
  }

  function decreaseQuantity() {
    setQuantity((current) =>
      Math.max(current - 1, 1),
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-border bg-surface shadow-sm transition duration-200 hover:-translate-y-1 hover:border-border-brand hover:shadow-md">
      <Link
        href={`/products/${id}`}
        className="relative block shrink-0 overflow-hidden border-b border-border bg-surface-soft"
      >
        <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
          {outOfStock ? (
            <span className="status-danger rounded-full px-3 py-1.5 text-xs font-semibold">
              Tükendi
            </span>
          ) : (
            <span className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-white">
              Stokta
            </span>
          )}

          {hasDiscount && (
            <span className="status-warning rounded-full px-3 py-1.5 text-xs font-semibold">
              İndirim
            </span>
          )}
        </div>

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="block h-auto w-full transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex aspect-[5/4] w-full flex-col items-center justify-center gap-3 text-text-muted">
            <span className="text-3xl">
              ◇
            </span>

            <p className="text-sm">
              Ürün Görseli
            </p>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-soft">
          {category}
        </p>

        <Link
          href={`/products/${id}`}
          className="mt-2 block"
        >
          <h3 className="line-clamp-2 font-serif text-xl font-semibold leading-snug text-text transition group-hover:text-brand">
            {name}
          </h3>
        </Link>

        <div className="mt-5 min-h-[58px]">
          {hasDiscount && (
            <p className="text-sm text-text-muted line-through">
              {price.toLocaleString("tr-TR")} ₺
            </p>
          )}

          <p className="mt-0.5 text-2xl font-bold tracking-tight text-brand">
            {currentPrice.toLocaleString("tr-TR")} ₺
          </p>
        </div>

        {!outOfStock && (
          <div className="mt-4 flex items-center justify-between border-y border-border py-4">
            <p className="text-sm font-medium text-text-soft">
              Adet
            </p>

            <div className="flex items-center overflow-hidden rounded-full border border-border bg-surface">
              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                aria-label="Adedi azalt"
                className="flex h-9 w-10 items-center justify-center text-lg font-medium text-brand transition hover:bg-brand-pale disabled:cursor-not-allowed disabled:opacity-30"
              >
                −
              </button>

              <span className="min-w-10 text-center text-sm font-semibold text-text">
                {quantity}
              </span>

              <button
                type="button"
                onClick={increaseQuantity}
                disabled={quantity >= stock}
                aria-label="Adedi artır"
                className="flex h-9 w-10 items-center justify-center text-lg font-medium text-brand transition hover:bg-brand-pale disabled:cursor-not-allowed disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>
        )}

        {cartState.message &&
          showCartMessage && (
            <div
              className={`mt-4 rounded-2xl p-4 ${
                cartState.success
                  ? "status-success"
                  : "status-danger"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                    cartState.success
                      ? "bg-success"
                      : "bg-danger"
                  }`}
                >
                  {cartState.success
                    ? "✓"
                    : "!"}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {cartState.message}
                  </p>

                  {cartState.success && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href="/cart"
                        className="brand-button px-4 py-2 text-xs"
                      >
                        Sepete Git
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          setShowCartMessage(
                            false,
                          )
                        }
                        className="secondary-button px-4 py-2 text-xs"
                      >
                        Alışverişe Devam Et
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        <div className="mt-auto pt-5">
          <div className="grid gap-2.5">
            <form action={cartAction}>
              <input
                type="hidden"
                name="productId"
                value={id}
              />

              <input
                type="hidden"
                name="quantity"
                value={quantity}
              />

              <button
                type="submit"
                disabled={
                  outOfStock ||
                  isCartPending
                }
                className="secondary-button min-h-11 w-full rounded-xl px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                {outOfStock
                  ? "Stokta Yok"
                  : isCartPending
                    ? "Sepete ekleniyor..."
                    : "Sepete Ekle"}
              </button>
            </form>

            {outOfStock ? (
              <button
                type="button"
                disabled
                className="brand-button min-h-11 w-full rounded-xl px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Stokta Yok
              </button>
            ) : (
              <Link
                href={`/checkout?productId=${id}&quantity=${quantity}`}
                className="brand-button flex min-h-11 w-full items-center justify-center rounded-xl px-4 py-3 text-sm"
              >
                Hemen Sipariş Ver
              </Link>
            )}

            <Link
              href={`/products/${id}`}
              className="mt-1 rounded-lg py-2 text-center text-sm font-medium text-text-soft transition hover:bg-brand-pale hover:text-brand"
            >
              Ürünü İncele →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}