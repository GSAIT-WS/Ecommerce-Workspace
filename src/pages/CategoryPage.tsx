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
  const products = data?.items ?? [];

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
      <section className="relative overflow-hidden bg-gradient-to-b from-surface-subtle/60 to-background px-4 pb-10 pt-24 md:pb-12 md:pt-28">
        {/* Warm halo behind the heading */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,hsl(var(--primary)/0.14),transparent_62%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="eyebrow eyebrow-centered mb-3"
          >
            Shop
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-title"
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
      <div className="sticky top-[61px] z-30 border-b border-border/70 bg-background/90 shadow-[0_8px_20px_-16px_hsl(var(--foreground)/0.4)] backdrop-blur-xl md:top-[94px]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3">
          {/* Left: Filter Button & Results Count */}
          <div className="flex shrink-0 items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterOpen(true)}
              className="gap-2 rounded-full font-body"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
            <span className="meta-chip">
              {sortedProducts.length} products
            </span>
          </div>

          {/* Right: Sort & View Toggle */}
          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[120px] rounded-full font-body text-sm sm:w-[140px] md:w-[180px]">
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
            <div className="flex rounded-full border border-border/80 bg-muted/60 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-full p-1.5 transition-all duration-300 ease-smooth ${
                  viewMode === "grid"
                    ? "bg-card text-primary shadow-sm ring-1 ring-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-full p-1.5 transition-all duration-300 ease-smooth ${
                  viewMode === "list"
                    ? "bg-card text-primary shadow-sm ring-1 ring-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
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
          <div className="mt-10 flex justify-center">
            <Button
              variant="outline"
              size="lg"
              className="group gap-2 rounded-full px-8 font-body shadow-sm hover:shadow-glow-sm"
            >
              Load More Products
              <ChevronDown className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:translate-y-0.5" />
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
