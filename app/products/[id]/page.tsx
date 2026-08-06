import AddToCartForm from "@/components/AddToCartForm";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!product) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
          <h1 className="text-3xl font-bold">Ürün bulunamadı.</h1>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
        <section className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <div className="flex min-h-[420px] items-center justify-center rounded-2xl bg-zinc-900">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-contain p-8"
              />
            ) : (
              <p className="text-zinc-500">Ürün Görseli Yok</p>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
              {product.category}
            </p>

            <h1 className="mt-4 text-4xl font-bold">{product.name}</h1>

            <p className="mt-4 text-zinc-400">Ürün ID: {product.id}</p>

            <p className="mt-6 text-3xl font-bold">
              {product.price.toLocaleString("tr-TR")} ₺
            </p>

            <div className="mt-8 space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <p>
                <span className="font-semibold">Kategori:</span>{" "}
                {product.category}
              </p>

              <p>
                <span className="font-semibold">Uyumlu Araç:</span>{" "}
                {product.compatibility}
              </p>

              <p>
                <span className="font-semibold">Stok:</span>{" "}
                {product.stock > 0 ? `${product.stock} adet` : "Tükendi"}
              </p>
            </div>

            <AddToCartForm
              productId={product.id}
              disabled={product.stock < 1}
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}