"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const paymentMethodSchema = z.object({
  cardHolder: z
    .string()
    .trim()
    .min(2, "Kart sahibi adı gereklidir.")
    .max(100),

  cardBrand: z.enum([
    "VISA",
    "MASTERCARD",
    "TROY",
    "AMEX",
    "OTHER",
  ]),

  last4: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Son 4 hane 4 rakam olmalıdır."),

  expiryMonth: z.coerce
    .number()
    .int()
    .min(1)
    .max(12),

  expiryYear: z.coerce
    .number()
    .int()
    .min(new Date().getFullYear())
    .max(new Date().getFullYear() + 20),
});

export async function addPaymentMethod(
  formData: FormData,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  const result = paymentMethodSchema.safeParse({
    cardHolder: formData.get("cardHolder"),
    cardBrand: formData.get("cardBrand"),
    last4: formData.get("last4"),
    expiryMonth: formData.get("expiryMonth"),
    expiryYear: formData.get("expiryYear"),
  });

  if (!result.success) {
    return;
  }

  const existingCount =
    await prisma.paymentMethod.count({
      where: {
        userId: session.user.id,
      },
    });

  await prisma.paymentMethod.create({
    data: {
      userId: session.user.id,
      cardHolder: result.data.cardHolder,
      cardBrand: result.data.cardBrand,
      last4: result.data.last4,
      expiryMonth: result.data.expiryMonth,
      expiryYear: result.data.expiryYear,

      // İlk kart otomatik varsayılan olsun.
      isDefault: existingCount === 0,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/profile/payment-methods");
}

export async function deletePaymentMethod(
  formData: FormData,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  const paymentMethodId =
    formData.get("paymentMethodId");

  if (
    typeof paymentMethodId !== "string" ||
    !paymentMethodId
  ) {
    return;
  }

  const paymentMethod =
    await prisma.paymentMethod.findFirst({
      where: {
        id: paymentMethodId,
        userId: session.user.id,
      },
    });

  if (!paymentMethod) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.paymentMethod.delete({
      where: {
        id: paymentMethod.id,
      },
    });

    // Varsayılan kart silindiyse başka kartı
    // varsayılan yap.
    if (paymentMethod.isDefault) {
      const nextPaymentMethod =
        await tx.paymentMethod.findFirst({
          where: {
            userId: session.user.id,
          },
          orderBy: {
            createdAt: "asc",
          },
        });

      if (nextPaymentMethod) {
        await tx.paymentMethod.update({
          where: {
            id: nextPaymentMethod.id,
          },
          data: {
            isDefault: true,
          },
        });
      }
    }
  });

  revalidatePath("/profile");
  revalidatePath("/profile/payment-methods");
}

export async function setDefaultPaymentMethod(
  formData: FormData,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  const paymentMethodId =
    formData.get("paymentMethodId");

  if (
    typeof paymentMethodId !== "string" ||
    !paymentMethodId
  ) {
    return;
  }

  const paymentMethod =
    await prisma.paymentMethod.findFirst({
      where: {
        id: paymentMethodId,
        userId: session.user.id,
      },
    });

  if (!paymentMethod) {
    return;
  }

  await prisma.$transaction([
    prisma.paymentMethod.updateMany({
      where: {
        userId: session.user.id,
      },
      data: {
        isDefault: false,
      },
    }),

    prisma.paymentMethod.update({
      where: {
        id: paymentMethod.id,
      },
      data: {
        isDefault: true,
      },
    }),
  ]);

  revalidatePath("/profile");
  revalidatePath("/profile/payment-methods");
}