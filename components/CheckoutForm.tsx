"use client";

import { useActionState } from "react";

import {
  startIyzicoPayment,
  type PaymentActionState,
} from "@/lib/payment-actions";

const initialState: PaymentActionState = {
  success: false,
  message: "",
};

type CheckoutFormProps = {
  disabled?: boolean;
  productId?: number;
  quantity?: number;
};

export default function CheckoutForm({
  disabled = false,
  productId,
  quantity,
}: CheckoutFormProps) {
  const [state, formAction, isPending] =
    useActionState(
      startIyzicoPayment,
      initialState,
    );

  const isBuyNow =
    productId !== undefined &&
    quantity !== undefined;

  return (
    <form
      action={formAction}
      className="mt-6"
    >
      <input
        type="hidden"
        name="checkoutType"
        value={isBuyNow ? "BUY_NOW" : "CART"}
      />

      {isBuyNow && (
        <>
          <input
            type="hidden"
            name="productId"
            value={productId}
          />

          <input
            type="hidden"
            name="quantity"
            value={quantity}
          />
        </>
      )}

      <div className="panel-brand p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
              />
              <path d="M3 10h18" />
              <path d="M7 15h3" />
            </svg>
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-brand">
              Kredi / Banka Kartı
            </p>

            <p className="mt-1 text-sm leading-6 text-text-soft">
              Ödemeniz iyzico güvenli ödeme altyapısı üzerinden gerçekleştirilecektir.
            </p>
          </div>
        </div>
      </div>

      {state.message && !state.success && (
        <div className="status-danger mt-4 rounded-2xl p-4">
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
        disabled={disabled || isPending}
        className="brand-button mt-5 min-h-12 w-full rounded-xl px-6 py-4 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Güvenli ödeme hazırlanıyor..."
          : "Güvenli Ödemeye Geç"}
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-muted">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <rect
            x="5"
            y="10"
            width="14"
            height="10"
            rx="2"
          />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>

        iyzico ile güvenli ödeme
      </div>
    </form>
  );
}