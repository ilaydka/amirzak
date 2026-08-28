import { prisma } from "../lib/prisma";

const oldProductIds = [4, 5, 6];

async function main() {
  const oldOrders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          productId: {
            in: oldProductIds,
          },
        },
      },
    },
    select: {
      id: true,
    },
  });

  const oldOrderIds = oldOrders.map(
    (order) => order.id,
  );

  console.log(
    `${oldOrderIds.length} eski sipariş bulundu.`,
  );

  const supportTicketCount =
    await prisma.supportTicket.count();

  console.log(
    `${supportTicketCount} destek talebi bulundu.`,
  );

  await prisma.$transaction(async (tx) => {
    if (oldOrderIds.length > 0) {
      await tx.payment.deleteMany({
        where: {
          orderId: {
            in: oldOrderIds,
          },
        },
      });

      await tx.orderItem.deleteMany({
        where: {
          orderId: {
            in: oldOrderIds,
          },
        },
      });

      await tx.order.deleteMany({
        where: {
          id: {
            in: oldOrderIds,
          },
        },
      });
    }

    await tx.cartItem.deleteMany({
      where: {
        productId: {
          in: oldProductIds,
        },
      },
    });

    await tx.review.deleteMany({
      where: {
        productId: {
          in: oldProductIds,
        },
      },
    });

    await tx.product.deleteMany({
      where: {
        id: {
          in: oldProductIds,
        },
      },
    });

    await tx.supportReply.deleteMany();

    await tx.supportTicket.deleteMany();
  });

  console.log(
    "Eski otomotiv ürünleri, ilgili siparişler ve eski destek talepleri temizlendi.",
  );
}

main()
  .catch((error) => {
    console.error(
      "CLEANUP_ERROR:",
      error,
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });