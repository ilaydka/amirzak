import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductForm from "@/components/ProductForm";

export default async function NewUserProductPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <section className="page-section page-content max-w-3xl">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">
              Ürünlerim
            </p>

            <h1 className="display-title mt-3 text-4xl text-text sm:text-5xl">
              Ürün Gönder
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-text-soft">
              Satışa sunmak istediğiniz bitki veya
              çiçeğin bilgilerini doldurun. Ürününüz
              mağazada yayınlanmadan önce yönetici
              incelemesine gönderilecektir.
            </p>
          </div>

          <div className="panel rounded-[28px] p-6 sm:p-8">
            <ProductForm mode="submit" />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}