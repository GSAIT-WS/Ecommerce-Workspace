import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import TrustSection from "@/components/TrustSection";
import OffersSection from "@/components/OffersSection";
import CustomerReviews from "@/components/CustomerReviews";
import Footer from "@/components/Footer";
import Reveal from "@/components/motion/Reveal";
import NoAddressBanner from "@/components/address/NoAddressBanner";
import CombosGiftsBanner from "@/components/home/CombosGiftsBanner";
import {
  CrunchXDoodleBackground,
  CrunchXCornerDoodles,
  CrunchXSectionDivider,
} from "@/components/doodles";

/**
 * Each home section reveals itself as *it* enters the viewport (see `Reveal`),
 * rather than one tall container staggering all of them at once — which fired
 * off-screen and left the lower half of the page with no reveal at all.
 * HeroSection, CategoriesSection, TrustSection, OffersSection, CustomerReviews
 * and Footer own their own reveals internally.
 */
const Index = () => (
  <div className="relative min-h-screen overflow-x-hidden bg-background">
    <div className="pointer-events-none absolute inset-0 z-0 min-h-full">
      <CrunchXDoodleBackground variant="home" className="h-full min-h-[110vh] w-full" />
    </div>
    <CrunchXCornerDoodles className="fixed inset-0 z-0 hidden lg:block" />
    <div className="relative z-[1]">
    <Navbar />
      <HeroSection />
      <Reveal distance={10} amount={0.1}>
        <NoAddressBanner />
      </Reveal>
      <CategoriesSection />
      <Reveal distance={16} amount={0.2}>
        <div className="py-5 md:py-8">
          <CombosGiftsBanner />
        </div>
      </Reveal>
      <FeaturedProducts />
      <Reveal distance={10} amount={0.3}>
        <CrunchXSectionDivider />
      </Reveal>
      <TrustSection />
      <OffersSection />
      <CustomerReviews />
    <Footer />
    </div>
  </div>
);

export default Index;
