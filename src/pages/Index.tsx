import { motion } from "framer-motion";
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
import CombosGiftsBanner from "@/components/home/CombosGiftsBanner";

const rise = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <PageTransition>
      <HeroSection />
      <motion.div
        variants={rise}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <NoAddressBanner />
      </motion.div>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.div variants={staggerItem}>
          <CategoriesSection />
        </motion.div>
        <motion.div variants={staggerItem} className="py-8 md:py-12">
          <CombosGiftsBanner />
        </motion.div>
        <motion.div variants={staggerItem}>
          <FeaturedProducts />
        </motion.div>
        <motion.div variants={staggerItem}>
          <TrustSection />
        </motion.div>
        <motion.div variants={staggerItem}>
          <OffersSection />
        </motion.div>
        <motion.div variants={staggerItem}>
          <CustomerReviews />
        </motion.div>
      </motion.div>
    </PageTransition>
    <Footer />
  </div>
);

export default Index;
