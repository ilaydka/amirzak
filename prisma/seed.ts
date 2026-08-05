import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: "Brembo Fren Balatası",
        category: "Fren",
        price: 1499,
        compatibility: "BMW F30",
        stock: 15,
      },
      {
        name: "Bosch Yağ Filtresi",
        category: "Filtre",
        price: 349,
        compatibility: "Volkswagen Golf 7",
        stock: 40,
      },
      {
        name: "NGK Buji",
        category: "Ateşleme",
        price: 799,
        compatibility: "Honda Civic FC5",
        stock: 28,
      },
    ],
  });

  console.log("✅ Ürünler başarıyla eklendi.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });