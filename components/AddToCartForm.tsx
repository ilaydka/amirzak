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

const initialState: AddToCartState = {
  success: false,
  message: "",
};

type AddToCartFormProps = {
  productId: number;
  disabled?: boolean;
};

export default function AddToCartForm({
  productId,
  disabled = false,
}: AddToCartFormProps) {
  const [state, formAction, isPending] = useActionState(
    addToCart,
    initialState,
  );

  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (!state.message) {
      return;
    }

    setShowMessage(true);

    if (!state.success) {
      return;
    }

    const timer = setTimeout(() => {
      setShowMessage(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [state]);

  return (
    <form action={formAction} className="mt-8">
      <input
        type="hidden"
        name="productId"
        value={productId}
      />

      {state.message && showMessage && (
        <div
          className={`mb-4 rounded-2xl p-4 ${
            state.success
              ? "status-success"
              : "status-danger"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                state.success
                  ? "bg-success"
                  : "bg-danger"
              }`}
            >
              {state.success ? "✓" : "!"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {state.message}
              </p>

              {state.success && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href="/cart"
                    className="brand-button px-4 py-2 text-xs"
                  >
                    Sepete Git
                  </Link>

                  <button
                    type="button"
                    onClick={() => setShowMessage(false)}
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

      <button
        type="submit"
        disabled={disabled || isPending}
        className="brand-button min-h-12 w-full rounded-xl px-6 py-4 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        {disabled
          ? "Stokta Yok"
          : isPending
            ? "Sepete ekleniyor..."
            : "Sepete Ekle"}
      </button>
    </form>
  );
}