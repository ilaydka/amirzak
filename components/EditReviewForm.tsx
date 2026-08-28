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
      className="mt-5 rounded-2xl border border-border bg-surface-soft p-5"
    >
      <div>
        <label
          htmlFor={`rating-${reviewId}`}
          className="mb-2 block text-sm font-semibold text-text-soft"
        >
          Puan
        </label>

        <select
          id={`rating-${reviewId}`}
          name="rating"
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          className="field px-4 py-3 text-[#d9a514]"
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
          className="mb-2 block text-sm font-semibold text-text-soft"
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
          className="field resize-y px-4 py-3"
        />
      </div>

      {state.message && !state.success && (
        <div className="status-danger mt-4 rounded-2xl p-4 text-sm font-medium">
          {state.message}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="brand-button min-h-10 px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? "Güncelleniyor..."
            : "Değişiklikleri Kaydet"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="secondary-button min-h-10 px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          İptal
        </button>
      </div>
    </form>
  );
}