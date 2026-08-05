import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";

const products = [
  {
    name: "HKS Cold Air Intake",
    category: "Motor",
    price: "12.500 ₺",
    compatibility: "Honda Civic FC5",
  },
  {
    name: "Brembo Brake Kit",
    category: "Fren",
    price: "24.900 ₺",
    compatibility: "BMW 320i F30",
  },
  {
    name: "KW Coilover V3",
    category: "Süspansiyon",
    price: "38.000 ₺",
    compatibility: "Volkswagen Golf 7",
  },
  {
    name: "Akrapovič Exhaust System",
    category: "Egzoz",
    price: "54.500 ₺",
    compatibility: "BMW M3 G80",
  },
  {
    name: "Performance Intercooler",
    category: "Motor",
    price: "31.750 ₺",
    compatibility: "Volkswagen Golf 7 GTI",
  },
  {
    name: "Forged Wheel Set",
    category: "Jant",
    price: "68.900 ₺",
    compatibility: "Audi A4 B9",
  },
];

export default function ProductsPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
        <section className="mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
              Tüm Ürünler
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Performans Parçaları
            </h1>

            <p className="mt-3 text-zinc-400">
              Aracına uygun performans ve modifiye parçalarını incele.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.name}
                name={product.name}
                category={product.category}
                price={product.price}
                compatibility={product.compatibility}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}