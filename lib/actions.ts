"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth, signIn } from "@/auth";
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

const addToCartSchema = z.object({
  productId: z.coerce.number().int().positive(),
});

export type RegisterState = {
  success: boolean;
  message: string;
};

export type LoginState = {
  message: string;
};

export type AddToCartState = {
  success: boolean;
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

export async function addToCart(
  previousState: AddToCartState,
  formData: FormData,
): Promise<AddToCartState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Sepete ürün eklemek için giriş yapmalısınız.",
    };
  }

  const result = addToCartSchema.safeParse({
    productId: formData.get("productId"),
  });

  if (!result.success) {
    return {
      success: false,
      message: "Geçersiz ürün bilgisi.",
    };
  }

  try {
    await prisma.$transaction(async (transaction) => {
      const product = await transaction.product.findUnique({
        where: {
          id: result.data.productId,
        },
      });

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      if (product.stock < 1) {
        throw new Error("OUT_OF_STOCK");
      }

      const cart = await transaction.cart.upsert({
        where: {
          userId: session.user.id,
        },
        update: {},
        create: {
          userId: session.user.id,
        },
      });

      const existingItem = await transaction.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: product.id,
          },
        },
      });

      if (existingItem && existingItem.quantity >= product.stock) {
        throw new Error("STOCK_LIMIT");
      }

      if (existingItem) {
        await transaction.cartItem.update({
          where: {
            id: existingItem.id,
          },
          data: {
            quantity: {
              increment: 1,
            },
          },
        });
      } else {
        await transaction.cartItem.create({
          data: {
            cartId: cart.id,
            productId: product.id,
            quantity: 1,
          },
        });
      }
    });

    revalidatePath("/cart");

    return {
      success: true,
      message: "Ürün sepetinize eklendi.",
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "PRODUCT_NOT_FOUND") {
        return {
          success: false,
          message: "Ürün bulunamadı.",
        };
      }

      if (error.message === "OUT_OF_STOCK") {
        return {
          success: false,
          message: "Bu ürünün stoğu tükenmiş.",
        };
      }

      if (error.message === "STOCK_LIMIT") {
        return {
          success: false,
          message: "Sepetteki ürün adedi mevcut stok miktarına ulaştı.",
        };
      }
    }

    return {
      success: false,
      message: "Ürün sepete eklenirken bir hata oluştu.",
    };
  }
}