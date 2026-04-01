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
import { useProducts } from "@/hooks/useProducts";

// Category metadata
const categoryData: Record<string, { title: string; subtitle: string }> = {
  "protein-bars": {
    title: "Protein Bars",
    subtitle: "Power-packed nutrition bars with 20g+ protein for your active lifestyle",
  },
  "multigrain": {
    title: "Multigrain Snacks",
    subtitle: "Wholesome snacks made with 7+ ancient grains for guilt-free munching",
  },
  "healthy-foods": {
    title: "Healthy Foods",
    subtitle: "Nutrient-rich superfoods sourced from Indian farms",
  },
  "combos": {
    title: "Value Combos",
    subtitle: "Curated bundles for maximum savings and variety",
  },
};

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("popularity");

  const category = categoryData[slug || "protein-bars"] || categoryData["protein-bars"];

  const { data, isLoading, error } = useProducts({
    category_slug: slug || undefined,
    limit: 100,
  });
  let products = data?.items ?? [];

  // Apply sorting
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

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
              {sortedProducts.length} products
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
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-square animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : error ? (
            <p className="py-8 text-center font-body text-muted-foreground">Unable to load products. Please try again later.</p>
          ) : viewMode === "grid" ? (
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
              {sortedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <ProductCard {...product} />
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
              {sortedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <ProductListCard {...product} />
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
