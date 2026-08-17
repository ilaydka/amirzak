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
        name: "Kablosuz Bluetooth Kulaklık",
        brand: "SoundMax",
        category: "Elektronik",
        description:
          "Günlük kullanım için tasarlanmış kablosuz Bluetooth kulaklık. Kompakt şarj kutusu ve rahat kullanım sunar.",
        price: 1499,
        stock: 15,
        imageUrl: null,
      },
      {
        name: "Paslanmaz Çelik Termos",
        brand: "ThermoGo",
        category: "Ev ve Yaşam",
        description:
          "Sıcak ve soğuk içecekler için günlük kullanıma uygun paslanmaz çelik termos.",
        price: 749,
        stock: 40,
        imageUrl: null,
      },
      {
        name: "Sırt Çantası",
        brand: "UrbanPack",
        category: "Moda",
        description:
          "Günlük kullanım, okul ve seyahat için uygun geniş bölmeli kullanışlı sırt çantası.",
        price: 999,
        stock: 28,
        imageUrl: null,
      },
    ],
  });

  console.log("✅ AMİRZAK örnek ürünleri başarıyla eklendi.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });