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
import {
  CrunchXDoodleBackground,
  CrunchXCornerDoodles,
  CrunchXSectionDivider,
} from "@/components/doodles";

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
  <div className="relative min-h-screen overflow-x-hidden bg-background">
    <div className="pointer-events-none absolute inset-0 z-0 min-h-full">
      <CrunchXDoodleBackground variant="home" className="h-full min-h-[110vh] w-full" />
    </div>
    <CrunchXCornerDoodles className="fixed inset-0 z-0 hidden lg:block" />
    <div className="relative z-[1]">
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
        <motion.div variants={staggerItem} className="py-5 md:py-8">
          <CombosGiftsBanner />
        </motion.div>
        <motion.div variants={staggerItem}>
          <FeaturedProducts />
        </motion.div>
        <motion.div variants={staggerItem}>
          <CrunchXSectionDivider />
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
  </div>
);

export default Index;
