"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { initializeCheckoutForm } from "@/lib/iyzico";
import {
  type MoneyValue,
  moneyToNumber,
  optionalMoneyToNumber,
} from "@/lib/money";
import { prisma } from "@/lib/prisma";

export type PaymentActionState = {
  success: boolean;
  message: string;
};

const paymentSchema = z.discriminatedUnion("checkoutType", [
  z.object({
    checkoutType: z.literal("BUY_NOW"),
    productId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().min(1),
  }),
  z.object({
    checkoutType: z.literal("CART"),
  }),
]);

function getCurrentPrice(
  price: MoneyValue,
  discountPrice: MoneyValue | null,
) {
  const normalizedPrice = moneyToNumber(price);
  const normalizedDiscountPrice =
    optionalMoneyToNumber(discountPrice);

  if (
    normalizedDiscountPrice !== null &&
    normalizedDiscountPrice < normalizedPrice
  ) {
    return normalizedDiscountPrice;
  }

  return normalizedPrice;
}

function formatPrice(value: MoneyValue) {
  return moneyToNumber(value).toFixed(2);
}

async function cancelExpiredPayments(
  userId: string,
) {
  const expirationDate = new Date(
    Date.now() - 30 * 60 * 1000,
  );

  const expiredPayments =
    await prisma.payment.findMany({
      where: {
        userId,
        status: {
          in: [
            "PENDING",
            "PROCESSING",
          ],
        },
        createdAt: {
          lt: expirationDate,
        },
      },
      select: {
        id: true,
        orderId: true,
      },
    });

  if (expiredPayments.length === 0) {
    return;
  }

  const paymentIds =
    expiredPayments.map(
      (payment) => payment.id,
    );

  const orderIds =
    expiredPayments
      .map(
        (payment) =>
          payment.orderId,
      )
      .filter(
        (
          orderId,
        ): orderId is string =>
          Boolean(orderId),
      );

  await prisma.$transaction([
    prisma.payment.updateMany({
      where: {
        id: {
          in: paymentIds,
        },
        status: {
          in: [
            "PENDING",
            "PROCESSING",
          ],
        },
      },
      data: {
        status: "CANCELLED",
        errorMessage:
          "Ödeme işlemi zaman aşımına uğradı.",
      },
    }),

    prisma.order.updateMany({
      where: {
        id: {
          in: orderIds,
        },
        status: "PENDING",
      },
      data: {
        status: "CANCELLED",
      },
    }),
  ]);
}

export async function startIyzicoPayment(
  previousState: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message:
        "Ödeme yapmak için giriş yapmalısınız.",
    };
  }

  await cancelExpiredPayments(
    session.user.id,
  );

  const checkoutType =
    formData.get("checkoutType");

  const result =
    checkoutType === "BUY_NOW"
      ? paymentSchema.safeParse({
          checkoutType,
          productId:
            formData.get("productId"),
          quantity:
            formData.get("quantity"),
        })
      : paymentSchema.safeParse({
          checkoutType,
        });

  if (!result.success) {
    return {
      success: false,
      message:
        "Ödeme bilgileri geçersiz.",
    };
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        phoneCountryCode: true,
        phone: true,
        countryCode: true,
        city: true,
        postalCode: true,
        address: true,
      },
    });

  if (!user) {
    return {
      success: false,
      message:
        "Kullanıcı hesabı bulunamadı.",
    };
  }

  const firstName =
    user.firstName?.trim() ||
    user.name?.trim() ||
    "";

  const lastName =
    user.lastName?.trim() || "";

  if (
    !firstName ||
    !lastName ||
    !user.email?.trim() ||
    !user.phone?.trim() ||
    !user.city?.trim() ||
    !user.address?.trim()
  ) {
    return {
      success: false,
      message:
        "Ödeme yapabilmek için profilinizde ad, soyad, e-posta, telefon, şehir ve açık adres bilgilerinizi tamamlamalısınız.",
    };
  }

  const shippingSnapshot = {
    shippingFirstName: firstName,
    shippingLastName: lastName,
    shippingPhoneCountryCode:
      user.phoneCountryCode?.trim() || null,
    shippingPhone:
      user.phone.trim(),
    shippingCountryCode:
      user.countryCode?.trim() || null,
    shippingCity:
      user.city.trim(),
    shippingPostalCode:
      user.postalCode?.trim() || null,
    shippingAddress:
      user.address.trim(),
  };

  let orderProducts: {
    productId: number;
    name: string;
    category: string;
    quantity: number;
    unitPrice: number;
  }[] = [];

  let cartId: string | null = null;

  if (
    result.data.checkoutType ===
    "BUY_NOW"
  ) {
    const product =
      await prisma.product.findUnique({
        where: {
          id: result.data.productId,
        },
      });

    if (!product) {
      return {
        success: false,
        message: "Ürün bulunamadı.",
      };
    }

    if (!product.isActive) {
      return {
        success: false,
        message:
          "Bu ürün artık satışta değil.",
      };
    }

    if (
      product.stock <
      result.data.quantity
    ) {
      return {
        success: false,
        message:
          "Bu ürün için yeterli stok bulunmuyor.",
      };
    }

    orderProducts = [
      {
        productId: product.id,
        name: product.name,
        category:
          product.category,
        quantity:
          result.data.quantity,
        unitPrice:
          getCurrentPrice(
            product.price,
            product.discountPrice,
          ),
      },
    ];
  } else {
    const cart =
      await prisma.cart.findUnique({
        where: {
          userId:
            session.user.id,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

    if (
      !cart ||
      cart.items.length === 0
    ) {
      return {
        success: false,
        message:
          "Sepetiniz boş.",
      };
    }

    cartId = cart.id;

    for (
      const item of
      cart.items
    ) {
      if (
        !item.product.isActive
      ) {
        return {
          success: false,
          message: `${item.product.name} artık satışta değil.`,
        };
      }

      if (
        item.product.stock <
        item.quantity
      ) {
        return {
          success: false,
          message: `${item.product.name} için yeterli stok bulunmuyor.`,
        };
      }
    }

    orderProducts =
      cart.items.map(
        (item) => ({
          productId:
            item.productId,
          name:
            item.product.name,
          category:
            item.product.category,
          quantity:
            item.quantity,
          unitPrice:
            getCurrentPrice(
              item.product.price,
              item.product.discountPrice,
            ),
        }),
      );
  }

  const total =
    orderProducts.reduce(
      (sum, item) =>
        sum +
        item.unitPrice *
          item.quantity,
      0,
    );

  if (total <= 0) {
    return {
      success: false,
      message:
        "Sipariş toplamı geçersiz.",
    };
  }

  const conversationId =
    crypto.randomUUID();

  const created =
    await prisma.$transaction(
      async (tx) => {
        const order =
          await tx.order.create({
            data: {
              userId:
                session.user.id,
              total,
              status:
                "PENDING",

              ...shippingSnapshot,

              items: {
                create:
                  orderProducts.map(
                    (item) => ({
                      productId:
                        item.productId,
                      quantity:
                        item.quantity,
                      unitPrice:
                        item.unitPrice,
                    }),
                  ),
              },
            },
          });

        const payment =
          await tx.payment.create({
            data: {
              userId:
                session.user.id,
              orderId:
                order.id,
              provider:
                "IYZICO",
              status:
                "PENDING",
              amount:
                total,
              currency:
                "TRY",
              checkoutType:
                result.data
                  .checkoutType,
              cartId,
              conversationId,
            },
          });

        return {
          order,
          payment,
        };
      },
    );

  const requestHeaders =
    await headers();

  const forwardedFor =
    requestHeaders.get(
      "x-forwarded-for",
    );

  const ip =
    forwardedFor
      ?.split(",")[0]
      ?.trim() ||
    requestHeaders.get(
      "x-real-ip",
    ) ||
    "127.0.0.1";

  const appUrl =
    process.env
      .NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    await prisma.$transaction([
      prisma.payment.update({
        where: {
          id: created.payment.id,
        },
        data: {
          status: "FAILED",
          errorMessage:
            "NEXT_PUBLIC_APP_URL bulunamadı.",
        },
      }),
      prisma.order.update({
        where: {
          id: created.order.id,
        },
        data: {
          status:
            "CANCELLED",
        },
      }),
    ]);

    return {
      success: false,
      message:
        "Ödeme sistemi yapılandırması eksik.",
    };
  }

  try {
    const iyzicoResult =
      await initializeCheckoutForm({
        conversationId,
        price:
          formatPrice(total),
        paidPrice:
          formatPrice(total),
        basketId:
          created.order.id,
        callbackUrl:
          `${appUrl}/api/iyzico/callback?paymentId=${encodeURIComponent(
            created.payment.id,
          )}`,
        buyer: {
          id: user.id,
          name: firstName,
          surname: lastName,
          gsmNumber: `${
            user.phoneCountryCode ??
            "+90"
          }${user.phone.replace(
            /\s+/g,
            "",
          )}`,
          email: user.email,
          identityNumber:
            process.env
              .IYZICO_TEST_IDENTITY_NUMBER ??
            "11111111111",
          registrationAddress:
            user.address,
          ip,
          city:
            user.city,
          country:
            user.countryCode ??
            "TR",
          zipCode:
            user.postalCode ??
            "",
        },
        shippingAddress: {
          contactName: `${firstName} ${lastName}`,
          city:
            user.city,
          country:
            user.countryCode ??
            "TR",
          address:
            user.address,
          zipCode:
            user.postalCode ??
            "",
        },
        billingAddress: {
          contactName: `${firstName} ${lastName}`,
          city:
            user.city,
          country:
            user.countryCode ??
            "TR",
          address:
            user.address,
          zipCode:
            user.postalCode ??
            "",
        },
        basketItems:
          orderProducts.map(
            (item) => ({
              id: String(
                item.productId,
              ),
              name:
                item.name,
              category1:
                item.category ||
                "Diğer",
              itemType:
                "PHYSICAL",
              price:
                formatPrice(
                  item.unitPrice *
                    item.quantity,
                ),
            }),
          ),
      });

    if (
      iyzicoResult.status !==
        "success" ||
      !iyzicoResult.token ||
      !iyzicoResult.paymentPageUrl
    ) {
      await prisma.$transaction([
        prisma.payment.update({
          where: {
            id: created.payment.id,
          },
          data: {
            status: "FAILED",
            errorCode:
              iyzicoResult.errorCode ??
              null,
            errorMessage:
              iyzicoResult.errorMessage ??
              "iyzico ödeme oturumu oluşturulamadı.",
          },
        }),
        prisma.order.update({
          where: {
            id: created.order.id,
          },
          data: {
            status:
              "CANCELLED",
          },
        }),
      ]);

      return {
        success: false,
        message:
          iyzicoResult.errorMessage ??
          "Ödeme başlatılamadı. Lütfen tekrar deneyin.",
      };
    }

    await prisma.payment.update({
      where: {
        id: created.payment.id,
      },
      data: {
        status:
          "PROCESSING",
        providerToken:
          iyzicoResult.token,
      },
    });

    redirect(
      iyzicoResult.paymentPageUrl,
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "NEXT_REDIRECT"
    ) {
      throw error;
    }

    console.error(
      "IYZICO_PAYMENT_START_ERROR:",
      error,
    );

    await prisma.$transaction([
      prisma.payment.update({
        where: {
          id: created.payment.id,
        },
        data: {
          status: "FAILED",
          errorMessage:
            error instanceof Error
              ? error.message
              : "Bilinmeyen ödeme hatası.",
        },
      }),
      prisma.order.update({
        where: {
          id: created.order.id,
        },
        data: {
          status:
            "CANCELLED",
        },
      }),
    ]);

    return {
      success: false,
      message:
        "Ödeme başlatılırken bir hata oluştu.",
    };
  }

  return {
    success: true,
    message: "",
  };
}