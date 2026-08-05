import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL bulunamadı.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  await prisma.product.deleteMany();

  await prisma.product.createMany({
    data: [
      {
        name: "Brembo Fren Balatası",
        category: "Fren",
        price: 1499,
        compatibility: "BMW F30",
        stock: 15,
        imageUrl: "/images/products/brembo.png",
      },
      {
        name: "Bosch Yağ Filtresi",
        category: "Filtre",
        price: 349,
        compatibility: "Volkswagen Golf 7",
        stock: 40,
        imageUrl: null,
      },
      {
        name: "NGK Buji",
        category: "Ateşleme",
        price: 799,
        compatibility: "Honda Civic FC5",
        stock: 28,
        imageUrl: null,
      },
    ],
  });

  console.log("✅ Ürünler ve görsel adresleri başarıyla eklendi.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });