import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutPage from "@/pages/AboutPage";
import SearchPage from "@/pages/SearchPage";
import ContactPage from "@/pages/ContactPage";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="relative min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <AboutPage embedded />
    <SearchPage embedded />
    <ContactPage embedded />
    <Footer />
  </div>
);

export default Index;
