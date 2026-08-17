"use client";

import { useActionState, useEffect, useState } from "react";

import {
  updateReview,
  type ReviewState,
} from "@/lib/review-actions";

const initialState: ReviewState = {
  success: false,
  message: "",
};

type EditReviewFormProps = {
  reviewId: string;
  initialRating: number;
  initialComment: string;
  onCancel: () => void;
};

export default function EditReviewForm({
  reviewId,
  initialRating,
  initialComment,
  onCancel,
}: EditReviewFormProps) {
  const action = updateReview.bind(null, reviewId);

  const [state, formAction, isPending] = useActionState(
    action,
    initialState,
  );

  const [rating, setRating] = useState(String(initialRating));
  const [comment, setComment] = useState(initialComment);

  useEffect(() => {
    if (state.success) {
      onCancel();
    }
  }, [state.success, onCancel]);

  return (
    <form
      action={formAction}
      className="mt-5 rounded-xl border border-zinc-700 bg-zinc-950 p-5"
    >
      <div>
        <label
          htmlFor={`rating-${reviewId}`}
          className="mb-2 block text-sm font-semibold text-zinc-300"
        >
          Puan
        </label>

        <select
          id={`rating-${reviewId}`}
          name="rating"
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-500"
        >
          <option value="5">★★★★★ - 5</option>
          <option value="4">★★★★☆ - 4</option>
          <option value="3">★★★☆☆ - 3</option>
          <option value="2">★★☆☆☆ - 2</option>
          <option value="1">★☆☆☆☆ - 1</option>
        </select>
      </div>

      <div className="mt-4">
        <label
          htmlFor={`comment-${reviewId}`}
          className="mb-2 block text-sm font-semibold text-zinc-300"
        >
          Yorumunuz
        </label>

        <textarea
          id={`comment-${reviewId}`}
          name="comment"
          rows={4}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          required
          className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-500"
        />
      </div>

      {state.message && !state.success && (
        <p className="mt-4 rounded-lg bg-red-950 p-3 text-sm text-red-300">
          {state.message}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Güncelleniyor..."
            : "Değişiklikleri Kaydet"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
        >
          İptal
        </button>
      </div>
    </form>
  );
}