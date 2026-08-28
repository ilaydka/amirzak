"use client";

import {
  useActionState,
  useEffect,
  useState,
} from "react";

import {
  createSupportTicket,
  type SupportState,
} from "@/lib/support-actions";

const initialState: SupportState = {
  success: false,
  message: "",
};

export default function SupportForm() {
  const [state, formAction, isPending] = useActionState(
    createSupportTicket,
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
    }, 3000);

    return () => clearTimeout(timer);
  }, [state]);

  return (
    <form
      action={formAction}
      className="mt-6"
    >
      <div>
        <label
          htmlFor="subject"
          className="text-sm font-medium text-text-soft"
        >
          Konu
        </label>

        <input
          id="subject"
          name="subject"
          type="text"
          required
          placeholder="Örn. Siparişim hakkında"
          className="field mt-2 px-4 py-3 placeholder:text-text-muted"
        />
      </div>

      <div className="mt-5">
        <label
          htmlFor="category"
          className="text-sm font-medium text-text-soft"
        >
          Kategori
        </label>

        <select
          id="category"
          name="category"
          required
          defaultValue=""
          className="field mt-2 px-4 py-3"
        >
          <option value="" disabled>
            Kategori seçin
          </option>

          <option value="ORDER">
            Sipariş
          </option>

          <option value="PRODUCT">
            Ürün
          </option>

          <option value="PAYMENT">
            Ödeme
          </option>

          <option value="ACCOUNT">
            Hesap
          </option>

          <option value="TECHNICAL">
            Teknik Sorun
          </option>

          <option value="OTHER">
            Diğer
          </option>
        </select>
      </div>

      <div className="mt-5">
        <label
          htmlFor="message"
          className="text-sm font-medium text-text-soft"
        >
          Mesajınız
        </label>

        <textarea
          id="message"
          name="message"
          rows={7}
          required
          placeholder="Sorununuzu detaylı şekilde açıklayın."
          className="field mt-2 resize-y px-4 py-3 placeholder:text-text-muted"
        />
      </div>

      {state.message && showMessage && (
        <div
          className={`mt-5 rounded-2xl p-4 ${
            state.success
              ? "status-success"
              : "status-danger"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                state.success
                  ? "bg-[#3f6b46]"
                  : "bg-[#9a5548]"
              }`}
            >
              {state.success ? "✓" : "!"}
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
        className="brand-button mt-6 min-h-12 w-full rounded-xl px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Gönderiliyor..."
          : "Destek Talebi Gönder"}
      </button>
    </form>
  );
}