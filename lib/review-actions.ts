"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const reviewSchema = z.object({
  productId: z.coerce.number().int().positive(),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Puan en az 1 olmalıdır.")
    .max(5, "Puan en fazla 5 olmalıdır."),
  comment: z
    .string()
    .trim()
    .min(5, "Yorum en az 5 karakter olmalıdır.")
    .max(1000, "Yorum en fazla 1000 karakter olabilir."),
});

export type ReviewState = {
  success: boolean;
  message: string;
};

export async function createReview(
  previousState: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Yorum yapmak için giriş yapmalısınız.",
    };
  }

  const result = reviewSchema.safeParse({
    productId: formData.get("productId"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });

  if (!result.success) {
    return {
      success: false,
      message:
        result.error.issues[0]?.message ??
        "Yorum bilgilerini kontrol edin.",
    };
  }

  const { productId, rating, comment } = result.data;

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
    },
  });

  if (!product) {
    return {
      success: false,
      message: "Ürün bulunamadı.",
    };
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId,
      },
    },
  });

  if (existingReview) {
    return {
      success: false,
      message: "Bu ürün için zaten yorum yaptınız.",
    };
  }

  try {
    await prisma.review.create({
      data: {
        rating,
        comment,
        userId: session.user.id,
        productId,
      },
    });

    revalidatePath(`/products/${productId}`);

    return {
      success: true,
      message: "Yorumunuz başarıyla eklendi.",
    };
  } catch (error) {
    console.error("CREATE_REVIEW_ERROR:", error);

    return {
      success: false,
      message: "Yorum eklenirken bir hata oluştu.",
    };
  }
}

export async function updateReview(
  reviewId: string,
  previousState: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Yorumu düzenlemek için giriş yapmalısınız.",
    };
  }

  const result = z
    .object({
      rating: z.coerce.number().int().min(1).max(5),
      comment: z.string().trim().min(5).max(1000),
    })
    .safeParse({
      rating: formData.get("rating"),
      comment: formData.get("comment"),
    });

  if (!result.success) {
    return {
      success: false,
      message:
        result.error.issues[0]?.message ??
        "Yorum bilgilerini kontrol edin.",
    };
  }

  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
    select: {
      id: true,
      userId: true,
      productId: true,
    },
  });

  if (!review) {
    return {
      success: false,
      message: "Yorum bulunamadı.",
    };
  }

  if (review.userId !== session.user.id) {
    return {
      success: false,
      message: "Bu yorumu düzenleme yetkiniz yok.",
    };
  }

  try {
    await prisma.review.update({
      where: {
        id: review.id,
      },
      data: {
        rating: result.data.rating,
        comment: result.data.comment,
      },
    });

    revalidatePath(`/products/${review.productId}`);

    return {
      success: true,
      message: "Yorumunuz başarıyla güncellendi.",
    };
  } catch (error) {
    console.error("UPDATE_REVIEW_ERROR:", error);

    return {
      success: false,
      message: "Yorum güncellenirken bir hata oluştu.",
    };
  }
}

export async function deleteReview(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  const reviewId = formData.get("reviewId");

  if (typeof reviewId !== "string" || !reviewId) {
    return;
  }

  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
    select: {
      id: true,
      userId: true,
      productId: true,
    },
  });

  if (!review) {
    return;
  }

  if (review.userId !== session.user.id) {
    return;
  }

  try {
    await prisma.review.delete({
      where: {
        id: review.id,
      },
    });

    revalidatePath(`/products/${review.productId}`);
  } catch (error) {
    console.error("DELETE_REVIEW_ERROR:", error);
  }
}