import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductForm from "@/components/ProductForm";
import { requireAdmin } from "@/lib/admin";

export default async function NewProductPage() {
  await requireAdmin();

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f6f2e8] px-6 py-14 text-[#253021]">
        <section className="mx-auto max-w-3xl">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#6f8265]">
              Ürün Yönetimi
            </p>

            <h1 className="mt-2 font-serif text-4xl font-semibold text-[#20361d] sm:text-5xl">
              Yeni Ürün Ekle
            </h1>

            <p className="mt-3 text-[#687064]">
              Yeni ürünün bilgilerini eksiksiz doldurun.
            </p>
          </div>

          <div className="rounded-[24px] border border-[#ded8cb] bg-[#fffdf8] p-6 shadow-[0_12px_35px_rgba(47,74,42,0.06)] sm:p-8">
            <ProductForm />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}