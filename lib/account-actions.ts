"use server";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export type DeleteAccountState = {
  success: boolean;
  message: string;
};

export async function logoutUser() {
  await signOut({
    redirectTo: "/",
  });
}

export async function deleteAccount(
  _previousState: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message:
        "Oturumunuz bulunamadı. Lütfen yeniden giriş yapın.",
    };
  }

  const confirmation = String(
    formData.get("confirmation") ?? "",
  ).trim();

  if (confirmation !== "HESABIMI SİL") {
    return {
      success: false,
      message:
        'Devam etmek için kutuya tam olarak "HESABIMI SİL" yazmalısınız.',
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user) {
    return {
      success: false,
      message: "Kullanıcı hesabı bulunamadı.",
    };
  }

  if (user.role === "ADMIN") {
    const adminCount = await prisma.user.count({
      where: {
        role: "ADMIN",
      },
    });

    if (adminCount <= 1) {
      return {
        success: false,
        message:
          "Sistemdeki son yönetici hesabı silinemez. Önce başka bir kullanıcıya yönetici yetkisi verin.",
      };
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.payment.deleteMany({
        where: {
          userId: user.id,
        },
      });

      await tx.user.delete({
        where: {
          id: user.id,
        },
      });
    });
  } catch (error) {
    console.error(
      "Hesap silinirken hata oluştu:",
      error,
    );

    return {
      success: false,
      message:
        "Hesap silinirken bir hata meydana geldi. Lütfen tekrar deneyin.",
    };
  }

  await signOut({
    redirectTo: "/",
  });

  return {
    success: true,
    message: "Hesabınız silindi.",
  };
}