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
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          Ad Soyad
        </label>

        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-red-500"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          E-posta
        </label>

        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-red-500"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          Şifre
        </label>

        <input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-red-500"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          Şifre Tekrar
        </label>

        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          minLength={8}
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-red-500"
        />
      </div>

      {state.message && (
        <p
          className={
            state.success
              ? "rounded-lg bg-green-950 p-3 text-sm text-green-300"
              : "rounded-lg bg-red-950 p-3 text-sm text-red-300"
          }
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-red-600 py-3 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Hesap oluşturuluyor..." : "Hesap Oluştur"}
      </button>
    </form>
  );
}