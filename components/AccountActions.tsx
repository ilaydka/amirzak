"use client";

import {
  useActionState,
  useState,
} from "react";

import {
  deleteAccount,
  logoutUser,
  type DeleteAccountState,
} from "@/lib/account-actions";

const initialState: DeleteAccountState = {
  success: false,
  message: "",
};

export default function AccountActions() {
  const [showDelete, setShowDelete] =
    useState(false);

  const [state, formAction, isPending] =
    useActionState(
      deleteAccount,
      initialState,
    );

  return (
    <section className="mt-10 space-y-6">
      <div className="panel p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-soft">
          Hesap
        </p>

        <h2 className="mt-2 font-serif text-2xl font-semibold text-text">
          Hesap İşlemleri
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-soft">
          Oturumunuzu güvenli bir şekilde
          kapatabilirsiniz.
        </p>

        <form
          action={logoutUser}
          className="mt-5"
        >
          <button
            type="submit"
            className="secondary-button min-h-11 px-6 py-3 text-sm"
          >
            Çıkış Yap
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-danger bg-danger-bg p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-danger">
          Tehlikeli Bölge
        </p>

        <h2 className="mt-2 font-serif text-2xl font-semibold text-danger">
          Hesabı Sil
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-danger">
          Hesabınızı silmeniz durumunda profiliniz
          ve hesabınıza bağlı veriler kalıcı olarak
          silinir. Bu işlem geri alınamaz.
        </p>

        {!showDelete ? (
          <button
            type="button"
            onClick={() =>
              setShowDelete(true)
            }
            className="danger-button mt-5 min-h-11 px-6 py-3 text-sm !text-white"
          >
            Hesabımı Sil
          </button>
        ) : (
          <form
            action={formAction}
            className="mt-6 max-w-xl"
          >
            <label
              htmlFor="confirmation"
              className="block text-sm font-semibold text-danger"
            >
              Devam etmek için aşağıya
              HESABIMI SİL yazın
            </label>

            <input
              id="confirmation"
              name="confirmation"
              type="text"
              required
              autoComplete="off"
              placeholder="HESABIMI SİL"
              className="field mt-3 px-4 py-3"
            />

            {state.message && (
              <div className="status-danger mt-4 rounded-xl p-4 text-sm font-medium">
                {state.message}
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="danger-button min-h-11 px-6 py-3 text-sm !text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending
                  ? "Hesap siliniyor..."
                  : "Hesabımı Kalıcı Olarak Sil"}
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  setShowDelete(false)
                }
                className="secondary-button min-h-11 px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Vazgeç
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}