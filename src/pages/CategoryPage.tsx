import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { SlidersHorizontal, ChevronDown, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductListCard from "@/components/ProductListCard";
import ProductFilters from "@/components/ProductFilters";

// Import product images
import productProteinBar from "@/assets/product-protein-bar.jpg";
import productMilletBar from "@/assets/product-millet-bar.jpg";
import productHealthyMix from "@/assets/product-healthy-mix.jpg";
import productMultigrainSnack from "@/assets/product-multigrain-snack.jpg";
import productChikki from "@/assets/product-chikki.jpg";
import productCombo from "@/assets/product-combo.jpg";
import productShilajitBar from "@/assets/product-shilajit-bar.jpg";

// Category metadata
const categoryData: Record<string, { title: string; subtitle: string }> = {
  "protein-bars": {
    title: "Protein Bars",
    subtitle: "Power-packed nutrition bars with 20g+ protein for your active lifestyle",
  },
  "multigrain-snacks": {
    title: "Multigrain Snacks",
    subtitle: "Wholesome snacks made with 7+ ancient grains for guilt-free munching",
  },
  "healthy-foods": {
    title: "Healthy Foods",
    subtitle: "Nutrient-rich superfoods sourced from Indian farms",
  },
  combos: {
    title: "Value Combos",
    subtitle: "Curated bundles for maximum savings and variety",
  },
};

// Dummy products
const products = [
  {
    id: 1,
    name: "Peanut Butter Protein Bar",
    tag: "High Protein",
    price: 199,
    originalPrice: 249,
    rating: 4.5,
    image: productProteinBar,
    protein: "20g",
    calories: "220 kcal",
    dietType: "Vegetarian",
    packType: "Pack of 6",
  },
  {
    id: 2,
    name: "Millet Energy Bar",
    tag: "Multigrain",
    price: 149,
    originalPrice: 179,
    rating: 4.3,
    image: productMilletBar,
    protein: "8g",
    calories: "160 kcal",
    dietType: "Vegan",
    packType: "Single Pack",
  },
  {
    id: 3,
    name: "Mixed Nuts & Seeds",
    tag: "Low Sugar",
    price: 349,
    originalPrice: 429,
    rating: 4.7,
    image: productHealthyMix,
    protein: "15g",
    calories: "280 kcal",
    dietType: "Keto Friendly",
    packType: "250g Pack",
  },
  {
    id: 4,
    name: "Ragi Multigrain Chips",
    tag: "Gluten-Free",
    price: 129,
    rating: 4.2,
    image: productMultigrainSnack,
    protein: "6g",
    calories: "140 kcal",
    dietType: "Gluten-Free",
    packType: "Pack of 3",
  },
  {
    id: 5,
    name: "Traditional Groundnut Chikki",
    tag: "No Added Sugar",
    price: 99,
    originalPrice: 129,
    rating: 4.6,
    image: productChikki,
    protein: "10g",
    calories: "180 kcal",
    dietType: "Vegetarian",
    packType: "200g Pack",
  },
  {
    id: 6,
    name: "Healthy Snacks Combo",
    tag: "Best Value",
    price: 599,
    originalPrice: 799,
    rating: 4.8,
    image: productCombo,
    protein: "12g avg",
    calories: "200 kcal avg",
    dietType: "Mixed",
    packType: "Combo Pack",
  },
  {
    id: 7,
    name: "Shilajit Power Bar",
    tag: "Ayurvedic",
    price: 279,
    originalPrice: 349,
    rating: 4.4,
    image: productShilajitBar,
    protein: "18g",
    calories: "210 kcal",
    dietType: "Vegetarian",
    packType: "Pack of 4",
  },
  {
    id: 8,
    name: "Quinoa Crunch Bites",
    tag: "High Fiber",
    price: 189,
    originalPrice: 229,
    rating: 4.1,
    image: productMilletBar,
    protein: "9g",
    calories: "150 kcal",
    dietType: "Vegan",
    packType: "Single Pack",
  },
];

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("popularity");

  const category = categoryData[slug || "protein-bars"] || categoryData["protein-bars"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Page Header */}
      <section className="bg-gradient-to-b from-muted/50 to-background px-4 pb-6 pt-24 md:pb-8 md:pt-28">
        <div className="mx-auto max-w-7xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold text-foreground md:text-4xl"
          >
            {category.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-2 max-w-xl font-body text-sm text-muted-foreground md:text-base"
          >
            {category.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Sticky Filter & Sort Bar */}
      <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          {/* Left: Filter Button & Results Count */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterOpen(true)}
              className="gap-2 rounded-full font-body"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
            <span className="font-body text-sm text-muted-foreground">
              {products.length} products
            </span>
          </div>

          {/* Right: Sort & View Toggle */}
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] rounded-full font-body text-sm md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="price-low">Price: Low → High</SelectItem>
                <SelectItem value="price-high">Price: High → Low</SelectItem>
                <SelectItem value="new">New Arrivals</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex rounded-full border border-border bg-muted p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-full p-1.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-full p-1.5 transition-colors ${
                  viewMode === "list"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid/List */}
      <section className="px-4 py-6 md:py-8">
        <div className="mx-auto max-w-7xl">
          {viewMode === "grid" ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
              className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
            >
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <ProductCard
                    name={product.name}
                    tag={product.tag}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    rating={product.rating}
                    image={product.image}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 },
                },
              }}
              className="flex flex-col gap-4"
            >
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <ProductListCard
                    name={product.name}
                    tag={product.tag}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    rating={product.rating}
                    image={product.image}
                    protein={product.protein}
                    calories={product.calories}
                    dietType={product.dietType}
                    packType={product.packType}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Load More Button */}
          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 rounded-full font-body"
            >
              Load More Products
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Filter Sheet */}
      <ProductFilters isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />

      <Footer />
    </div>
  );
};

export default CategoryPage;
