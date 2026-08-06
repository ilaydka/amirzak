"use client";

import { useActionState } from "react";

import {
  addToCart,
  type AddToCartState,
} from "@/lib/actions";

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

  return (
    <form action={formAction} className="mt-8">
      <input type="hidden" name="productId" value={productId} />

      {state.message && (
        <p
          className={
            state.success
              ? "mb-4 rounded-lg bg-green-950 p-3 text-sm text-green-300"
              : "mb-4 rounded-lg bg-red-950 p-3 text-sm text-red-300"
          }
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={disabled || isPending}
        className="w-full rounded-lg bg-red-600 px-6 py-4 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
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