"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";

import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalıdır."),
    email: z.string().trim().email("Geçerli bir e-posta adresi giriniz."),
    password: z.string().min(8, "Şifre en az 8 karakter olmalıdır."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler birbiriyle eşleşmiyor.",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta adresi giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
});

export type RegisterState = {
  success: boolean;
  message: string;
};

export type LoginState = {
  message: string;
};

export async function registerUser(
  previousState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const result = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!result.success) {
    return {
      success: false,
      message:
        result.error.issues[0]?.message ??
        "Lütfen girdiğiniz bilgileri kontrol edin.",
    };
  }

  const { name, password } = result.data;
  const email = result.data.email.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return {
      success: false,
      message: "Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var.",
    };
  }

  const passwordHash = await hash(password, 12);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    return {
      success: true,
      message: "Hesabınız başarıyla oluşturuldu.",
    };
  } catch {
    return {
      success: false,
      message: "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.",
    };
  }
}

export async function loginUser(
  previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return {
      message:
        result.error.issues[0]?.message ??
        "Giriş bilgilerinizi kontrol edin.",
    };
  }

  try {
    await signIn("credentials", {
      email: result.data.email.toLowerCase(),
      password: result.data.password,
      redirectTo: "/",
    });

    return {
      message: "",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          message: "E-posta veya şifre hatalı.",
        };
      }

      return {
        message: "Giriş sırasında bir hata oluştu.",
      };
    }

    throw error;
  }
}