import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductForm from "@/components/ProductForm";
import { prisma } from "@/lib/prisma";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId < 1) {
    notFound();
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
        <section className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
            Ürün Düzenle
          </p>

          <h1 className="mt-4 text-4xl font-bold">{product.name}</h1>

          <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
            <ProductForm
              mode="edit"
              initialValues={{
                id: product.id,
                name: product.name,
                brand: product.brand ?? "",
                category: product.category,
                price: product.price,
                stock: product.stock,
                compatibility: product.compatibility,
                imageUrl: product.imageUrl,
                description: product.description ?? "",
              }}
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}