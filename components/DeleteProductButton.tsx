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
        className="danger-button min-h-10 px-4 py-2.5 text-sm !text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Siliniyor..." : "Sil"}
      </button>
    </form>
  );
}