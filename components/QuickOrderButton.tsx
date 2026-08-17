"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  quickOrderCartItem,
  type OrderActionState,
} from "@/lib/order-actions";

const initialState: OrderActionState = {
  success: false,
  message: "",
};

type QuickOrderButtonProps = {
  cartItemId: string;
};

export default function QuickOrderButton({
  cartItemId,
}: QuickOrderButtonProps) {
  const [state, formAction, isPending] = useActionState(
    quickOrderCartItem,
    initialState,
  );

  if (state.success) {
    return (
      <div className="mt-4 rounded-xl border border-green-800 bg-green-950 p-4">
        <p className="text-sm font-semibold text-green-300">
          Siparişiniz başarıyla oluşturuldu.
        </p>

        <Link
          href="/orders"
          className="mt-2 inline-block text-sm font-semibold text-green-200 underline"
        >
          Siparişimi Gör
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-4">
      <input
        type="hidden"
        name="cartItemId"
        value={cartItemId}
      />

      {state.message && (
        <p className="mb-3 rounded-lg bg-red-950 p-3 text-sm text-red-300">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? "Sipariş veriliyor..."
          : "Hızlı Sipariş Ver"}
      </button>
    </form>
  );
}