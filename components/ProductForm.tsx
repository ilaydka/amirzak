"use client";

import { useActionState, useState } from "react";

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
    discountPrice: number | null;
    stock: number;
    imageUrl: string | null;
    description: string;
    isActive: boolean;
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
  const [category, setCategory] = useState(
    initialValues?.category ?? "",
  );
  const [price, setPrice] = useState(
    initialValues ? String(initialValues.price) : "",
  );
  const [discountPrice, setDiscountPrice] = useState(
    initialValues?.discountPrice !== null &&
      initialValues?.discountPrice !== undefined
      ? String(initialValues.discountPrice)
      : "",
  );
  const [stock, setStock] = useState(
    initialValues ? String(initialValues.stock) : "",
  );
  const [imageUrl, setImageUrl] = useState(
    initialValues?.imageUrl ?? "",
  );
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [isActive, setIsActive] = useState(
    initialValues?.isActive ?? true,
  );

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
          placeholder="Ürün adını girin"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-red-500"
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
          placeholder="Ürün markasını girin"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-red-500"
        />
      </div>

      <div>
        <label
          htmlFor="category"
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          Kategori
        </label>

        <select
          id="category"
          name="category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-red-500"
        >
          <option value="">Kategori seçin</option>
          <option value="Elektronik">Elektronik</option>
          <option value="Giyim">Giyim</option>
          <option value="Ev & Yaşam">Ev & Yaşam</option>
          <option value="Kitap">Kitap</option>
          <option value="Kozmetik">Kozmetik</option>
          <option value="Spor">Spor</option>
          <option value="Otomotiv">Otomotiv</option>
          <option value="Oyuncak">Oyuncak</option>
          <option value="Diğer">Diğer</option>
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="price"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Normal Fiyat
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
            placeholder="0.00"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-red-500"
          />
        </div>

        <div>
          <label
            htmlFor="discountPrice"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            İndirimli Fiyat
          </label>

          <input
            id="discountPrice"
            name="discountPrice"
            type="number"
            min="0.01"
            step="0.01"
            value={discountPrice}
            onChange={(event) => setDiscountPrice(event.target.value)}
            placeholder="İndirim yoksa boş bırakın"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-red-500"
          />
        </div>
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
          step="1"
          value={stock}
          onChange={(event) => setStock(event.target.value)}
          required
          placeholder="0"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-red-500"
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
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-red-500"
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
          placeholder="Ürün açıklamasını girin"
          className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-red-500"
        />
      </div>

      <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-4">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="isActive"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-5 w-5 accent-red-600"
          />

          <div>
            <p className="font-semibold text-white">
              Ürün Aktif
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              Pasif ürünler mağazada satışa açık olmayacaktır.
            </p>
          </div>
        </label>
      </div>

      {state.message && !state.success && (
        <p className="rounded-lg bg-red-950 p-3 text-sm text-red-300">
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