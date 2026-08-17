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
      className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
    >
      <input
        type="hidden"
        name="productId"
        value={productId}
      />

      <h3 className="text-xl font-bold">
        Yorum Yap
      </h3>

      <div className="mt-5">
        <label
          htmlFor="rating"
          className="mb-2 block text-sm font-semibold text-zinc-300"
        >
          Puan
        </label>

        <select
          id="rating"
          name="rating"
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-500"
        >
          <option value="5">★★★★★ - 5</option>
          <option value="4">★★★★☆ - 4</option>
          <option value="3">★★★☆☆ - 3</option>
          <option value="2">★★☆☆☆ - 2</option>
          <option value="1">★☆☆☆☆ - 1</option>
        </select>
      </div>

      <div className="mt-5">
        <label
          htmlFor="comment"
          className="mb-2 block text-sm font-semibold text-zinc-300"
        >
          Yorumunuz
        </label>

        <textarea
          id="comment"
          name="comment"
          rows={5}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Ürün hakkındaki deneyiminizi paylaşın..."
          required
          className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-500"
        />
      </div>

      {state.message && (
        <p
          className={
            state.success
              ? "mt-5 rounded-lg bg-green-950 p-3 text-sm text-green-300"
              : "mt-5 rounded-lg bg-red-950 p-3 text-sm text-red-300"
          }
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-5 w-full rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Yorum gönderiliyor..." : "Yorumu Gönder"}
      </button>
    </form>
  );
}