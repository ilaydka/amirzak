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
      className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
    >
      <h2 className="text-2xl font-bold">
        Destek Talebi Oluştur
      </h2>

      <p className="mt-2 text-zinc-400">
        Sorununuzu veya talebinizi bize iletin.
      </p>

      <div className="mt-6">
        <label
          htmlFor="subject"
          className="text-sm font-medium text-zinc-400"
        >
          Konu
        </label>

        <input
          id="subject"
          name="subject"
          type="text"
          required
          placeholder="Örn. Siparişim hakkında"
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500"
        />
      </div>

      <div className="mt-5">
        <label
          htmlFor="category"
          className="text-sm font-medium text-zinc-400"
        >
          Kategori
        </label>

        <select
          id="category"
          name="category"
          required
          defaultValue=""
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-red-500"
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
          className="text-sm font-medium text-zinc-400"
        >
          Mesajınız
        </label>

        <textarea
          id="message"
          name="message"
          rows={7}
          required
          placeholder="Sorununuzu detaylı şekilde açıklayın."
          className="mt-2 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500"
        />
      </div>

      {state.message && showMessage && (
        <p
          className={
            state.success
              ? "mt-5 rounded-lg border border-green-900 bg-green-950 p-4 text-sm text-green-300"
              : "mt-5 rounded-lg border border-red-900 bg-red-950 p-4 text-sm text-red-300"
          }
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? "Gönderiliyor..."
          : "Destek Talebi Gönder"}
      </button>
    </form>
  );
}