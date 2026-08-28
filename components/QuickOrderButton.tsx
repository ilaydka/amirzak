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
      <div className="status-success mt-4 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3f6b46] text-sm font-bold text-white">
            ✓
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              Siparişiniz başarıyla oluşturuldu.
            </p>

            <p className="mt-1 text-xs opacity-80">
              Siparişiniz hesabınıza kaydedildi.
            </p>

            <Link
              href="/orders"
              className="secondary-button mt-3 inline-flex px-4 py-2 text-xs"
            >
              Siparişimi Gör →
            </Link>
          </div>
        </div>
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
        <div className="status-danger mb-3 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#9a5548] text-sm font-bold text-white">
              !
            </div>

            <p className="text-sm font-semibold leading-6">
              {state.message}
            </p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="brand-button min-h-11 rounded-xl px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Sipariş veriliyor..."
          : "Hızlı Sipariş Ver"}
      </button>
    </form>
  );
}