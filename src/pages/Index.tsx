import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import TrustSection from "@/components/TrustSection";
import OffersSection from "@/components/OffersSection";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <PageTransition>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />
      <TrustSection />
      <OffersSection />
    </PageTransition>
    <Footer />
  </div>
);

export default Index;
