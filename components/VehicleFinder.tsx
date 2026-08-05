export default function VehicleFinder() {
  return (
    <section className="bg-zinc-900 px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl rounded-2xl border border-zinc-800 bg-zinc-950 p-8 md:p-12">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
            Araç Uyumluluk Bulucu
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Aracına uygun parçaları bul
          </h2>

          <p className="mt-3 text-zinc-400">
            Araç bilgilerini seç ve yalnızca aracınla uyumlu ürünleri görüntüle.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <select className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3">
            <option>Marka seç</option>
            <option>BMW</option>
            <option>Honda</option>
            <option>Volkswagen</option>
          </select>

          <select className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3">
            <option>Model seç</option>
          </select>

          <select className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3">
            <option>Kasa seç</option>
          </select>

          <select className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3">
            <option>Motor seç</option>
          </select>
        </div>

        <button className="mt-6 w-full rounded-lg bg-red-600 px-6 py-3 font-semibold transition hover:bg-red-500">
          Uyumlu Ürünleri Göster
        </button>
      </div>
    </section>
  );
}