import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import proteinBarImg from "@/assets/product-protein-bar.jpg";
import multigainImg from "@/assets/product-multigrain-snack.jpg";
import chikkiImg from "@/assets/product-chikki.jpg";
// Category images
import categoryProteinImg from "@/assets/category-protein-bars.jpg";
import categoryMultigrainImg from "@/assets/category-multigrain.jpg";
import categoryHealthyImg from "@/assets/category-healthy-foods.jpg";
import categoryCombosImg from "@/assets/category-combos.jpg";
// Trending images
import trendingMilletImg from "@/assets/trending-millet.jpg";
import trendingSugarfreeImg from "@/assets/trending-sugarfree.jpg";
import trendingBreakfastImg from "@/assets/trending-breakfast.jpg";
import trendingRagiImg from "@/assets/trending-ragi.jpg";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const suggestedProducts = [
  { name: "Protein Bar - Peanut Butter", category: "Protein Bars", image: proteinBarImg },
  { name: "Protein Crunch Bites", category: "Protein Bars", image: proteinBarImg },
  { name: "Multigrain Millet Cookies", category: "Multigrain Snacks", image: multigainImg },
  { name: "Quinoa Energy Balls", category: "Healthy Foods", image: chikkiImg },
  { name: "Ragi Protein Ladoo", category: "Healthy Foods", image: chikkiImg },
  { name: "Oats & Honey Bar", category: "Protein Bars", image: proteinBarImg },
];

const categories = [
  { name: "Protein Bars", count: 24, image: categoryProteinImg },
  { name: "Multigrain Snacks", count: 18, image: categoryMultigrainImg },
  { name: "Healthy Foods", count: 32, image: categoryHealthyImg },
  { name: "Combos & Value Packs", count: 12, image: categoryCombosImg },
];

const healthKeywords = [
  "High Protein",
  "Sugar Free",
  "Multigrain",
  "Gluten Free",
  "No Preservatives",
  "Vegan",
];

const trendingSearches = [
  { name: "Millet snacks", image: trendingMilletImg },
  { name: "Protein bars", image: proteinBarImg },
  { name: "Sugar free", image: trendingSugarfreeImg },
  { name: "Healthy breakfast", image: trendingBreakfastImg },
  { name: "Ragi cookies", image: trendingRagiImg },
];

const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([
    "Peanut butter protein",
    "Multigrain cookies",
    "Healthy snacks combo",
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      if (!recentSearches.includes(searchTerm)) {
        setRecentSearches((prev) => [searchTerm, ...prev.slice(0, 4)]);
      }
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      onClose();
      setQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(query);
    }
  };

  const clearHistory = () => {
    setRecentSearches([]);
  };

  const filteredProducts = query
    ? suggestedProducts.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredCategories = query
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredKeywords = query
    ? healthKeywords.filter((k) =>
        k.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop - Soft fade dim */}
          <motion.div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Search Container - Slide down animation */}
          <motion.div
            className="relative z-10 bg-background"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="container mx-auto px-4 py-4 md:px-8">
              {/* Search Input Row */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search for multigrain snacks, protein bars…"
                    className="h-12 rounded-full border-2 border-primary/30 bg-card pl-12 pr-4 font-body text-base shadow-lg focus-visible:border-primary focus-visible:ring-primary/20 md:h-14 md:text-lg"
                  />
                </div>
                <motion.button
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </div>

            {/* Dropdown Panel - Staggered content animation */}
            <motion.div
              className="max-h-[calc(100vh-100px)] overflow-y-auto border-t border-border bg-card shadow-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <div className="container mx-auto px-4 py-6 md:px-8">
                {/* When typing - show filtered results */}
                {query.length > 0 ? (
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Suggested Products */}
                    {filteredProducts.length > 0 && (
                      <div>
                        <h3 className="mb-3 font-body text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                          Suggested Products
                        </h3>
                        <div className="space-y-1">
                          {filteredProducts.map((product, index) => (
                            <motion.button
                              key={index}
                              onClick={() => handleSearch(product.name)}
                              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                              whileHover={{ x: 4 }}
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-8 w-8 rounded-full object-cover shadow-sm"
                                />
                                <span className="font-body text-foreground">
                                  {product.name}
                                </span>
                              </div>
                              <span className="font-body text-xs text-muted-foreground">
                                {product.category}
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Categories */}
                    {filteredCategories.length > 0 && (
                      <div>
                        <h3 className="mb-3 font-body text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                          Categories
                        </h3>
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                          {filteredCategories.map((cat, index) => (
                            <motion.button
                              key={index}
                              onClick={() => handleSearch(cat.name)}
                              className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-all hover:border-primary/30 hover:shadow-md"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                              whileHover={{ y: -4 }}
                            >
                              <img
                                src={cat.image}
                                alt={cat.name}
                                className="h-10 w-10 rounded-full object-cover shadow-sm"
                              />
                              <span className="flex flex-col items-start gap-0.5">
                                <span className="font-body text-sm font-medium text-foreground">
                                  {cat.name}
                                </span>
                                <span className="font-body text-xs text-muted-foreground">
                                  {cat.count} products
                                </span>
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Health Keywords */}
                    {filteredKeywords.length > 0 && (
                      <div>
                        <h3 className="mb-3 font-body text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                          Health & Nutrition
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {filteredKeywords.map((keyword, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.15, delay: index * 0.03 }}
                            >
                              <Badge
                                variant="outline"
                                className="cursor-pointer rounded-full border-primary/30 px-4 py-1.5 font-body text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                                onClick={() => handleSearch(keyword)}
                              >
                                {keyword}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No results */}
                    {filteredProducts.length === 0 &&
                      filteredCategories.length === 0 &&
                      filteredKeywords.length === 0 && (
                        <motion.div
                          className="py-8 text-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p className="font-body text-muted-foreground">
                            No suggestions found for "{query}"
                          </p>
                          <button
                            onClick={() => handleSearch(query)}
                            className="mt-2 font-body text-primary hover:underline"
                          >
                            Search for "{query}" anyway
                          </button>
                        </motion.div>
                      )}
                  </motion.div>
                ) : (
                  /* Default state - no query */
                  <motion.div
                    className="space-y-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="flex items-center gap-2 font-body text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Recent Searches
                          </h3>
                          <button
                            onClick={clearHistory}
                            className="font-body text-xs text-primary hover:underline"
                          >
                            Clear history
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((search, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                            >
                              <Badge
                                variant="secondary"
                                className="cursor-pointer rounded-full px-4 py-1.5 font-body text-sm transition-colors hover:bg-secondary/80"
                                onClick={() => handleSearch(search)}
                              >
                                <Clock className="mr-1.5 h-3 w-3 opacity-50" />
                                {search}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trending Searches */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 font-body text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        Trending Now
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {trendingSearches.map((search, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                          >
                            <button
                              className="flex items-center gap-2 rounded-full border border-accent/50 bg-accent/10 px-3 py-1.5 font-body text-sm text-foreground transition-colors hover:bg-accent/20"
                              onClick={() => handleSearch(search.name)}
                            >
                              <img
                                src={search.image}
                                alt={search.name}
                                className="h-6 w-6 rounded-full object-cover"
                              />
                              {search.name}
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Popular Categories */}
                    <div>
                      <h3 className="mb-3 font-body text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Popular Categories
                      </h3>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {categories.map((cat, index) => (
                          <motion.button
                            key={index}
                            onClick={() => handleSearch(cat.name)}
                            className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-background p-4 transition-all hover:border-primary/30 hover:shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.07 }}
                            whileHover={{ y: -8 }}
                          >
                            <div className="h-16 w-16 overflow-hidden rounded-full shadow-md">
                              <img
                                src={cat.image}
                                alt={cat.name}
                                className="h-full w-full object-cover transition-transform group-hover:scale-110"
                              />
                            </div>
                            <span className="font-body text-sm font-semibold text-foreground text-center">
                              {cat.name}
                            </span>
                            <span className="font-body text-xs text-muted-foreground">
                              {cat.count} products
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Health Keywords */}
                    <div>
                      <h3 className="mb-3 font-body text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Shop by Health Goal
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {healthKeywords.map((keyword, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.15, delay: index * 0.04 }}
                          >
                            <Badge
                              variant="outline"
                              className="cursor-pointer rounded-full border-primary/30 px-4 py-2 font-body text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                              onClick={() => handleSearch(keyword)}
                            >
                              {keyword}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
