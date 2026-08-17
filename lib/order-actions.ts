"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type OrderActionState = {
  success: boolean;
  message: string;
  orderId?: string;
};

const buyNowSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1),
});

const cartItemOrderSchema = z.object({
  cartItemId: z.string().min(1),
});

function getCurrentPrice(
  price: number,
  discountPrice: number | null,
) {
  if (
    discountPrice !== null &&
    discountPrice < price
  ) {
    return discountPrice;
  }

  return price;
}

export async function createOrder(
  previousState: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Sipariş oluşturmak için giriş yapmalısınız.",
    };
  }

  let orderId: string;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: {
          userId: session.user.id,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error("CART_EMPTY");
      }

      for (const item of cart.items) {
        if (item.quantity < 1) {
          throw new Error("INVALID_QUANTITY");
        }

        if (!item.product.isActive) {
          throw new Error(
            `PRODUCT_INACTIVE:${item.product.name}`,
          );
        }

        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            isActive: true,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updated.count !== 1) {
          throw new Error(
            `OUT_OF_STOCK:${item.product.name}`,
          );
        }
      }

      const total = cart.items.reduce(
        (sum, item) => {
          const unitPrice = getCurrentPrice(
            item.product.price,
            item.product.discountPrice,
          );

          return sum + unitPrice * item.quantity;
        },
        0,
      );

      const createdOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          total,
          status: "PENDING",

          items: {
            create: cart.items.map((item) => {
              const unitPrice = getCurrentPrice(
                item.product.price,
                item.product.discountPrice,
              );

              return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice,
              };
            }),
          },
        },
      });

      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      return createdOrder;
    });

    orderId = order.id;
  } catch (error) {
    console.error("CREATE_ORDER_ERROR:", error);

    if (error instanceof Error) {
      if (error.message === "CART_EMPTY") {
        return {
          success: false,
          message: "Sepetiniz boş.",
        };
      }

      if (error.message === "INVALID_QUANTITY") {
        return {
          success: false,
          message: "Sepette geçersiz ürün adedi bulundu.",
        };
      }

      if (error.message.startsWith("PRODUCT_INACTIVE:")) {
        const productName = error.message.replace(
          "PRODUCT_INACTIVE:",
          "",
        );

        return {
          success: false,
          message: `${productName} artık satışta değil.`,
        };
      }

      if (error.message.startsWith("OUT_OF_STOCK:")) {
        const productName = error.message.replace(
          "OUT_OF_STOCK:",
          "",
        );

        return {
          success: false,
          message: `${productName} için yeterli stok bulunmuyor.`,
        };
      }
    }

    return {
      success: false,
      message:
        "Sipariş oluşturulurken bir hata meydana geldi. Lütfen tekrar deneyin.",
    };
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");

  redirect(`/cart?orderSuccess=${orderId}`);
}

export async function buyNow(
  previousState: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Sipariş vermek için giriş yapmalısınız.",
    };
  }

  const result = buyNowSchema.safeParse({
    productId: formData.get("productId"),
    quantity: formData.get("quantity"),
  });

  if (!result.success) {
    return {
      success: false,
      message: "Geçersiz ürün veya adet bilgisi.",
    };
  }

  const { productId, quantity } = result.data;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: {
          id: productId,
        },
      });

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      if (!product.isActive) {
        throw new Error("PRODUCT_INACTIVE");
      }

      const updated = await tx.product.updateMany({
        where: {
          id: product.id,
          isActive: true,
          stock: {
            gte: quantity,
          },
        },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });

      if (updated.count !== 1) {
        throw new Error("OUT_OF_STOCK");
      }

      const unitPrice = getCurrentPrice(
        product.price,
        product.discountPrice,
      );

      return tx.order.create({
        data: {
          userId: session.user.id,
          total: unitPrice * quantity,
          status: "PENDING",

          items: {
            create: {
              productId: product.id,
              quantity,
              unitPrice,
            },
          },
        },
      });
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${productId}`);
    revalidatePath("/orders");
    revalidatePath("/admin");
    revalidatePath("/admin/orders");

    return {
      success: true,
      message: "Siparişiniz başarıyla oluşturuldu.",
      orderId: order.id,
    };
  } catch (error) {
    console.error("BUY_NOW_ERROR:", error);

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
          message: "Bu ürün için yeterli stok bulunmuyor.",
        };
      }
    }

    return {
      success: false,
      message: "Sipariş oluşturulurken bir hata meydana geldi.",
    };
  }
}

export async function quickOrderCartItem(
  previousState: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Sipariş vermek için giriş yapmalısınız.",
    };
  }

  const result = cartItemOrderSchema.safeParse({
    cartItemId: formData.get("cartItemId"),
  });

  if (!result.success) {
    return {
      success: false,
      message: "Geçersiz sepet ürünü.",
    };
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const cartItem = await tx.cartItem.findFirst({
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
        throw new Error("CART_ITEM_NOT_FOUND");
      }

      if (cartItem.quantity < 1) {
        throw new Error("INVALID_QUANTITY");
      }

      if (!cartItem.product.isActive) {
        throw new Error("PRODUCT_INACTIVE");
      }

      const updated = await tx.product.updateMany({
        where: {
          id: cartItem.productId,
          isActive: true,
          stock: {
            gte: cartItem.quantity,
          },
        },
        data: {
          stock: {
            decrement: cartItem.quantity,
          },
        },
      });

      if (updated.count !== 1) {
        throw new Error("OUT_OF_STOCK");
      }

      const unitPrice = getCurrentPrice(
        cartItem.product.price,
        cartItem.product.discountPrice,
      );

      const createdOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          total: unitPrice * cartItem.quantity,
          status: "PENDING",

          items: {
            create: {
              productId: cartItem.productId,
              quantity: cartItem.quantity,
              unitPrice,
            },
          },
        },
      });

      await tx.cartItem.delete({
        where: {
          id: cartItem.id,
        },
      });

      return createdOrder;
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/cart");
    revalidatePath("/orders");
    revalidatePath("/admin");
    revalidatePath("/admin/orders");

    return {
      success: true,
      message: "Ürün başarıyla sipariş edildi.",
      orderId: order.id,
    };
  } catch (error) {
    console.error("QUICK_ORDER_ERROR:", error);

    if (error instanceof Error) {
      if (error.message === "CART_ITEM_NOT_FOUND") {
        return {
          success: false,
          message: "Sepet ürünü bulunamadı.",
        };
      }

      if (error.message === "INVALID_QUANTITY") {
        return {
          success: false,
          message: "Geçersiz ürün adedi.",
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
          message: "Bu ürün için yeterli stok bulunmuyor.",
        };
      }
    }

    return {
      success: false,
      message: "Sipariş oluşturulurken bir hata meydana geldi.",
    };
  }
}