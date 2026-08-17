"use client";

import { useState } from "react";

type DeleteProductButtonProps = {
  productId: number;
  productName: string;
  action: (formData: FormData) => void | Promise<void>;
};

export default function DeleteProductButton({
  productId,
  productName,
  action,
}: DeleteProductButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      action={action}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `${productName} ürününü silmek istediğinizden emin misiniz?`,
        );

        if (!confirmed) {
          event.preventDefault();
          return;
        }

        setIsSubmitting(true);
      }}
    >
      <input
        type="hidden"
        name="productId"
        value={productId}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Siliniyor..." : "Sil"}
      </button>
    </form>
  );
}