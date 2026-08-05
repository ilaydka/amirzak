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
];

export default function FeaturedProducts() {
  return (
    <section className="bg-zinc-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-10 text-center text-3xl font-bold">
          Öne Çıkan Ürünler
        </h2>

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
      </div>
    </section>
  );
}