import ProductCard from "@/components/ProductCard";

const products = [
  {
    id: 4,
    name: "Brembo Fren Balatası",
    category: "Fren",
    price: "1.499 ₺",
    compatibility: "BMW F30",
  },
  {
    id: 5,
    name: "Bosch Yağ Filtresi",
    category: "Filtre",
    price: "349 ₺",
    compatibility: "Volkswagen Golf 7",
  },
  {
    id: 6,
    name: "NGK Buji",
    category: "Ateşleme",
    price: "799 ₺",
    compatibility: "Honda Civic FC5",
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
              key={product.id}
              id={product.id}
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