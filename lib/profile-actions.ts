"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  parsePhoneNumberFromString,
} from "libphonenumber-js";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ProfileState = {
  success: boolean;
  message: string;
};

const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Ad alanı boş bırakılamaz.")
    .max(50, "Ad en fazla 50 karakter olabilir."),

  lastName: z
    .string()
    .trim()
    .min(1, "Soyad alanı boş bırakılamaz.")
    .max(50, "Soyad en fazla 50 karakter olabilir."),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "E-posta alanı boş bırakılamaz.")
    .email("Geçerli bir e-posta adresi girin."),

  phoneCountryCode: z
    .string()
    .trim()
    .min(1, "Telefon ülke kodu seçilmelidir.")
    .max(6),

  phone: z
    .string()
    .trim()
    .min(1, "Telefon numarası boş bırakılamaz.")
    .max(30, "Telefon numarası çok uzun."),

  countryCode: z
    .string()
    .trim()
    .min(2, "Ülke seçmelisiniz.")
    .max(3),

  city: z
    .string()
    .trim()
    .min(
      1,
      "Şehir / Eyalet / Bölge seçmelisiniz.",
    )
    .max(100),

  postalCode: z
    .string()
    .trim()
    .min(1, "Posta kodu boş bırakılamaz.")
    .max(20, "Posta kodu çok uzun."),

  address: z
    .string()
    .trim()
    .min(1, "Adres alanı boş bırakılamaz.")
    .max(
      500,
      "Adres en fazla 500 karakter olabilir.",
    ),
});

function normalizeNationalPhone(
  phoneCountryCode: string,
  phone: string,
) {
  let digits = phone.replace(/\D/g, "");

  if (phoneCountryCode === "+90") {
    if (digits.startsWith("90")) {
      digits = digits.slice(2);
    }

    if (digits.startsWith("0")) {
      digits = digits.slice(1);
    }

    if (
      digits.length !== 10 ||
      !digits.startsWith("5")
    ) {
      return null;
    }
  }

  return digits;
}

export async function updateProfile(
  previousState: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message:
        "Profilinizi düzenlemek için giriş yapmalısınız.",
    };
  }

  const result = profileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phoneCountryCode:
      formData.get("phoneCountryCode"),
    phone: formData.get("phone"),
    countryCode: formData.get("countryCode"),
    city: formData.get("city"),
    postalCode: formData.get("postalCode"),
    address: formData.get("address"),
  });

  if (!result.success) {
    return {
      success: false,
      message:
        result.error.issues[0]?.message ??
        "Profil bilgilerinizi kontrol edin.",
    };
  }

  const {
    firstName,
    lastName,
    email,
    phoneCountryCode,
    phone,
    countryCode,
    city,
    postalCode,
    address,
  } = result.data;

  const nationalPhone =
    normalizeNationalPhone(
      phoneCountryCode,
      phone,
    );

  if (!nationalPhone) {
    return {
      success: false,
      message:
        phoneCountryCode === "+90"
          ? "Türkiye telefon numarası 5 ile başlamalı ve 10 haneli olmalıdır."
          : "Geçerli bir telefon numarası girin.",
    };
  }

  let normalizedPhone: string | null = null;

  try {
    const phoneNumber =
      parsePhoneNumberFromString(
        `${phoneCountryCode}${nationalPhone}`,
      );

    if (
      !phoneNumber ||
      !phoneNumber.isValid()
    ) {
      return {
        success: false,
        message:
          "Geçerli bir telefon numarası girin.",
      };
    }

    normalizedPhone =
      phoneNumber.nationalNumber;
  } catch {
    return {
      success: false,
      message:
        "Geçerli bir telefon numarası girin.",
    };
  }

  try {
    const emailOwner =
      await prisma.user.findFirst({
        where: {
          email,
          NOT: {
            id: session.user.id,
          },
        },
        select: {
          id: true,
        },
      });

    if (emailOwner) {
      return {
        success: false,
        message:
          "Bu e-posta adresi başka bir hesap tarafından kullanılıyor.",
      };
    }

    await prisma.user.update({
      where: {
        id: session.user.id,
      },

      data: {
        firstName,
        lastName,

        name: `${firstName} ${lastName}`,

        email,

        phoneCountryCode,

        phone: normalizedPhone,

        countryCode,

        city,

        postalCode:
          postalCode || null,

        address:
          address || null,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/profile/edit");
    revalidatePath("/");
    revalidatePath("/orders");

    return {
      success: true,
      message:
        "Profil bilgileriniz başarıyla güncellendi.",
    };
  } catch (error) {
    console.error(
      "UPDATE_PROFILE_ERROR:",
      error,
    );

    return {
      success: false,
      message:
        "Profil bilgileriniz güncellenirken bir hata oluştu.",
    };
  }
}