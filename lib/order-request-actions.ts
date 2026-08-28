"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const RETURN_WINDOW_DAYS = 15;

const requestSchema = z.object({
  orderId: z.string().trim().min(1),

  reason: z
    .string()
    .trim()
    .min(3)
    .max(500),
});

function revalidateOrderPaths(
  orderId: string,
) {
  revalidatePath("/orders");
  revalidatePath(
    `/orders/${orderId}`,
  );
  revalidatePath("/profile");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
}

function getReturnDeadline(
  deliveredAt: Date,
) {
  return new Date(
    deliveredAt.getTime() +
      RETURN_WINDOW_DAYS *
        24 *
        60 *
        60 *
        1000,
  );
}

export async function createOrderRequest(
  formData: FormData,
) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const result = requestSchema.safeParse({
    orderId:
      formData.get("orderId"),

    reason:
      formData.get("reason"),
  });

  if (!result.success) {
    const rawOrderId =
      formData.get("orderId");

    const orderId =
      typeof rawOrderId ===
      "string"
        ? rawOrderId
        : "";

    redirect(
      `/orders/${orderId}?requestError=invalid`,
    );
  }

  const {
    orderId,
    reason,
  } = result.data;

  try {
    await prisma.$transaction(
      async (tx) => {
        const order =
          await tx.order.findFirst({
            where: {
              id: orderId,
              userId:
                session.user.id,
            },

            include: {
              payments: {
                orderBy: {
                  createdAt:
                    "desc",
                },
              },
            },
          });

        if (!order) {
          throw new Error(
            "ORDER_NOT_FOUND",
          );
        }

        if (
          order.requestStatus ===
          "PENDING"
        ) {
          throw new Error(
            "REQUEST_ALREADY_PENDING",
          );
        }

        if (
          order.requestStatus ===
          "APPROVED"
        ) {
          throw new Error(
            "REQUEST_ALREADY_APPROVED",
          );
        }

        if (
          order.status ===
          "CANCELLED"
        ) {
          throw new Error(
            "ORDER_ALREADY_CANCELLED",
          );
        }

        const alreadyRefunded =
          order.payments.some(
            (payment) =>
              payment.status ===
              "REFUNDED",
          );

        if (alreadyRefunded) {
          throw new Error(
            "ORDER_ALREADY_REFUNDED",
          );
        }

        const successfulPayment =
          order.payments.some(
            (payment) =>
              payment.status ===
                "SUCCEEDED" ||
              payment.status ===
                "PARTIALLY_REFUNDED",
          );

        if (!successfulPayment) {
          throw new Error(
            "PAYMENT_NOT_COMPLETED",
          );
        }

        let requestType:
          | "CANCELLATION"
          | "RETURN";

        if (
          order.status ===
          "PROCESSING"
        ) {
          requestType =
            "CANCELLATION";
        } else if (
          order.status ===
          "DELIVERED"
        ) {
          if (!order.deliveredAt) {
            throw new Error(
              "DELIVERY_DATE_MISSING",
            );
          }

          const returnDeadline =
            getReturnDeadline(
              order.deliveredAt,
            );

          if (
            new Date() >
            returnDeadline
          ) {
            throw new Error(
              "RETURN_WINDOW_EXPIRED",
            );
          }

          requestType = "RETURN";
        } else {
          throw new Error(
            "REQUEST_NOT_ALLOWED",
          );
        }

        await tx.order.update({
          where: {
            id: order.id,
          },
          data: {
            requestType,

            requestStatus:
              "PENDING",

            requestReason:
              reason,

            requestCreatedAt:
              new Date(),
          },
        });
      },
    );

    revalidateOrderPaths(
      orderId,
    );
  } catch (error) {
    console.error(
      "CREATE_ORDER_REQUEST_ERROR:",
      error,
    );

    if (error instanceof Error) {
      if (
        error.message ===
        "ORDER_NOT_FOUND"
      ) {
        redirect(
          `/orders/${orderId}?requestError=not-found`,
        );
      }

      if (
        error.message ===
        "REQUEST_ALREADY_PENDING"
      ) {
        redirect(
          `/orders/${orderId}?requestError=pending`,
        );
      }

      if (
        error.message ===
        "REQUEST_ALREADY_APPROVED"
      ) {
        redirect(
          `/orders/${orderId}?requestError=approved`,
        );
      }

      if (
        error.message ===
        "ORDER_ALREADY_CANCELLED"
      ) {
        redirect(
          `/orders/${orderId}?requestError=cancelled`,
        );
      }

      if (
        error.message ===
        "ORDER_ALREADY_REFUNDED"
      ) {
        redirect(
          `/orders/${orderId}?requestError=refunded`,
        );
      }

      if (
        error.message ===
        "PAYMENT_NOT_COMPLETED"
      ) {
        redirect(
          `/orders/${orderId}?requestError=payment`,
        );
      }

      if (
        error.message ===
        "DELIVERY_DATE_MISSING"
      ) {
        redirect(
          `/orders/${orderId}?requestError=delivery-date`,
        );
      }

      if (
        error.message ===
        "RETURN_WINDOW_EXPIRED"
      ) {
        redirect(
          `/orders/${orderId}?requestError=return-expired`,
        );
      }

      if (
        error.message ===
        "REQUEST_NOT_ALLOWED"
      ) {
        redirect(
          `/orders/${orderId}?requestError=not-allowed`,
        );
      }
    }

    redirect(
      `/orders/${orderId}?requestError=1`,
    );
  }

  redirect(
    `/orders/${orderId}?requestCreated=1`,
  );
}