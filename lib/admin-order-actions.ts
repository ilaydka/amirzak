"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const statusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

const orderSchema = z.object({
  orderId: z.string().min(1),
  status: statusSchema,
});

const allowedTransitions = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
} as const;

export async function updateOrderStatus(
  formData: FormData,
) {
  await requireAdmin();

  const result = orderSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  });

  if (!result.success) {
    redirect("/admin/orders?error=invalid");
  }

  const { orderId, status } = result.data;

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      if (order.status === status) {
        throw new Error("SAME_STATUS");
      }

      const allowed =
        allowedTransitions[order.status].includes(
          status as never,
        );

      if (!allowed) {
        throw new Error("INVALID_STATUS_TRANSITION");
      }

      if (status === "CANCELLED") {
        for (const item of order.items) {
          await tx.product.update({
            where: {
              id: item.productId,
            },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          status,
        },
      });
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/orders");
    revalidatePath("/products");
  } catch (error) {
    console.error("UPDATE_ORDER_STATUS_ERROR:", error);

    if (error instanceof Error) {
      if (error.message === "ORDER_NOT_FOUND") {
        redirect("/admin/orders?error=not-found");
      }

      if (error.message === "SAME_STATUS") {
        redirect("/admin/orders?error=same-status");
      }

      if (error.message === "INVALID_STATUS_TRANSITION") {
        redirect("/admin/orders?error=invalid-transition");
      }
    }

    redirect("/admin/orders?error=1");
  }

  redirect("/admin/orders?updated=1");
}