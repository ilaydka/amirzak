type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
      <section className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
        <div className="flex min-h-[420px] items-center justify-center rounded-2xl bg-zinc-900 text-zinc-500">
          Ürün Görseli
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
            Motor Performansı
          </p>

          <h1 className="mt-4 text-4xl font-bold">
            HKS Cold Air Intake
          </h1>

          <p className="mt-4 text-zinc-400">
            Ürün ID: {id}
          </p>

          <p className="mt-6 text-3xl font-bold">
            12.500 ₺
          </p>

          <div className="mt-8 space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <p>
              <span className="font-semibold">Marka:</span> HKS
            </p>

            <p>
              <span className="font-semibold">Kategori:</span> Motor
            </p>

            <p>
              <span className="font-semibold">Uyumlu Araç:</span> Honda Civic FC5
            </p>

            <p>
              <span className="font-semibold">Stok:</span> Var
            </p>
          </div>

          <button className="mt-8 w-full rounded-lg bg-red-600 px-6 py-4 font-semibold hover:bg-red-500">
            Sepete Ekle
          </button>
        </div>
      </section>
    </main>
  );
}