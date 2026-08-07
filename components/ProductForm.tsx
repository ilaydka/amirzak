"use client";

import { useActionState, useEffect, useState } from "react";

import {
  createProduct,
  updateProduct,
  type ProductActionState,
} from "@/lib/product-actions";

const initialState: ProductActionState = {
  success: false,
  message: "",
};

type ProductFormProps = {
  mode?: "create" | "edit";
  initialValues?: {
    id?: number;
    name: string;
    brand: string;
    category: string;
    price: number;
    stock: number;
    compatibility: string;
    imageUrl: string | null;
    description: string;
  };
};

export default function ProductForm({
  mode = "create",
  initialValues,
}: ProductFormProps) {
  const action =
    mode === "edit" && initialValues?.id
      ? updateProduct.bind(null, initialValues.id)
      : createProduct;

  const [state, formAction, isPending] = useActionState(
    action,
    initialState,
  );

  const [name, setName] = useState(initialValues?.name ?? "");
  const [brand, setBrand] = useState(initialValues?.brand ?? "");
  const [category, setCategory] = useState(initialValues?.category ?? "");
  const [price, setPrice] = useState(
    initialValues ? String(initialValues.price) : "",
  );
  const [stock, setStock] = useState(
    initialValues ? String(initialValues.stock) : "",
  );
  const [compatibility, setCompatibility] = useState(
    initialValues?.compatibility ?? "",
  );
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );

  useEffect(() => {
    if (!state.success || mode !== "create") {
      return;
    }

    setName("");
    setBrand("");
    setCategory("");
    setPrice("");
    setStock("");
    setCompatibility("");
    setImageUrl("");
    setDescription("");
  }, [mode, state.success]);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          Ürün Adı
        </label>

        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-red-500"
        />
      </div>

      <div>
        <label
          htmlFor="brand"
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          Marka
        </label>

        <input
          id="brand"
          name="brand"
          type="text"
          value={brand}
          onChange={(event) => setBrand(event.target.value)}
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-red-500"
        />
      </div>

      <div>
        <label
          htmlFor="category"
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          Kategori
        </label>

        <input
          id="category"
          name="category"
          type="text"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-red-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="price"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Fiyat
          </label>

          <input
            id="price"
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-red-500"
          />
        </div>

        <div>
          <label
            htmlFor="stock"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Stok
          </label>

          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            value={stock}
            onChange={(event) => setStock(event.target.value)}
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-red-500"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="compatibility"
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          Uyumlu Araç
        </label>

        <input
          id="compatibility"
          name="compatibility"
          type="text"
          value={compatibility}
          onChange={(event) => setCompatibility(event.target.value)}
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-red-500"
        />
      </div>

      <div>
        <label
          htmlFor="imageUrl"
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          Ürün Görseli Yolu
        </label>

        <input
          id="imageUrl"
          name="imageUrl"
          type="text"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="/images/products/urun.jpg"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-red-500"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          Açıklama
        </label>

        <textarea
          id="description"
          name="description"
          rows={6}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
          className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-red-500"
        />
      </div>

      {state.message && (
        <p
          className={
            state.success
              ? "rounded-lg bg-green-950 p-3 text-sm text-green-300"
              : "rounded-lg bg-red-950 p-3 text-sm text-red-300"
          }
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? mode === "edit"
            ? "Ürün güncelleniyor..."
            : "Ürün kaydediliyor..."
          : mode === "edit"
            ? "Değişiklikleri Kaydet"
            : "Ürünü Kaydet"}
      </button>
    </form>
  );
}