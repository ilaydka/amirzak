"use client";

import { useActionState } from "react";

import { loginUser, type LoginState } from "@/lib/actions";

const initialState: LoginState = {
  message: "",
};

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginUser,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
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
          required
          autoComplete="current-password"
          className="field px-4 py-3"
        />
      </div>

      {state.message && (
        <div className="status-danger rounded-2xl p-4 text-sm font-medium">
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="brand-button min-h-12 w-full rounded-xl px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>
    </form>
  );
}