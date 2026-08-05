import Categories from "@/components/Categories";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import VehicleFinder from "@/components/VehicleFinder";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Categories />
      <VehicleFinder />
      <FeaturedProducts />
      <Footer />
    </>
  );
}