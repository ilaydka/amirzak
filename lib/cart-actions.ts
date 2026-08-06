"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const productSchema = z.object({
  productId: z.coerce.number().int().positive(),
});

const cartItemSchema = z.object({
  cartItemId: z.string().min(1),
});

export type AddToCartState = {
  success: boolean;
  message: string;
};

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

  const result = productSchema.safeParse({
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

export async function increaseCartItem(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  const result = cartItemSchema.safeParse({
    cartItemId: formData.get("cartItemId"),
  });

  if (!result.success) {
    return;
  }

  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: result.data.cartItemId,
      cart: {
        userId: session.user.id,
      },
    },
    include: {
      product: true,
    },
  });

  if (!cartItem || cartItem.quantity >= cartItem.product.stock) {
    return;
  }

  await prisma.cartItem.update({
    where: {
      id: cartItem.id,
    },
    data: {
      quantity: {
        increment: 1,
      },
    },
  });

  revalidatePath("/cart");
}

export async function decreaseCartItem(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  const result = cartItemSchema.safeParse({
    cartItemId: formData.get("cartItemId"),
  });

  if (!result.success) {
    return;
  }

  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: result.data.cartItemId,
      cart: {
        userId: session.user.id,
      },
    },
  });

  if (!cartItem) {
    return;
  }

  if (cartItem.quantity <= 1) {
    await prisma.cartItem.delete({
      where: {
        id: cartItem.id,
      },
    });
  } else {
    await prisma.cartItem.update({
      where: {
        id: cartItem.id,
      },
      data: {
        quantity: {
          decrement: 1,
        },
      },
    });
  }

  revalidatePath("/cart");
}

export async function removeCartItem(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  const result = cartItemSchema.safeParse({
    cartItemId: formData.get("cartItemId"),
  });

  if (!result.success) {
    return;
  }

  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: result.data.cartItemId,
      cart: {
        userId: session.user.id,
      },
    },
  });

  if (!cartItem) {
    return;
  }

  await prisma.cartItem.delete({
    where: {
      id: cartItem.id,
    },
  });

  revalidatePath("/cart");
}