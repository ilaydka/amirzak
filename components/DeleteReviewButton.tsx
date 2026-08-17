"use client";

type DeleteReviewButtonProps = {
  reviewId: string;
  action: (formData: FormData) => void | Promise<void>;
};

export default function DeleteReviewButton({
  reviewId,
  action,
}: DeleteReviewButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Yorumunuzu silmek istediğinizden emin misiniz?",
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="reviewId" value={reviewId} />

      <button
        type="submit"
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold transition hover:bg-red-500"
      >
        Sil
      </button>
    </form>
  );
}