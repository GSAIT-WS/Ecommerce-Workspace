import { Link } from "react-router-dom";
import { Gift, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import TrustSection from "@/components/TrustSection";
import OffersSection from "@/components/OffersSection";
import CustomerReviews from "@/components/CustomerReviews";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import NoAddressBanner from "@/components/address/NoAddressBanner";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <PageTransition>
      <HeroSection />
      <NoAddressBanner />
      <CategoriesSection />
      {/* Combo & Gifts CTA */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-8">
          <Link
            to="/build-combo"
            className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/20 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md md:p-8"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary transition-transform group-hover:scale-110">
                <Gift className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground md:text-xl">
                  Combos &amp; Gifts
                </h3>
                <p className="text-sm text-muted-foreground">
                  Build your own combo &amp; save up to 20%
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
      <FeaturedProducts />
      <TrustSection />
      <OffersSection />
      <CustomerReviews />
    </PageTransition>
    <Footer />
  </div>
);

export default Index;
