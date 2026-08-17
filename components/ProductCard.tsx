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
import {
  buyNow,
  type OrderActionState,
} from "@/lib/order-actions";

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

const initialOrderState: OrderActionState = {
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

  const [cartState, cartAction, isCartPending] =
    useActionState(
      addToCart,
      initialCartState,
    );

  const [orderState, orderAction, isOrderPending] =
    useActionState(
      buyNow,
      initialOrderState,
    );

  const [showCartMessage, setShowCartMessage] =
    useState(false);

  const [showOrderMessage, setShowOrderMessage] =
    useState(false);

  useEffect(() => {
    if (!cartState.message) {
      return;
    }

    setShowCartMessage(true);

    if (!cartState.success) {
      return;
    }

    const timer = setTimeout(() => {
      setShowCartMessage(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [cartState]);

  useEffect(() => {
    if (!orderState.message) {
      return;
    }

    setShowOrderMessage(true);

    if (!orderState.success) {
      return;
    }

    const timer = setTimeout(() => {
      setShowOrderMessage(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [orderState]);

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
    <article className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      <div className="relative flex h-52 items-center justify-center bg-zinc-800">
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
            İndirim
          </span>
        )}

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-contain p-4"
          />
        ) : (
          <p className="text-zinc-500">
            Ürün Görseli
          </p>
        )}
      </div>

      <div className="p-5">
        <p className="text-sm font-semibold text-red-500">
          {category}
        </p>

        <h3 className="mt-2 text-xl font-bold text-white">
          {name}
        </h3>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            {hasDiscount && (
              <p className="text-sm text-zinc-500 line-through">
                {price.toLocaleString("tr-TR")} ₺
              </p>
            )}

            <p className="text-xl font-bold text-white">
              {currentPrice.toLocaleString("tr-TR")} ₺
            </p>
          </div>

          <span
            className={
              outOfStock
                ? "text-sm font-semibold text-red-400"
                : "text-sm font-semibold text-green-400"
            }
          >
            {outOfStock ? "Tükendi" : "Stokta"}
          </span>
        </div>

        {!outOfStock && (
          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold text-zinc-300">
              Adet
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="h-10 w-10 rounded-lg border border-zinc-700 text-lg font-bold text-white transition hover:border-red-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                −
              </button>

              <span className="min-w-10 text-center font-semibold text-white">
                {quantity}
              </span>

              <button
                type="button"
                onClick={increaseQuantity}
                disabled={quantity >= stock}
                className="h-10 w-10 rounded-lg border border-zinc-700 text-lg font-bold text-white transition hover:border-red-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>
        )}

        {cartState.message && showCartMessage && (
          <p
            className={
              cartState.success
                ? "mt-4 rounded-lg bg-green-950 p-3 text-sm text-green-300"
                : "mt-4 rounded-lg bg-red-950 p-3 text-sm text-red-300"
            }
          >
            {cartState.message}
          </p>
        )}

        {orderState.message && showOrderMessage && (
          <div
            className={
              orderState.success
                ? "mt-4 rounded-lg bg-green-950 p-3 text-sm text-green-300"
                : "mt-4 rounded-lg bg-red-950 p-3 text-sm text-red-300"
            }
          >
            <p>
              {orderState.message}
            </p>

            {orderState.success && (
              <Link
                href="/orders"
                className="mt-2 inline-block font-semibold underline"
              >
                Siparişlerimi Gör
              </Link>
            )}
          </div>
        )}

        <div className="mt-5 grid gap-3">
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
              className="w-full rounded-lg border border-red-600 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isCartPending
                ? "Sepete ekleniyor..."
                : "Sepete Ekle"}
            </button>
          </form>

          <form action={orderAction}>
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
                isOrderPending
              }
              className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isOrderPending
                ? "Sipariş oluşturuluyor..."
                : "Hemen Sipariş Ver"}
            </button>
          </form>

          <Link
            href={`/products/${id}`}
            className="rounded-lg border border-zinc-700 px-4 py-3 text-center text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            Ürünü İncele
          </Link>
        </div>
      </div>
    </article>
  );
}