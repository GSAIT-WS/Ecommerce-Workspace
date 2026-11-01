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
  <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42rem] bg-[radial-gradient(ellipse_80%_65%_at_50%_0%,hsl(var(--primary)/0.08),transparent_70%)]" aria-hidden />
    <Navbar />
    <section id="home" className="relative">
      <HeroSection />
      <TrustSection />
      <FeaturedProducts />
      <div className="border-b border-border/50 bg-background/80 px-4 pb-14 pt-2 md:pb-20">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-border/70 bg-card/80 px-4 py-6 shadow-card sm:px-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="mb-1 font-body text-[11px] font-bold uppercase tracking-[0.16em] text-primary/75">
                Fresh from the pantry
              </p>
              <h3 className="font-brand text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-[2rem]">
                Ready for your next snack run?
              </h3>
            </div>
            <Link
              to="/#shop"
              onClick={(event) => {
                event.preventDefault();
                window.history.replaceState(window.history.state, "", "/#shop");

                const shopSection = document.getElementById("shop");
                if (!shopSection) return;

                const headerHeight =
                  document.querySelector("header")?.getBoundingClientRect().height ?? 0;
                const top =
                  window.scrollY + shopSection.getBoundingClientRect().top - headerHeight;
                const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "instant"
                  : "smooth";

                window.scrollTo({ top, behavior });
              }}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-body text-sm font-semibold text-primary-foreground shadow-[0_8px_20px_-12px_hsl(var(--primary)/0.7)] transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_12px_28px_-14px_hsl(var(--primary)/0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Shop Now
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
    <AboutPage embedded />
    <SearchPage embedded />
    <ContactPage embedded />
    <Footer />
  </div>
);

export default Index;
