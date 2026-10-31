import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import TrustSection from "@/components/TrustSection";
import OffersSection from "@/components/OffersSection";
import CustomerReviews from "@/components/CustomerReviews";
import Footer from "@/components/Footer";
import Reveal from "@/components/motion/Reveal";
import NoAddressBanner from "@/components/address/NoAddressBanner";

/**
 * Each home section reveals itself as *it* enters the viewport (see `Reveal`),
 * rather than one tall container staggering all of them at once — which fired
 * off-screen and left the lower half of the page with no reveal at all.
 * HeroSection, TrustSection, OffersSection, CustomerReviews
 * and Footer own their own reveals internally.
 */
const Index = () => (
  <div className="relative min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <Reveal distance={10} amount={0.1}>
      <NoAddressBanner />
    </Reveal>
    <FeaturedProducts />
    <TrustSection />
    <OffersSection />
    <CustomerReviews />
    <Footer />
  </div>
);

export default Index;
