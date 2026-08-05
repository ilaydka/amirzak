export default function Categories() {
  const categories = [
    "Motor",
    "Egzoz",
    "Süspansiyon",
    "Fren",
    "Jant",
    "Elektronik",
  ];

  return (
    <section className="bg-zinc-900 px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-10 text-center text-3xl font-bold">
          Popüler Kategoriler
        </h2>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <div
              key={category}
              className="cursor-pointer rounded-xl border border-zinc-700 bg-zinc-950 p-6 text-center transition hover:border-red-500 hover:bg-zinc-800"
            >
              <h3 className="font-semibold">{category}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}