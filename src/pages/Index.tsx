import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutPage from "@/pages/AboutPage";
import SearchPage from "@/pages/SearchPage";
import ContactPage from "@/pages/ContactPage";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42rem] bg-[radial-gradient(ellipse_80%_65%_at_50%_0%,hsl(var(--primary)/0.08),transparent_70%)]" aria-hidden />
    <Navbar />
    <section id="home" className="relative">
      <HeroSection />
    </section>
    <AboutPage embedded />
    <SearchPage embedded />
    <ContactPage embedded />
    <Footer />
  </div>
);

export default Index;
