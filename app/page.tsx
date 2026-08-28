import Benefits from "@/components/Benefits";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HomeProductSearch from "@/components/HomeProductSearch";
import Navbar from "@/components/Navbar";
import PlantCollections from "@/components/PlantCollections";
import VisualDiscovery from "@/components/VisualDiscovery";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const searchableProducts =
    await prisma.product.findMany({
      where: {
        isActive: true,
        approvalStatus: "APPROVED",
      },
      select: {
        id: true,
        name: true,
        category: true,
        brand: true,
        scientificName: true,
      },
      orderBy: {
        name: "asc",
      },
      take: 100,
    });

  return (
    <>
      <Navbar />

      <main className="bg-background">
        <HomeProductSearch
          products={searchableProducts}
        />

        <VisualDiscovery />

        <FeaturedProducts />

        <PlantCollections />

        <Hero />

        <Benefits />
      </main>

      <Footer />
    </>
  );
}