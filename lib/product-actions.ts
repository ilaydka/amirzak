"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const productSchema = z.object({
  name: z.string().trim().min(2, "Ürün adı en az 2 karakter olmalıdır."),
  brand: z.string().trim().min(2, "Marka en az 2 karakter olmalıdır."),
  category: z.string().trim().min(2, "Kategori en az 2 karakter olmalıdır."),
  price: z.coerce.number().positive("Fiyat sıfırdan büyük olmalıdır."),
  stock: z.coerce
    .number()
    .int("Stok tam sayı olmalıdır.")
    .min(0, "Stok negatif olamaz."),
  compatibility: z
    .string()
    .trim()
    .min(2, "Uyumlu araç bilgisi zorunludur."),
  imageUrl: z.string().trim(),
  description: z
    .string()
    .trim()
    .min(10, "Açıklama en az 10 karakter olmalıdır."),
});

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
    stock: formData.get("stock"),
    compatibility: formData.get("compatibility"),
    imageUrl: formData.get("imageUrl"),
    description: formData.get("description"),
  });

  if (!result.success) {
    return {
      success: false,
      message:
        result.error.issues[0]?.message ??
        "Lütfen ürün bilgilerini kontrol edin.",
    };
  }

  const { imageUrl, ...productData } = result.data;

  try {
    await prisma.product.create({
      data: {
        ...productData,
        imageUrl: imageUrl || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin");
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Ürün başarıyla oluşturuldu.",
    };
  } catch (error) {
    console.error("CREATE_PRODUCT_ERROR:", error);

    return {
      success: false,
      message: "Ürün oluşturulurken bir hata meydana geldi.",
    };
  }
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
    stock: formData.get("stock"),
    compatibility: formData.get("compatibility"),
    imageUrl: formData.get("imageUrl"),
    description: formData.get("description"),
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

  const { imageUrl, ...productData } = result.data;

  try {
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        ...productData,
        imageUrl: imageUrl || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${productId}`);
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}/edit`);

    return {
      success: true,
      message: "Ürün başarıyla güncellendi.",
    };
  } catch (error) {
    console.error("UPDATE_PRODUCT_ERROR:", error);

    return {
      success: false,
      message: "Ürün güncellenirken bir hata meydana geldi.",
    };
  }
}

export async function deleteProduct(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  if (!(await isAdmin(session.user.id))) {
    return;
  }

  const productId = Number(formData.get("productId"));

  if (!Number.isInteger(productId) || productId < 1) {
    return;
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
    },
  });

  if (!product) {
    return;
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
  }
}