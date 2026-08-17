"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type SupportState = {
  success: boolean;
  message: string;
};

const supportSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(1, "Konu alanı boş bırakılamaz.")
    .max(150, "Konu en fazla 150 karakter olabilir."),

  category: z
    .string()
    .trim()
    .min(1, "Kategori seçmelisiniz."),

  message: z
    .string()
    .trim()
    .min(1, "Mesaj alanı boş bırakılamaz.")
    .max(3000, "Mesaj en fazla 3000 karakter olabilir."),
});

export async function createSupportTicket(
  previousState: SupportState,
  formData: FormData,
): Promise<SupportState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Destek talebi oluşturmak için giriş yapmalısınız.",
    };
  }

  const result = supportSchema.safeParse({
    subject: formData.get("subject"),
    category: formData.get("category"),
    message: formData.get("message"),
  });

  if (!result.success) {
    return {
      success: false,
      message:
        result.error.issues[0]?.message ??
        "Destek talebi bilgilerini kontrol edin.",
    };
  }

  try {
    await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        subject: result.data.subject,
        category: result.data.category,
        message: result.data.message,
      },
    });

    revalidatePath("/support");
    revalidatePath("/admin");
    revalidatePath("/admin/support");

    return {
      success: true,
      message: "Destek talebiniz başarıyla gönderildi.",
    };
  } catch (error) {
    console.error("CREATE_SUPPORT_TICKET_ERROR:", error);

    return {
      success: false,
      message: "Destek talebi gönderilirken bir hata oluştu.",
    };
  }
}