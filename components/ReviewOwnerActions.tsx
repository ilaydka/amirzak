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
        className="secondary-button px-4 py-2.5 text-sm"
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