"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import { refundPayment } from "@/lib/iyzico";
import { moneyToNumber } from "@/lib/money";
import { prisma } from "@/lib/prisma";

const RETURN_WINDOW_DAYS = 15;

const statusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

const orderSchema = z.object({
  orderId: z.string().trim().min(1),
  status: statusSchema,
});

const refundSchema = z.object({
  orderId: z.string().trim().min(1),
});

const requestSchema = z.object({
  orderId: z.string().trim().min(1),
});

const shippingSchema = z.object({
  orderId: z.string().trim().min(1),

  shippingCarrier: z
    .string()
    .trim()
    .min(2)
    .max(100),

  shippingTrackingNumber: z
    .string()
    .trim()
    .min(2)
    .max(100),

  shippingTrackingUrl: z.preprocess(
    (value) => {
      if (
        typeof value === "string" &&
        value.trim() === ""
      ) {
        return null;
      }

      return value;
    },
    z
      .string()
      .trim()
      .url()
      .nullable(),
  ),
});

const allowedTransitions = {
  PENDING: ["CANCELLED"],
  PROCESSING: [],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
} as const;

function revalidateOrderPaths(
  orderId?: string,
) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/orders");
  revalidatePath("/products");
  revalidatePath("/profile");
  revalidatePath("/cart");
  revalidatePath("/checkout");

  if (orderId) {
    revalidatePath(
      `/orders/${orderId}`,
    );
  }
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

export async function updateOrderStatus(
  formData: FormData,
) {
  await requireAdmin();

  const result = orderSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  });

  if (!result.success) {
    redirect(
      "/admin/orders?error=invalid",
    );
  }

  const { orderId, status } = result.data;

  try {
    await prisma.$transaction(
      async (tx) => {
        const order =
          await tx.order.findUnique({
            where: {
              id: orderId,
            },
            include: {
              payments: {
                orderBy: {
                  createdAt: "desc",
                },
              },
            },
          });

        if (!order) {
          throw new Error(
            "ORDER_NOT_FOUND",
          );
        }

        if (order.status === status) {
          throw new Error(
            "SAME_STATUS",
          );
        }

        const allowed =
          allowedTransitions[
            order.status
          ].includes(
            status as never,
          );

        if (!allowed) {
          throw new Error(
            "INVALID_STATUS_TRANSITION",
          );
        }

        if (
          order.status ===
            "PENDING" &&
          status === "CANCELLED"
        ) {
          const successfulPayment =
            order.payments.some(
              (payment) =>
                payment.status ===
                "SUCCEEDED",
            );

          if (successfulPayment) {
            throw new Error(
              "PAID_ORDER_CANNOT_CANCEL",
            );
          }
        }

        if (
          order.status === "SHIPPED" &&
          status === "DELIVERED"
        ) {
          await tx.order.update({
            where: {
              id: order.id,
            },
            data: {
              status: "DELIVERED",
              deliveredAt: new Date(),
            },
          });

          return;
        }

        await tx.order.update({
          where: {
            id: order.id,
          },
          data: {
            status,
          },
        });
      },
    );

    revalidateOrderPaths(orderId);
  } catch (error) {
    console.error(
      "UPDATE_ORDER_STATUS_ERROR:",
      error,
    );

    if (error instanceof Error) {
      if (
        error.message ===
        "ORDER_NOT_FOUND"
      ) {
        redirect(
          "/admin/orders?error=not-found",
        );
      }

      if (
        error.message ===
        "SAME_STATUS"
      ) {
        redirect(
          "/admin/orders?error=same-status",
        );
      }

      if (
        error.message ===
        "INVALID_STATUS_TRANSITION"
      ) {
        redirect(
          "/admin/orders?error=invalid-transition",
        );
      }

      if (
        error.message ===
        "PAID_ORDER_CANNOT_CANCEL"
      ) {
        redirect(
          "/admin/orders?error=paid-cancel",
        );
      }
    }

    redirect(
      "/admin/orders?error=1",
    );
  }

  redirect(
    "/admin/orders?updated=1",
  );
}

export async function shipOrder(
  formData: FormData,
) {
  await requireAdmin();

  const result = shippingSchema.safeParse({
    orderId:
      formData.get("orderId"),

    shippingCarrier:
      formData.get(
        "shippingCarrier",
      ),

    shippingTrackingNumber:
      formData.get(
        "shippingTrackingNumber",
      ),

    shippingTrackingUrl:
      formData.get(
        "shippingTrackingUrl",
      ),
  });

  if (!result.success) {
    redirect(
      "/admin/orders?shippingError=invalid",
    );
  }

  const {
    orderId,
    shippingCarrier,
    shippingTrackingNumber,
    shippingTrackingUrl,
  } = result.data;

  try {
    await prisma.$transaction(
      async (tx) => {
        const order =
          await tx.order.findUnique({
            where: {
              id: orderId,
            },
            include: {
              payments: {
                orderBy: {
                  createdAt: "desc",
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
          order.status !==
          "PROCESSING"
        ) {
          throw new Error(
            "ORDER_NOT_PROCESSING",
          );
        }

        const successfulPayment =
          order.payments.some(
            (payment) =>
              payment.status ===
              "SUCCEEDED",
          );

        if (!successfulPayment) {
          throw new Error(
            "PAYMENT_NOT_COMPLETED",
          );
        }

        if (
          order.requestStatus ===
          "PENDING"
        ) {
          throw new Error(
            "REQUEST_PENDING",
          );
        }

        await tx.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: "SHIPPED",
            shippingCarrier,
            shippingTrackingNumber,
            shippingTrackingUrl,
          },
        });
      },
    );

    revalidateOrderPaths(orderId);
  } catch (error) {
    console.error(
      "SHIP_ORDER_ERROR:",
      error,
    );

    if (error instanceof Error) {
      if (
        error.message ===
        "ORDER_NOT_FOUND"
      ) {
        redirect(
          "/admin/orders?shippingError=not-found",
        );
      }

      if (
        error.message ===
        "ORDER_NOT_PROCESSING"
      ) {
        redirect(
          "/admin/orders?shippingError=status",
        );
      }

      if (
        error.message ===
        "PAYMENT_NOT_COMPLETED"
      ) {
        redirect(
          "/admin/orders?shippingError=payment",
        );
      }

      if (
        error.message ===
        "REQUEST_PENDING"
      ) {
        redirect(
          "/admin/orders?shippingError=request",
        );
      }
    }

    redirect(
      "/admin/orders?shippingError=1",
    );
  }

  redirect(
    "/admin/orders?shipped=1",
  );
}

export async function rejectOrderRequest(
  formData: FormData,
) {
  await requireAdmin();

  const result = requestSchema.safeParse({
    orderId: formData.get("orderId"),
  });

  if (!result.success) {
    redirect(
      "/admin/orders?requestError=invalid",
    );
  }

  const { orderId } = result.data;

  try {
    const updated =
      await prisma.order.updateMany({
        where: {
          id: orderId,
          requestStatus: "PENDING",
        },
        data: {
          requestStatus: "REJECTED",
        },
      });

    if (updated.count !== 1) {
      throw new Error(
        "REQUEST_NOT_PENDING",
      );
    }

    revalidateOrderPaths(orderId);
  } catch (error) {
    console.error(
      "REJECT_ORDER_REQUEST_ERROR:",
      error,
    );

    if (
      error instanceof Error &&
      error.message ===
        "REQUEST_NOT_PENDING"
    ) {
      redirect(
        "/admin/orders?requestError=not-pending",
      );
    }

    redirect(
      "/admin/orders?requestError=1",
    );
  }

  redirect(
    "/admin/orders?requestRejected=1",
  );
}

async function performRefund({
  orderId,
  requirePendingRequest,
}: {
  orderId: string;
  requirePendingRequest: boolean;
}) {
  const order =
    await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,

        payments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

  if (!order) {
    throw new Error(
      "ORDER_NOT_FOUND",
    );
  }

  const refundedPayment =
    order.payments.find(
      (payment) =>
        payment.status ===
        "REFUNDED",
    );

  if (
    refundedPayment &&
    requirePendingRequest &&
    order.requestStatus ===
      "PENDING"
  ) {
    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: "CANCELLED",
        requestStatus:
          "APPROVED",
      },
    });

    revalidateOrderPaths(orderId);

    return;
  }

  if (refundedPayment) {
    throw new Error(
      "ALREADY_REFUNDED",
    );
  }

  if (requirePendingRequest) {
    if (
      order.requestStatus !==
      "PENDING"
    ) {
      throw new Error(
        "REQUEST_NOT_PENDING",
      );
    }

    if (!order.requestType) {
      throw new Error(
        "REQUEST_TYPE_MISSING",
      );
    }

    if (
      order.requestType ===
        "CANCELLATION" &&
      order.status !== "PROCESSING"
    ) {
      throw new Error(
        "INVALID_REQUEST_STATUS",
      );
    }

    if (
      order.requestType ===
      "RETURN"
    ) {
      if (
        order.status !==
        "DELIVERED"
      ) {
        throw new Error(
          "INVALID_REQUEST_STATUS",
        );
      }

      if (!order.deliveredAt) {
        throw new Error(
          "DELIVERY_DATE_MISSING",
        );
      }

      if (!order.requestCreatedAt) {
        throw new Error(
          "REQUEST_DATE_MISSING",
        );
      }

      const deadline =
        getReturnDeadline(
          order.deliveredAt,
        );

      if (
        order.requestCreatedAt >
        deadline
      ) {
        throw new Error(
          "RETURN_WINDOW_EXPIRED",
        );
      }
    }
  } else {
    if (
      order.status !== "PROCESSING"
    ) {
      throw new Error(
        "MANUAL_REFUND_NOT_ALLOWED",
      );
    }

    if (
      order.requestStatus ===
      "PENDING"
    ) {
      throw new Error(
        "REQUEST_PENDING",
      );
    }
  }

  const payment =
    order.payments.find(
      (item) =>
        item.status ===
        "SUCCEEDED",
    );

  if (!payment) {
    throw new Error(
      "PAYMENT_NOT_FOUND",
    );
  }

  if (
    !payment.providerPaymentId
  ) {
    throw new Error(
      "PROVIDER_PAYMENT_ID_MISSING",
    );
  }

  const lock =
    await prisma.payment.updateMany({
      where: {
        id: payment.id,
        status: "SUCCEEDED",
      },
      data: {
        status: "PROCESSING",
        errorCode: null,
        errorMessage: null,
      },
    });

  if (lock.count !== 1) {
    throw new Error(
      "PAYMENT_PROCESSING",
    );
  }

  let refundResult;

  try {
    refundResult =
      await refundPayment({
        paymentId:
          payment.providerPaymentId,

        price: moneyToNumber(
          payment.amount,
        ).toFixed(2),

        conversationId:
          crypto.randomUUID(),
      });
  } catch (error) {
    await prisma.payment.updateMany({
      where: {
        id: payment.id,
        status: "PROCESSING",
      },
      data: {
        status: "SUCCEEDED",

        errorMessage:
          error instanceof Error
            ? error.message
            : "iyzico iade işlemi başlatılamadı.",
      },
    });

    throw new Error(
      "PROVIDER_ERROR",
    );
  }

  if (
    refundResult.status !==
    "success"
  ) {
    await prisma.payment.updateMany({
      where: {
        id: payment.id,
        status: "PROCESSING",
      },
      data: {
        status: "SUCCEEDED",

        errorCode:
          refundResult.errorCode ??
          null,

        errorMessage:
          refundResult.errorMessage ??
          "iyzico iade işlemi başarısız oldu.",
      },
    });

    throw new Error(
      "PROVIDER_ERROR",
    );
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        const currentPayment =
          await tx.payment.findUnique({
            where: {
              id: payment.id,
            },
          });

        if (!currentPayment) {
          throw new Error(
            "PAYMENT_NOT_FOUND",
          );
        }

        if (
          currentPayment.status !==
          "PROCESSING"
        ) {
          throw new Error(
            "PAYMENT_NOT_PROCESSING",
          );
        }

        const currentOrder =
          await tx.order.findUnique({
            where: {
              id: order.id,
            },
          });

        if (!currentOrder) {
          throw new Error(
            "ORDER_NOT_FOUND",
          );
        }

        if (
          requirePendingRequest &&
          currentOrder.requestStatus !==
            "PENDING"
        ) {
          throw new Error(
            "REQUEST_NOT_PENDING",
          );
        }

        for (const item of order.items) {
          await tx.product.update({
            where: {
              id: item.productId,
            },
            data: {
              stock: {
                increment:
                  item.quantity,
              },
            },
          });
        }

        await tx.payment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: "REFUNDED",
            errorCode: null,
            errorMessage: null,
          },
        });

        await tx.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: "CANCELLED",

            ...(requirePendingRequest
              ? {
                  requestStatus:
                    "APPROVED" as const,
                }
              : {}),
          },
        });
      },
    );
  } catch (error) {
    console.error(
      "REFUND_FINALIZE_ERROR:",
      error,
    );

    throw new Error(
      "REFUND_FINALIZE_FAILED",
    );
  }

  revalidateOrderPaths(orderId);
}

export async function approveOrderRequest(
  formData: FormData,
) {
  await requireAdmin();

  const result = requestSchema.safeParse({
    orderId: formData.get("orderId"),
  });

  if (!result.success) {
    redirect(
      "/admin/orders?requestError=invalid",
    );
  }

  const { orderId } = result.data;

  try {
    await performRefund({
      orderId,
      requirePendingRequest: true,
    });
  } catch (error) {
    console.error(
      "APPROVE_ORDER_REQUEST_ERROR:",
      error,
    );

    if (error instanceof Error) {
      if (
        error.message ===
        "ORDER_NOT_FOUND"
      ) {
        redirect(
          "/admin/orders?requestError=not-found",
        );
      }

      if (
        error.message ===
        "REQUEST_NOT_PENDING"
      ) {
        redirect(
          "/admin/orders?requestError=not-pending",
        );
      }

      if (
        error.message ===
          "REQUEST_TYPE_MISSING" ||
        error.message ===
          "INVALID_REQUEST_STATUS" ||
        error.message ===
          "DELIVERY_DATE_MISSING" ||
        error.message ===
          "REQUEST_DATE_MISSING"
      ) {
        redirect(
          "/admin/orders?requestError=status",
        );
      }

      if (
        error.message ===
        "RETURN_WINDOW_EXPIRED"
      ) {
        redirect(
          "/admin/orders?requestError=return-expired",
        );
      }

      if (
        error.message ===
        "ALREADY_REFUNDED"
      ) {
        redirect(
          "/admin/orders?requestError=already-refunded",
        );
      }

      if (
        error.message ===
          "PAYMENT_NOT_FOUND" ||
        error.message ===
          "PROVIDER_PAYMENT_ID_MISSING"
      ) {
        redirect(
          "/admin/orders?requestError=payment",
        );
      }

      if (
        error.message ===
        "PAYMENT_PROCESSING"
      ) {
        redirect(
          "/admin/orders?requestError=processing",
        );
      }

      if (
        error.message ===
        "PROVIDER_ERROR"
      ) {
        redirect(
          "/admin/orders?requestError=provider",
        );
      }
    }

    redirect(
      "/admin/orders?requestError=1",
    );
  }

  redirect(
    "/admin/orders?requestApproved=1",
  );
}

export async function refundOrder(
  formData: FormData,
) {
  await requireAdmin();

  const result = refundSchema.safeParse({
    orderId: formData.get("orderId"),
  });

  if (!result.success) {
    redirect(
      "/admin/orders?refundError=invalid",
    );
  }

  const { orderId } = result.data;

  try {
    await performRefund({
      orderId,
      requirePendingRequest: false,
    });
  } catch (error) {
    console.error(
      "REFUND_ORDER_ERROR:",
      error,
    );

    if (error instanceof Error) {
      if (
        error.message ===
        "ORDER_NOT_FOUND"
      ) {
        redirect(
          "/admin/orders?refundError=not-found",
        );
      }

      if (
        error.message ===
        "ALREADY_REFUNDED"
      ) {
        redirect(
          "/admin/orders?refundError=already-refunded",
        );
      }

      if (
        error.message ===
        "PAYMENT_NOT_FOUND"
      ) {
        redirect(
          "/admin/orders?refundError=payment",
        );
      }

      if (
        error.message ===
        "PROVIDER_PAYMENT_ID_MISSING"
      ) {
        redirect(
          "/admin/orders?refundError=provider-id",
        );
      }

      if (
        error.message ===
        "PAYMENT_PROCESSING"
      ) {
        redirect(
          "/admin/orders?refundError=processing",
        );
      }

      if (
        error.message ===
        "PROVIDER_ERROR"
      ) {
        redirect(
          "/admin/orders?refundError=provider",
        );
      }

      if (
        error.message ===
        "MANUAL_REFUND_NOT_ALLOWED"
      ) {
        redirect(
          "/admin/orders?refundError=status",
        );
      }

      if (
        error.message ===
        "REQUEST_PENDING"
      ) {
        redirect(
          "/admin/orders?refundError=request",
        );
      }
    }

    redirect(
      "/admin/orders?refundError=1",
    );
  }

  redirect(
    "/admin/orders?refunded=1",
  );
}
