"use client";

import { useActionState } from "react";

import {
  createOrder,
  type OrderActionState,
} from "@/lib/order-actions";

const initialState: OrderActionState = {
  success: false,
  message: "",
};

export default function CheckoutButton() {
  const [state, formAction, isPending] = useActionState(
    createOrder,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6">
      {state.message && !state.success && (
        <p className="mb-4 rounded-lg border border-red-800 bg-red-950 p-4 text-sm text-red-300">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? "Sipariş oluşturuluyor..."
          : "Siparişi Tamamla"}
      </button>
    </form>
  );
}