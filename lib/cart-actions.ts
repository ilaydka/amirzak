"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const productSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1),
});

const cartItemSchema = z.object({
  cartItemId: z.string().min(1),
});

export type AddToCartState = {
  success: boolean;
  message: string;
  cartQuantity?: number;
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
    quantity: formData.get("quantity") ?? 1,
  });

  if (!result.success) {
    return {
      success: false,
      message: "Geçersiz ürün veya adet bilgisi.",
    };
  }

  const { productId, quantity } = result.data;

  try {
    const cartQuantity = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          id: true,
          stock: true,
          isActive: true,
        },
      });

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      if (!product.isActive) {
        throw new Error("PRODUCT_INACTIVE");
      }

      if (product.stock < 1) {
        throw new Error("OUT_OF_STOCK");
      }

      if (quantity > product.stock) {
        throw new Error(`STOCK_LIMIT:${product.stock}`);
      }

      const cart = await tx.cart.upsert({
        where: {
          userId: session.user.id,
        },
        update: {},
        create: {
          userId: session.user.id,
        },
      });

      const existingItem = await tx.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: product.id,
          },
        },
      });

      if (existingItem) {
        const newQuantity =
          existingItem.quantity + quantity;

        if (newQuantity > product.stock) {
          throw new Error(`STOCK_LIMIT:${product.stock}`);
        }

        const updatedItem = await tx.cartItem.update({
          where: {
            id: existingItem.id,
          },
          data: {
            quantity: newQuantity,
          },
        });

        return updatedItem.quantity;
      }

      const createdItem = await tx.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity,
        },
      });

      return createdItem.quantity;
    });

    revalidatePath("/");
    revalidatePath("/cart");
    revalidatePath("/products");
    revalidatePath(`/products/${productId}`);

    return {
      success: true,
      message: `Sepetinizde bu üründen toplam ${cartQuantity} adet var.`,
      cartQuantity,
    };
  } catch (error) {
    console.error("ADD_TO_CART_ERROR:", error);

    if (error instanceof Error) {
      if (error.message === "PRODUCT_NOT_FOUND") {
        return {
          success: false,
          message: "Ürün bulunamadı.",
        };
      }

      if (error.message === "PRODUCT_INACTIVE") {
        return {
          success: false,
          message: "Bu ürün artık satışta değil.",
        };
      }

      if (error.message === "OUT_OF_STOCK") {
        return {
          success: false,
          message: "Bu ürün tükenmiştir.",
        };
      }

      if (error.message.startsWith("STOCK_LIMIT:")) {
        return {
          success: false,
          message:
            "Sepetinizdeki adet mevcut stok sınırına ulaştı.",
        };
      }
    }

    return {
      success: false,
      message:
        "Ürün sepete eklenirken teknik bir hata oluştu.",
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

  if (!cartItem) {
    return;
  }

  if (!cartItem.product.isActive) {
    return;
  }

  if (cartItem.quantity >= cartItem.product.stock) {
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

  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/products");
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

  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/products");
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

  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/products");
}