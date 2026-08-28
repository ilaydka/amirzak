"use client";

import { useActionState, useState } from "react";

import {
  createProduct,
  submitProduct,
  updateProduct,
  type ProductActionState,
} from "@/lib/product-actions";

const initialState: ProductActionState = {
  success: false,
  message: "",
};

type ProductFormProps = {
  mode?: "create" | "edit" | "submit";

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
    scientificName: string | null;
    lightRequirement: string | null;
    watering: string | null;
    careLevel: string | null;
    environment: string | null;
    plantSize: string | null;
    petSafe: boolean | null;
    bloomSeason: string | null;
  };
};

export default function ProductForm({
  mode = "create",
  initialValues,
}: ProductFormProps) {
  const action =
    mode === "edit" && initialValues?.id
      ? updateProduct.bind(null, initialValues.id)
      : mode === "submit"
        ? submitProduct
        : createProduct;

  const [state, formAction, isPending] = useActionState(
    action,
    initialState,
  );

  const [name, setName] = useState(
    initialValues?.name ?? "",
  );

  const [brand, setBrand] = useState(
    initialValues?.brand ?? "",
  );

  const [category, setCategory] = useState(
    initialValues?.category ?? "",
  );

  const [price, setPrice] = useState(
    initialValues
      ? String(initialValues.price)
      : "",
  );

  const [discountPrice, setDiscountPrice] =
    useState(
      initialValues?.discountPrice !== null &&
        initialValues?.discountPrice !== undefined
        ? String(initialValues.discountPrice)
        : "",
    );

  const [stock, setStock] = useState(
    initialValues
      ? String(initialValues.stock)
      : "",
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

  const [scientificName, setScientificName] =
    useState(
      initialValues?.scientificName ?? "",
    );

  const [
    lightRequirement,
    setLightRequirement,
  ] = useState(
    initialValues?.lightRequirement ?? "",
  );

  const [watering, setWatering] = useState(
    initialValues?.watering ?? "",
  );

  const [careLevel, setCareLevel] = useState(
    initialValues?.careLevel ?? "",
  );

  const [environment, setEnvironment] =
    useState(
      initialValues?.environment ?? "",
    );

  const [plantSize, setPlantSize] = useState(
    initialValues?.plantSize ?? "",
  );

  const [petSafe, setPetSafe] = useState(
    initialValues?.petSafe === null ||
      initialValues?.petSafe === undefined
      ? ""
      : initialValues.petSafe
        ? "true"
        : "false",
  );

  const [bloomSeason, setBloomSeason] =
    useState(
      initialValues?.bloomSeason ?? "",
    );

  const isSubmitMode = mode === "submit";

  return (
    <form
      action={formAction}
      className="space-y-6"
    >
      {isSubmitMode && (
        <div className="rounded-[20px] border border-border bg-brand-pale/40 p-5">
          <p className="font-semibold text-text">
            Ürününüz incelemeye gönderilecek
          </p>

          <p className="mt-2 text-sm leading-6 text-text-soft">
            Gönderdiğiniz ürün doğrudan satışa
            açılmaz. Ürün bilgileri yönetici
            tarafından incelendikten sonra
            onaylanırsa mağazada yayınlanır.
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-text-soft"
        >
          Ürün Adı
        </label>

        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          required
          placeholder="Örn. Monstera Deliciosa"
          className="field px-4 py-3 placeholder:text-text-muted"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="brand"
            className="mb-2 block text-sm font-medium text-text-soft"
          >
            Marka / Üretici
          </label>

          <input
            id="brand"
            name="brand"
            type="text"
            value={brand}
            onChange={(event) =>
              setBrand(event.target.value)
            }
            required
            placeholder="Örn. AMİRZAK Botanics"
            className="field px-4 py-3 placeholder:text-text-muted"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-medium text-text-soft"
          >
            Kategori
          </label>

          <select
            id="category"
            name="category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            required
            className="field px-4 py-3"
          >
            <option value="">
              Kategori seçin
            </option>

            <option value="İç Mekan Bitkileri">
              İç Mekan Bitkileri
            </option>

            <option value="Dış Mekan Bitkileri">
              Dış Mekan Bitkileri
            </option>

            <option value="Çiçekli Bitkiler">
              Çiçekli Bitkiler
            </option>

            <option value="Sukulent & Kaktüs">
              Sukulent & Kaktüs
            </option>

            <option value="Orkideler">
              Orkideler
            </option>

            <option value="Buket & Kesme Çiçek">
              Buket & Kesme Çiçek
            </option>

            <option value="Saksı & Aksesuar">
              Saksı & Aksesuar
            </option>

            <option value="Bitki Bakım Ürünleri">
              Bitki Bakım Ürünleri
            </option>

            <option value="Diğer">
              Diğer
            </option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="price"
            className="mb-2 block text-sm font-medium text-text-soft"
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
            onChange={(event) =>
              setPrice(event.target.value)
            }
            required
            placeholder="0.00"
            className="field px-4 py-3 placeholder:text-text-muted"
          />
        </div>

        <div>
          <label
            htmlFor="discountPrice"
            className="mb-2 block text-sm font-medium text-text-soft"
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
            onChange={(event) =>
              setDiscountPrice(
                event.target.value,
              )
            }
            placeholder="İndirim yoksa boş bırakın"
            className="field px-4 py-3 placeholder:text-text-muted"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="stock"
          className="mb-2 block text-sm font-medium text-text-soft"
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
          onChange={(event) =>
            setStock(event.target.value)
          }
          required
          placeholder="0"
          className="field px-4 py-3 placeholder:text-text-muted"
        />
      </div>

      <div className="panel-soft space-y-5 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-soft">
            Bitki Özellikleri
          </p>

          <h2 className="mt-2 font-serif text-xl font-semibold text-text">
            Bakım ve Ürün Bilgileri
          </h2>
        </div>

        <div>
          <label
            htmlFor="scientificName"
            className="mb-2 block text-sm font-medium text-text-soft"
          >
            Bilimsel Ad
          </label>

          <input
            id="scientificName"
            name="scientificName"
            type="text"
            value={scientificName}
            onChange={(event) =>
              setScientificName(
                event.target.value,
              )
            }
            placeholder="Örn. Monstera deliciosa"
            className="field px-4 py-3 placeholder:text-text-muted"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="lightRequirement"
              className="mb-2 block text-sm font-medium text-text-soft"
            >
              Işık İhtiyacı
            </label>

            <select
              id="lightRequirement"
              name="lightRequirement"
              value={lightRequirement}
              onChange={(event) =>
                setLightRequirement(
                  event.target.value,
                )
              }
              className="field px-4 py-3"
            >
              <option value="">
                Seçin
              </option>

              <option value="Düşük ışık">
                Düşük ışık
              </option>

              <option value="Orta ışık">
                Orta ışık
              </option>

              <option value="Parlak dolaylı ışık">
                Parlak dolaylı ışık
              </option>

              <option value="Doğrudan güneş">
                Doğrudan güneş
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="watering"
              className="mb-2 block text-sm font-medium text-text-soft"
            >
              Sulama
            </label>

            <input
              id="watering"
              name="watering"
              type="text"
              value={watering}
              onChange={(event) =>
                setWatering(
                  event.target.value,
                )
              }
              placeholder="Örn. Haftada 1 kez"
              className="field px-4 py-3 placeholder:text-text-muted"
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="careLevel"
              className="mb-2 block text-sm font-medium text-text-soft"
            >
              Bakım Seviyesi
            </label>

            <select
              id="careLevel"
              name="careLevel"
              value={careLevel}
              onChange={(event) =>
                setCareLevel(
                  event.target.value,
                )
              }
              className="field px-4 py-3"
            >
              <option value="">
                Seçin
              </option>

              <option value="Kolay">
                Kolay
              </option>

              <option value="Orta">
                Orta
              </option>

              <option value="Zor">
                Zor
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="environment"
              className="mb-2 block text-sm font-medium text-text-soft"
            >
              Ortam
            </label>

            <select
              id="environment"
              name="environment"
              value={environment}
              onChange={(event) =>
                setEnvironment(
                  event.target.value,
                )
              }
              className="field px-4 py-3"
            >
              <option value="">
                Seçin
              </option>

              <option value="İç Mekan">
                İç Mekan
              </option>

              <option value="Dış Mekan">
                Dış Mekan
              </option>

              <option value="İç ve Dış Mekan">
                İç ve Dış Mekan
              </option>
            </select>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="plantSize"
              className="mb-2 block text-sm font-medium text-text-soft"
            >
              Bitki Boyu
            </label>

            <input
              id="plantSize"
              name="plantSize"
              type="text"
              value={plantSize}
              onChange={(event) =>
                setPlantSize(
                  event.target.value,
                )
              }
              placeholder="Örn. 50–70 cm"
              className="field px-4 py-3 placeholder:text-text-muted"
            />
          </div>

          <div>
            <label
              htmlFor="petSafe"
              className="mb-2 block text-sm font-medium text-text-soft"
            >
              Evcil Hayvan Dostu
            </label>

            <select
              id="petSafe"
              name="petSafe"
              value={petSafe}
              onChange={(event) =>
                setPetSafe(
                  event.target.value,
                )
              }
              className="field px-4 py-3"
            >
              <option value="">
                Belirtilmedi
              </option>

              <option value="true">
                Evet
              </option>

              <option value="false">
                Hayır
              </option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="bloomSeason"
            className="mb-2 block text-sm font-medium text-text-soft"
          >
            Çiçeklenme Dönemi
          </label>

          <input
            id="bloomSeason"
            name="bloomSeason"
            type="text"
            value={bloomSeason}
            onChange={(event) =>
              setBloomSeason(
                event.target.value,
              )
            }
            placeholder="Örn. İlkbahar - Yaz"
            className="field px-4 py-3 placeholder:text-text-muted"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="imageUrl"
          className="mb-2 block text-sm font-medium text-text-soft"
        >
          Ürün Görseli Yolu
        </label>

        <input
          id="imageUrl"
          name="imageUrl"
          type="text"
          value={imageUrl}
          onChange={(event) =>
            setImageUrl(event.target.value)
          }
          placeholder="/images/products/monstera.jpg"
          className="field px-4 py-3 placeholder:text-text-muted"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-text-soft"
        >
          Açıklama
        </label>

        <textarea
          id="description"
          name="description"
          rows={6}
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value,
            )
          }
          required
          placeholder="Ürünün görünümü, kullanım alanı ve bakım özelliklerini açıklayın."
          className="field resize-y px-4 py-3 placeholder:text-text-muted"
        />
      </div>

      {!isSubmitMode && (
        <div className="panel-soft p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="isActive"
              checked={isActive}
              onChange={(event) =>
                setIsActive(
                  event.target.checked,
                )
              }
              className="mt-1 h-5 w-5 accent-[#2f4a2a]"
            />

            <div>
              <p className="font-semibold text-text">
                Ürün Aktif
              </p>

              <p className="mt-1 text-sm text-text-soft">
                Pasif ürünler mağazada satışa
                açık olmayacaktır.
              </p>
            </div>
          </label>
        </div>
      )}

      {state.message && !state.success && (
        <div className="status-danger rounded-2xl p-4 text-sm font-medium">
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="brand-button min-h-12 w-full rounded-xl px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? mode === "edit"
            ? "Ürün güncelleniyor..."
            : mode === "submit"
              ? "Ürün gönderiliyor..."
              : "Ürün kaydediliyor..."
          : mode === "edit"
            ? "Değişiklikleri Kaydet"
            : mode === "submit"
              ? "İncelemeye Gönder"
              : "Ürünü Kaydet"}
      </button>
    </form>
  );
}