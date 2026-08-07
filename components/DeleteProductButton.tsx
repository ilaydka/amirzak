"use client";

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
  return (
    <form
      action={action}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `${productName} ürününü silmek istediğinizden emin misiniz?`,
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="productId" value={productId} />

      <button
        type="submit"
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold transition hover:bg-red-500"
      >
        Sil
      </button>
    </form>
  );
}