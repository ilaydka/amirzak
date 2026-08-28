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

const products = [
  {
    name: "Monstera Deliciosa",
    scientificName: "Monstera deliciosa",
    brand: "AMİRZAK",
    category: "İç Mekan Bitkileri",
    description:
      "Geniş ve karakteristik yapraklarıyla yaşam alanlarında güçlü bir yeşil etki oluşturan popüler iç mekan bitkisi.",
    price: 899,
    discountPrice: 799,
    stock: 18,
    imageUrl: "/images/products/monstera-deliciosa.jpg",
    lightRequirement: "Parlak dolaylı ışık",
    watering: "Toprağın üst kısmı kurudukça sulayın.",
    careLevel: "Kolay",
    environment: "İç Mekan",
    plantSize: "Orta",
    petSafe: false,
    bloomSeason: null,
    isActive: true,
    approvalStatus: "APPROVED" as const,
  },
  {
    name: "Salon Sarmaşığı",
    scientificName: "Epipremnum aureum",
    brand: "AMİRZAK",
    category: "İç Mekan Bitkileri",
    description:
      "Hızlı gelişen yapısı ve farklı ışık koşullarına uyumuyla ev ve ofisler için kolay bakımlı bir seçim.",
    price: 449,
    discountPrice: null,
    stock: 32,
    imageUrl: "/images/products/salon-sarmasigi.jpg",
    lightRequirement: "Düşük ışık",
    watering: "Toprak hafif kuruduğunda sulayın.",
    careLevel: "Kolay",
    environment: "İç Mekan",
    plantSize: "Küçük",
    petSafe: false,
    bloomSeason: null,
    isActive: true,
    approvalStatus: "APPROVED" as const,
  },
  {
    name: "Areka Palmiyesi",
    scientificName: "Dypsis lutescens",
    brand: "AMİRZAK",
    category: "İç Mekan Bitkileri",
    description:
      "İnce ve zarif yapraklarıyla iç mekanlara tropikal bir görünüm kazandıran dekoratif palmiye.",
    price: 1249,
    discountPrice: 1099,
    stock: 12,
    imageUrl: "/images/products/areka-palmiyesi.jpg",
    lightRequirement: "Parlak dolaylı ışık",
    watering: "Toprağı tamamen kurutmadan kontrollü sulayın.",
    careLevel: "Orta",
    environment: "İç Mekan",
    plantSize: "Büyük",
    petSafe: true,
    bloomSeason: null,
    isActive: true,
    approvalStatus: "APPROVED" as const,
  },
  {
    name: "Lavanta",
    scientificName: "Lavandula angustifolia",
    brand: "AMİRZAK",
    category: "Dış Mekan Bitkileri",
    description:
      "Kendine özgü kokusu ve mor çiçekleriyle balkon, teras ve bahçelerde yetiştirilebilen aromatik bitki.",
    price: 349,
    discountPrice: null,
    stock: 25,
    imageUrl: "/images/products/lavanta.jpg",
    lightRequirement: "Doğrudan güneş",
    watering: "Toprak kurudukça ölçülü sulayın.",
    careLevel: "Kolay",
    environment: "Dış Mekan",
    plantSize: "Küçük",
    petSafe: false,
    bloomSeason: "İlkbahar - Yaz",
    isActive: true,
    approvalStatus: "APPROVED" as const,
  },
  {
    name: "Ortanca",
    scientificName: "Hydrangea macrophylla",
    brand: "AMİRZAK",
    category: "Dış Mekan Bitkileri",
    description:
      "Gösterişli çiçek kümeleriyle balkon ve bahçelerde dikkat çeken klasik bir dış mekan bitkisi.",
    price: 649,
    discountPrice: 579,
    stock: 16,
    imageUrl: "/images/products/ortanca.jpg",
    lightRequirement: "Orta ışık",
    watering:
      "Toprağı hafif nemli tutacak şekilde düzenli sulayın.",
    careLevel: "Orta",
    environment: "Dış Mekan",
    plantSize: "Orta",
    petSafe: false,
    bloomSeason: "İlkbahar - Yaz",
    isActive: true,
    approvalStatus: "APPROVED" as const,
  },
  {
    name: "Barış Çiçeği",
    scientificName: "Spathiphyllum wallisii",
    brand: "AMİRZAK",
    category: "Çiçekli Bitkiler",
    description:
      "Parlak yeşil yaprakları ve beyaz çiçekleriyle iç mekanlarda zarif ve sakin bir görünüm oluşturur.",
    price: 599,
    discountPrice: null,
    stock: 21,
    imageUrl: "/images/products/baris-cicegi.jpg",
    lightRequirement: "Orta ışık",
    watering:
      "Toprağın üst yüzeyi kurumaya başladığında sulayın.",
    careLevel: "Kolay",
    environment: "İç Mekan",
    plantSize: "Orta",
    petSafe: false,
    bloomSeason: "İlkbahar - Yaz",
    isActive: true,
    approvalStatus: "APPROVED" as const,
  },
  {
    name: "Echeveria Sukulent",
    scientificName: "Echeveria elegans",
    brand: "AMİRZAK",
    category: "Sukulent & Kaktüs",
    description:
      "Rozet biçimli yapraklarıyla masa, raf ve küçük yaşam alanları için kompakt dekoratif sukulent.",
    price: 229,
    discountPrice: null,
    stock: 44,
    imageUrl: "/images/products/echeveria-sukulent.jpg",
    lightRequirement: "Parlak dolaylı ışık",
    watering:
      "Toprak tamamen kuruduktan sonra az miktarda sulayın.",
    careLevel: "Kolay",
    environment: "İç Mekan",
    plantSize: "Mini",
    petSafe: true,
    bloomSeason: null,
    isActive: true,
    approvalStatus: "APPROVED" as const,
  },
  {
    name: "Altın Fıçı Kaktüsü",
    scientificName: "Echinocactus grusonii",
    brand: "AMİRZAK",
    category: "Sukulent & Kaktüs",
    description:
      "Yuvarlak formu ve altın renkli dikenleriyle güçlü karaktere sahip dekoratif kaktüs.",
    price: 379,
    discountPrice: 329,
    stock: 30,
    imageUrl: "/images/products/altin-fici-kaktusu.jpg",
    lightRequirement: "Doğrudan güneş",
    watering: "Toprak tamamen kuruduktan sonra sulayın.",
    careLevel: "Kolay",
    environment: "İç Mekan",
    plantSize: "Küçük",
    petSafe: false,
    bloomSeason: null,
    isActive: true,
    approvalStatus: "APPROVED" as const,
  },
  {
    name: "Beyaz Phalaenopsis Orkide",
    scientificName: "Phalaenopsis",
    brand: "AMİRZAK",
    category: "Orkideler",
    description:
      "Uzun ömürlü beyaz çiçekleri ve zarif formuyla ev ve çalışma alanları için özel bir orkide.",
    price: 849,
    discountPrice: 749,
    stock: 14,
    imageUrl: "/images/products/beyaz-orkide.jpg",
    lightRequirement: "Parlak dolaylı ışık",
    watering:
      "Kökler gri renge döndüğünde kontrollü şekilde sulayın.",
    careLevel: "Orta",
    environment: "İç Mekan",
    plantSize: "Orta",
    petSafe: true,
    bloomSeason: "Yıl Boyu",
    isActive: true,
    approvalStatus: "APPROVED" as const,
  },
  {
    name: "Mevsim Çiçekleri Buketi",
    scientificName: null,
    brand: "AMİRZAK",
    category: "Buket & Kesme Çiçek",
    description:
      "Mevsimin renklerini bir araya getiren doğal görünümlü, hediye ve özel günler için hazırlanmış çiçek buketi.",
    price: 999,
    discountPrice: 899,
    stock: 20,
    imageUrl: "/images/products/mevsim-cicekleri-buketi.jpg",
    lightRequirement: null,
    watering: "Vazo suyunu düzenli olarak yenileyin.",
    careLevel: null,
    environment: "İç Mekan",
    plantSize: "Orta",
    petSafe: null,
    bloomSeason: "Mevsimsel",
    isActive: true,
    approvalStatus: "APPROVED" as const,
  },
  {
    name: "Seramik Bitki Saksısı",
    scientificName: null,
    brand: "AMİRZAK",
    category: "Saksı & Aksesuar",
    description:
      "Sade formu ve doğal tonu sayesinde farklı bitki türleriyle uyum sağlayan dekoratif seramik saksı.",
    price: 399,
    discountPrice: null,
    stock: 38,
    imageUrl: "/images/products/seramik-bitki-saksisi.jpg",
    lightRequirement: null,
    watering: null,
    careLevel: null,
    environment: null,
    plantSize: "Orta",
    petSafe: null,
    bloomSeason: null,
    isActive: true,
    approvalStatus: "APPROVED" as const,
  },
  {
    name: "Organik Bitki Besini",
    scientificName: null,
    brand: "AMİRZAK",
    category: "Bitki Bakım Ürünleri",
    description:
      "İç ve dış mekan bitkilerinin düzenli bakımını desteklemek amacıyla hazırlanmış sıvı bitki besini.",
    price: 249,
    discountPrice: 219,
    stock: 50,
    imageUrl: "/images/products/organik-bitki-besini.jpg",
    lightRequirement: null,
    watering: null,
    careLevel: null,
    environment: null,
    plantSize: null,
    petSafe: null,
    bloomSeason: null,
    isActive: true,
    approvalStatus: "APPROVED" as const,
  },
];

async function main() {
  await prisma.product.deleteMany({
    where: {
      name: {
        in: [
          "Kablosuz Bluetooth Kulaklık",
          "Paslanmaz Çelik Termos",
          "Sırt Çantası",
        ],
      },
    },
  });

  for (const product of products) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        name: product.name,
      },
      select: {
        id: true,
      },
    });

    if (existingProduct) {
      await prisma.product.update({
        where: {
          id: existingProduct.id,
        },
        data: product,
      });

      console.log(`🔄 Güncellendi: ${product.name}`);
    } else {
      await prisma.product.create({
        data: product,
      });

      console.log(`➕ Eklendi: ${product.name}`);
    }
  }

  console.log("");
  console.log(
    "✅ AMİRZAK botanik ürünleri ve görsel yolları hazır.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });