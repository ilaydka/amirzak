"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((value) => value || null);

const petSafeSchema = z.preprocess(
  (value) => {
    if (value === "" || value === null) {
      return null;
    }

    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    return value;
  },
  z.boolean().nullable(),
);

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

    imageUrl: optionalText(
      500,
      "Görsel yolu çok uzun.",
    ),

    description: z
      .string()
      .trim()
      .min(1, "Açıklama boş bırakılamaz.")
      .max(3000, "Açıklama en fazla 3000 karakter olabilir."),

    scientificName: optionalText(
      120,
      "Bilimsel ad en fazla 120 karakter olabilir.",
    ),

    lightRequirement: optionalText(
      100,
      "Işık ihtiyacı bilgisi çok uzun.",
    ),

    watering: optionalText(
      160,
      "Sulama bilgisi çok uzun.",
    ),

    careLevel: optionalText(
      50,
      "Bakım seviyesi bilgisi çok uzun.",
    ),

    environment: optionalText(
      80,
      "Ortam bilgisi çok uzun.",
    ),

    plantSize: optionalText(
      80,
      "Bitki boyu bilgisi çok uzun.",
    ),

    petSafe: petSafeSchema,

    bloomSeason: optionalText(
      120,
      "Çiçeklenme dönemi bilgisi çok uzun.",
    ),

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

function getProductFormData(formData: FormData) {
  return {
    name: formData.get("name"),
    brand: formData.get("brand"),
    category: formData.get("category"),
    price: formData.get("price"),
    discountPrice: formData.get("discountPrice"),
    stock: formData.get("stock"),
    imageUrl: formData.get("imageUrl"),
    description: formData.get("description"),
    scientificName: formData.get("scientificName"),
    lightRequirement: formData.get("lightRequirement"),
    watering: formData.get("watering"),
    careLevel: formData.get("careLevel"),
    environment: formData.get("environment"),
    plantSize: formData.get("plantSize"),
    petSafe: formData.get("petSafe"),
    bloomSeason: formData.get("bloomSeason"),
    isActive: formData.get("isActive") === "on",
  };
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

  const result = productSchema.safeParse(
    getProductFormData(formData),
  );

  if (!result.success) {
    return {
      success: false,
      message:
        result.error.issues[0]?.message ??
        "Lütfen ürün bilgilerini kontrol edin.",
    };
  }

  try {
    await prisma.product.create({
      data: {
        ...result.data,
        sellerId: session.user.id,
        approvalStatus: "APPROVED",
        rejectionReason: null,
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

export async function submitProduct(
  previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Ürün göndermek için giriş yapmalısınız.",
    };
  }

  const result = productSchema.safeParse({
    ...getProductFormData(formData),
    isActive: false,
  });

  if (!result.success) {
    return {
      success: false,
      message:
        result.error.issues[0]?.message ??
        "Lütfen ürün bilgilerini kontrol edin.",
    };
  }

  try {
    await prisma.product.create({
      data: {
        ...result.data,
        isActive: false,
        sellerId: session.user.id,
        approvalStatus: "PENDING",
        rejectionReason: null,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/profile/products");
    revalidatePath("/admin");
    revalidatePath("/admin/products");
  } catch (error) {
    console.error("SUBMIT_PRODUCT_ERROR:", error);

    return {
      success: false,
      message: "Ürün gönderilirken bir hata meydana geldi.",
    };
  }

  redirect("/profile/products?submitted=1");
}

export async function approveProduct(
  formData: FormData,
) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!(await isAdmin(session.user.id))) {
    redirect("/admin/products");
  }

  const productId = Number(
    formData.get("productId"),
  );

  if (!Number.isInteger(productId) || productId < 1) {
    redirect("/admin/products?approvalError=1");
  }

  const product =
    await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        approvalStatus: true,
      },
    });

  if (!product) {
    redirect("/admin/products?approvalError=1");
  }

  await prisma.product.update({
    where: {
      id: product.id,
    },
    data: {
      approvalStatus: "APPROVED",
      rejectionReason: null,
      isActive: true,
    },
  });

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${product.id}`);
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/profile/products");

  redirect("/admin/products?approved=1");
}

export async function rejectProduct(
  formData: FormData,
) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!(await isAdmin(session.user.id))) {
    redirect("/admin/products");
  }

  const productId = Number(
    formData.get("productId"),
  );

  const rejectionReason =
    String(
      formData.get("rejectionReason") ?? "",
    ).trim();

  if (
    !Number.isInteger(productId) ||
    productId < 1 ||
    rejectionReason.length < 3 ||
    rejectionReason.length > 500
  ) {
    redirect("/admin/products?approvalError=1");
  }

  const product =
    await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
      },
    });

  if (!product) {
    redirect("/admin/products?approvalError=1");
  }

  await prisma.product.update({
    where: {
      id: product.id,
    },
    data: {
      approvalStatus: "REJECTED",
      rejectionReason,
      isActive: false,
    },
  });

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${product.id}`);
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/profile/products");

  redirect("/admin/products?rejected=1");
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

  const result = productSchema.safeParse(
    getProductFormData(formData),
  );

  if (!result.success) {
    return {
      success: false,
      message:
        result.error.issues[0]?.message ??
        "Lütfen ürün bilgilerini kontrol edin.",
    };
  }

  const existingProduct =
    await prisma.product.findUnique({
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

  try {
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: result.data,
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

export async function deleteProduct(
  formData: FormData,
) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!(await isAdmin(session.user.id))) {
    redirect("/admin/products?deleteError=1");
  }

  const productId = Number(
    formData.get("productId"),
  );

  if (!Number.isInteger(productId) || productId < 1) {
    redirect("/admin/products?deleteError=1");
  }

  const product =
    await prisma.product.findUnique({
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
    redirect(
      "/admin/products?deleteError=ordered",
    );
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
    revalidatePath("/profile/products");
  } catch (error) {
    console.error("DELETE_PRODUCT_ERROR:", error);

    redirect("/admin/products?deleteError=1");
  }

  redirect("/admin/products?deleted=1");
}