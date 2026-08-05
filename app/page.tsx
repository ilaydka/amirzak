import Navbar from "@/components/Navbar";

export default function Home() {

  return (

    <>

      <Navbar />

      <main className="min-h-screen bg-zinc-950 text-white">

        <section className="flex min-h-[calc(100vh-81px)] flex-col items-center justify-center px-6 text-center">

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-red-500">

            Performance Parts Marketplace

          </p>

          <h1 className="max-w-4xl text-5xl font-bold sm:text-7xl">

            Aracının performansını bir üst seviyeye taşı.

          </h1>

          <p className="mt-6 max-w-2xl text-lg text-zinc-400">

            Aracına uyumlu performans parçalarını keşfet, karşılaştır ve

            güvenilir satıcılardan satın al.

          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">

            <button className="rounded-lg bg-red-600 px-6 py-3 font-semibold">

              Ürünleri Keşfet

            </button>

            <button className="rounded-lg border border-zinc-700 px-6 py-3 font-semibold">

              Aracını Seç

            </button>

          </div>

        </section>

      </main>

    </>

  );

}