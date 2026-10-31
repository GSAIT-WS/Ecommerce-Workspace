import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutPage from "@/pages/AboutPage";
import SearchPage from "@/pages/SearchPage";
import ContactPage from "@/pages/ContactPage";
import Footer from "@/components/Footer";
import FeaturedProducts from "@/components/FeaturedProducts";
import TrustSection from "@/components/TrustSection";

const Index = () => (
  <div className="relative min-h-screen bg-background">
    <Navbar />
    <section id="home">
      <HeroSection />
      <TrustSection />
      <FeaturedProducts />
      <div className="border-b border-border/50 bg-background px-4 pb-14 md:pb-20">
        <Link
          to="/#shop"
          className="mx-auto flex w-fit min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Shop Now
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
    <AboutPage embedded />
    <SearchPage embedded />
    <ContactPage embedded />
    <Footer />
  </div>
);

export default Index;
