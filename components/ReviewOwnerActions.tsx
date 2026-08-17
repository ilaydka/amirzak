"use client";

import { useState } from "react";

import DeleteReviewButton from "@/components/DeleteReviewButton";
import EditReviewForm from "@/components/EditReviewForm";

type ReviewOwnerActionsProps = {
  reviewId: string;
  rating: number;
  comment: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
};

export default function ReviewOwnerActions({
  reviewId,
  rating,
  comment,
  deleteAction,
}: ReviewOwnerActionsProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <EditReviewForm
        reviewId={reviewId}
        initialRating={rating}
        initialComment={comment}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="mt-5 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold transition hover:border-red-500 hover:text-red-400"
      >
        Düzenle
      </button>

      <DeleteReviewButton
        reviewId={reviewId}
        action={deleteAction}
      />
    </div>
  );
}