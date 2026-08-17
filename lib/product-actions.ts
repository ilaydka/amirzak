"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const productSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Ürün adı boş bırakılamaz.")
      .max(120, "Ürün adı en fazla 120 karakter olabilir."),

    brand: z
      .string()
      .trim()
      .min(1, "Marka boş bırakılamaz.")
      .max(80, "Marka en fazla 80 karakter olabilir."),

    category: z
      .string()
      .trim()
      .min(1, "Kategori seçmelisiniz.")
      .max(80, "Kategori çok uzun."),

    price: z.coerce
      .number()
      .positive("Fiyat sıfırdan büyük olmalıdır."),

    discountPrice: z.preprocess(
      (value) => {
        if (value === "" || value === null) {
          return null;
        }

        return value;
      },
      z.coerce
        .number()
        .positive("İndirimli fiyat sıfırdan büyük olmalıdır.")
        .nullable(),
    ),

    stock: z.coerce
      .number()
      .int("Stok tam sayı olmalıdır.")
      .min(0, "Stok negatif olamaz."),

    imageUrl: z
      .string()
      .trim()
      .max(500, "Görsel yolu çok uzun."),

    description: z
      .string()
      .trim()
      .min(1, "Açıklama boş bırakılamaz.")
      .max(3000, "Açıklama en fazla 3000 karakter olabilir."),

    isActive: z.boolean(),
  })
  .refine(
    (data) =>
      data.discountPrice === null ||
      data.discountPrice < data.price,
    {
      message:
        "İndirimli fiyat normal fiyattan düşük olmalıdır.",
      path: ["discountPrice"],
    },
  );

export type ProductActionState = {
  success: boolean;
  message: string;
};

async function isAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      role: true,
    },
  });

  return user?.role === "ADMIN";
}

export async function createProduct(
  previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Ürün eklemek için giriş yapmalısınız.",
    };
  }

  if (!(await isAdmin(session.user.id))) {
    return {
      success: false,
      message: "Bu işlem için admin yetkisi gereklidir.",
    };
  }

  const result = productSchema.safeParse({
    name: formData.get("name"),
    brand: formData.get("brand"),
    category: formData.get("category"),
    price: formData.get("price"),
    discountPrice: formData.get("discountPrice"),
    stock: formData.get("stock"),
    imageUrl: formData.get("imageUrl"),
    description: formData.get("description"),
    isActive: formData.get("isActive") === "on",
  });

  if (!result.success) {
    return {
      success: false,
      message:
        result.error.issues[0]?.message ??
        "Lütfen ürün bilgilerini kontrol edin.",
    };
  }

  const {
    imageUrl,
    discountPrice,
    ...productData
  } = result.data;

  try {
    await prisma.product.create({
      data: {
        ...productData,
        discountPrice,
        imageUrl: imageUrl || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin");
    revalidatePath("/admin/products");
  } catch (error) {
    console.error("CREATE_PRODUCT_ERROR:", error);

    return {
      success: false,
      message: "Ürün oluşturulurken bir hata meydana geldi.",
    };
  }

  redirect("/admin/products?created=1");
}

export async function updateProduct(
  productId: number,
  previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Ürünü düzenlemek için giriş yapmalısınız.",
    };
  }

  if (!(await isAdmin(session.user.id))) {
    return {
      success: false,
      message: "Bu işlem için admin yetkisi gereklidir.",
    };
  }

  if (!Number.isInteger(productId) || productId < 1) {
    return {
      success: false,
      message: "Geçersiz ürün bilgisi.",
    };
  }

  const result = productSchema.safeParse({
    name: formData.get("name"),
    brand: formData.get("brand"),
    category: formData.get("category"),
    price: formData.get("price"),
    discountPrice: formData.get("discountPrice"),
    stock: formData.get("stock"),
    imageUrl: formData.get("imageUrl"),
    description: formData.get("description"),
    isActive: formData.get("isActive") === "on",
  });

  if (!result.success) {
    return {
      success: false,
      message:
        result.error.issues[0]?.message ??
        "Lütfen ürün bilgilerini kontrol edin.",
    };
  }

  const existingProduct = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
    },
  });

  if (!existingProduct) {
    return {
      success: false,
      message: "Düzenlenecek ürün bulunamadı.",
    };
  }

  const {
    imageUrl,
    discountPrice,
    ...productData
  } = result.data;

  try {
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        ...productData,
        discountPrice,
        imageUrl: imageUrl || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${productId}`);
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}/edit`);
  } catch (error) {
    console.error("UPDATE_PRODUCT_ERROR:", error);

    return {
      success: false,
      message: "Ürün güncellenirken bir hata meydana geldi.",
    };
  }

  redirect("/admin/products?updated=1");
}

export async function deleteProduct(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!(await isAdmin(session.user.id))) {
    redirect("/admin/products?deleteError=1");
  }

  const productId = Number(formData.get("productId"));

  if (!Number.isInteger(productId) || productId < 1) {
    redirect("/admin/products?deleteError=1");
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      orderItems: {
        select: {
          id: true,
        },
        take: 1,
      },
    },
  });

  if (!product) {
    redirect("/admin/products?deleteError=1");
  }

  if (product.orderItems.length > 0) {
    redirect("/admin/products?deleteError=ordered");
  }

  try {
    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin");
    revalidatePath("/admin/products");
  } catch (error) {
    console.error("DELETE_PRODUCT_ERROR:", error);

    redirect("/admin/products?deleteError=1");
  }

  redirect("/admin/products?deleted=1");
}