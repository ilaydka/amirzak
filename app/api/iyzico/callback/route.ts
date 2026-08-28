import { NextRequest, NextResponse } from "next/server";

import { retrieveCheckoutForm } from "@/lib/iyzico";
import { moneyToNumber } from "@/lib/money";
import { prisma } from "@/lib/prisma";

function getAppUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL bulunamadı.");
  }

  return appUrl;
}

export async function POST(
  request: NextRequest,
) {
  const appUrl = getAppUrl();

  const paymentId =
    request.nextUrl.searchParams.get(
      "paymentId",
    );

  if (!paymentId) {
    return NextResponse.redirect(
      `${appUrl}/orders?payment=invalid`,
      303,
    );
  }

  let token = "";

  try {
    const formData = await request.formData();

    const receivedToken =
      formData.get("token");

    if (
      typeof receivedToken === "string"
    ) {
      token = receivedToken;
    }
  } catch {
    token = "";
  }

  if (!token) {
    await prisma.payment.updateMany({
      where: {
        id: paymentId,
        status: {
          in: [
            "PENDING",
            "PROCESSING",
          ],
        },
      },
      data: {
        status: "FAILED",
        errorMessage:
          "iyzico callback token bilgisi alınamadı.",
      },
    });

    return NextResponse.redirect(
      `${appUrl}/orders?payment=failed`,
      303,
    );
  }

  const payment =
    await prisma.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

  if (!payment || !payment.order) {
    return NextResponse.redirect(
      `${appUrl}/orders?payment=invalid`,
      303,
    );
  }

  const order = payment.order;

  if (
    payment.status === "SUCCEEDED"
  ) {
    return NextResponse.redirect(
      `${appUrl}/orders?payment=success&orderId=${encodeURIComponent(
        order.id,
      )}`,
      303,
    );
  }

  try {
    const result =
      await retrieveCheckoutForm(
        token,
        payment.conversationId,
      );

    const paymentSucceeded =
      result.status === "success" &&
      result.paymentStatus === "SUCCESS";

    if (!paymentSucceeded) {
      await prisma.$transaction([
        prisma.payment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: "FAILED",
            providerToken: token,
            providerPaymentId:
              result.paymentId ?? null,
            errorCode:
              result.errorCode ?? null,
            errorMessage:
              result.errorMessage ??
              "Ödeme başarısız oldu.",
          },
        }),

        prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: "CANCELLED",
          },
        }),
      ]);

      return NextResponse.redirect(
        `${appUrl}/orders?payment=failed`,
        303,
      );
    }

    if (
      result.conversationId &&
      result.conversationId !==
        payment.conversationId
    ) {
      throw new Error(
        "CONVERSATION_ID_MISMATCH",
      );
    }

    if (
      result.basketId &&
      result.basketId !== order.id
    ) {
      throw new Error(
        "BASKET_ID_MISMATCH",
      );
    }

    const paidAmount =
      Number(result.paidPrice);

    if (
      !Number.isFinite(paidAmount) ||
      Math.abs(
        paidAmount -
          moneyToNumber(payment.amount),
      ) > 0.01
    ) {
      await prisma.$transaction([
        prisma.payment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: "FAILED",
            providerToken: token,
            providerPaymentId:
              result.paymentId ?? null,
            errorMessage:
              "Ödeme tutarı sipariş tutarıyla eşleşmiyor.",
          },
        }),

        prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: "CANCELLED",
          },
        }),
      ]);

      return NextResponse.redirect(
        `${appUrl}/orders?payment=failed`,
        303,
      );
    }

    const completedOrder =
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
            currentPayment.status ===
            "SUCCEEDED"
          ) {
            return tx.order.findUnique({
              where: {
                id: order.id,
              },
            });
          }

          for (const item of order.items) {
            const updated =
              await tx.product.updateMany({
                where: {
                  id: item.productId,
                  isActive: true,
                  stock: {
                    gte: item.quantity,
                  },
                },
                data: {
                  stock: {
                    decrement:
                      item.quantity,
                  },
                },
              });

            if (updated.count !== 1) {
              throw new Error(
                `OUT_OF_STOCK:${item.product.name}`,
              );
            }
          }

          if (
            payment.checkoutType ===
              "CART" &&
            payment.cartId
          ) {
            for (const item of order.items) {
              const cartItem =
                await tx.cartItem.findFirst({
                  where: {
                    cartId:
                      payment.cartId,
                    productId:
                      item.productId,
                  },
                });

              if (!cartItem) {
                continue;
              }

              if (
                cartItem.quantity <=
                item.quantity
              ) {
                await tx.cartItem.delete({
                  where: {
                    id: cartItem.id,
                  },
                });
              } else {
                await tx.cartItem.update({
                  where: {
                    id: cartItem.id,
                  },
                  data: {
                    quantity: {
                      decrement:
                        item.quantity,
                    },
                  },
                });
              }
            }
          }

          await tx.payment.update({
            where: {
              id: payment.id,
            },
            data: {
              status: "SUCCEEDED",
              providerToken: token,
              providerPaymentId:
                result.paymentId ?? null,
              paidAt: new Date(),
              errorCode: null,
              errorMessage: null,
            },
          });

          return tx.order.update({
            where: {
              id: order.id,
            },
            data: {
              status: "PROCESSING",
            },
          });
        },
      );

    if (!completedOrder) {
      return NextResponse.redirect(
        `${appUrl}/orders?payment=error`,
        303,
      );
    }

    return NextResponse.redirect(
      `${appUrl}/orders?payment=success&orderId=${encodeURIComponent(
        completedOrder.id,
      )}`,
      303,
    );
  } catch (error) {
    console.error(
      "IYZICO_CALLBACK_ERROR:",
      error,
    );

    await prisma.payment.updateMany({
      where: {
        id: payment.id,
        status: {
          not: "SUCCEEDED",
        },
      },
      data: {
        errorMessage:
          error instanceof Error
            ? error.message
            : "Ödeme sonucu doğrulanamadı.",
      },
    });

    return NextResponse.redirect(
      `${appUrl}/orders?payment=error`,
      303,
    );
  }
}