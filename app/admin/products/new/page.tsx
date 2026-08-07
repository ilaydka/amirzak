import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductForm from "@/components/ProductForm";
import { requireAdmin } from "@/lib/admin";

export default async function NewProductPage() {
  await requireAdmin();

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
        <section className="mx-auto max-w-3xl">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
              Ürün Yönetimi
            </p>

            <h1 className="mt-3 text-4xl font-bold">Yeni Ürün Ekle</h1>

            <p className="mt-4 text-zinc-400">
              Yeni ürünün bilgilerini eksiksiz doldurun.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
            <ProductForm />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}