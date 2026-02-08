import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Dumbbell, Wheat, Heart, Package } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import categoryProteinBars from "@/assets/category-protein-bars.jpg";
import categoryMultigrain from "@/assets/category-multigrain.jpg";
import categoryHealthy from "@/assets/category-healthy-foods.jpg";
import categoryCombos from "@/assets/category-combos.jpg";

const categories = [
  {
    slug: "protein-bars",
    name: "Protein Bars",
    description: "High-protein snacks for active lifestyles",
    icon: Dumbbell,
    image: categoryProteinBars,
    productCount: 12,
  },
  {
    slug: "multigrain",
    name: "Multigrain Snacks",
    description: "Wholesome grains for everyday nutrition",
    icon: Wheat,
    image: categoryMultigrain,
    productCount: 18,
  },
  {
    slug: "healthy-foods",
    name: "Healthy Foods",
    description: "Natural and nutritious food options",
    icon: Heart,
    image: categoryHealthy,
    productCount: 24,
  },
  {
    slug: "combos",
    name: "Combos & Value Packs",
    description: "Great value bundles for the whole family",
    icon: Package,
    image: categoryCombos,
    productCount: 8,
  },
];

const CategoriesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-10 text-center">
          <h1 className="mb-2 font-display text-3xl font-bold text-foreground md:text-4xl">
            Shop by Category
          </h1>
          <p className="font-body text-muted-foreground">
            Find exactly what fuels your lifestyle
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {categories.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/search?category=${category.slug}`}
                className="group relative flex h-64 overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg md:h-72"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="relative z-10 flex h-full flex-col justify-end p-6">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <category.icon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="mb-1 font-display text-2xl font-bold text-white">
                    {category.name}
                  </h2>
                  <p className="mb-2 font-body text-sm text-white/80">
                    {category.description}
                  </p>
                  <span className="font-body text-xs text-white/60">
                    {category.productCount} products
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoriesPage;
