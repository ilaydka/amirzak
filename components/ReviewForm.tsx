"use client";

import { useActionState, useEffect, useState } from "react";

import {
  createReview,
  type ReviewState,
} from "@/lib/review-actions";

const initialState: ReviewState = {
  success: false,
  message: "",
};

type ReviewFormProps = {
  productId: number;
};

export default function ReviewForm({
  productId,
}: ReviewFormProps) {
  const [state, formAction, isPending] = useActionState(
    createReview,
    initialState,
  );

  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!state.success) {
      return;
    }

    setRating("5");
    setComment("");
  }, [state.success]);

  return (
    <form
      action={formAction}
      className="rounded-[24px] border border-border bg-surface p-6 shadow-sm sm:p-7"
    >
      <input
        type="hidden"
        name="productId"
        value={productId}
      />

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-soft">
          Değerlendirme
        </p>

        <h3 className="mt-2 font-serif text-2xl font-semibold text-text">
          Deneyiminizi Paylaşın
        </h3>

        <p className="mt-2 text-sm leading-6 text-text-soft">
          Ürün hakkındaki görüşünüz diğer müşterilere yardımcı
          olabilir.
        </p>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold text-text-soft">
          Puanınız
        </p>

        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(String(value))}
              aria-label={`${value} yıldız`}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-soft text-xl transition hover:border-[#d9a514]"
            >
              <span
                className={
                  value <= Number(rating)
                    ? "text-[#d9a514]"
                    : "text-text-muted"
                }
              >
                ★
              </span>
            </button>
          ))}
        </div>

        <input
          type="hidden"
          name="rating"
          value={rating}
        />

        <p className="mt-2 text-xs text-text-muted">
          {rating} / 5
        </p>
      </div>

      <div className="mt-6">
        <label
          htmlFor="comment"
          className="mb-2 block text-sm font-semibold text-text-soft"
        >
          Yorumunuz
        </label>

        <textarea
          id="comment"
          name="comment"
          rows={4}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Bu ürünle ilgili deneyiminizi paylaşın..."
          required
          className="field resize-y px-4 py-3 placeholder:text-text-muted"
        />
      </div>

      {state.message && (
        <div
          className={`mt-5 rounded-2xl p-4 text-sm font-medium ${
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
        className="brand-button mt-5 min-h-12 w-full rounded-xl px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Yorum gönderiliyor..."
          : "Değerlendirmeyi Gönder"}
      </button>
    </form>
  );
}