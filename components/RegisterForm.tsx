"use client";

import { useActionState } from "react";

import {
  registerUser,
  type RegisterState,
} from "@/lib/actions";

const initialState: RegisterState = {
  success: false,
  message: "",
};

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerUser,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-text-soft"
        >
          Ad Soyad
        </label>

        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="field px-4 py-3"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-text-soft"
        >
          E-posta
        </label>

        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="field px-4 py-3"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-text-soft"
        >
          Şifre
        </label>

        <input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          className="field px-4 py-3"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-medium text-text-soft"
        >
          Şifre Tekrar
        </label>

        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          className="field px-4 py-3"
        />
      </div>

      {state.message && (
        <div
          className={`rounded-2xl p-4 text-sm font-medium ${
            state.success
              ? "status-success"
              : "status-danger"
          }`}
        >
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="brand-button min-h-12 w-full rounded-xl px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Hesap oluşturuluyor..."
          : "Hesap Oluştur"}
      </button>
    </form>
  );
}