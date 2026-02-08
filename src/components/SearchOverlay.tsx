import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const suggestedProducts = [
  { name: "Protein Bar - Peanut Butter", category: "Protein Bars" },
  { name: "Protein Crunch Bites", category: "Protein Bars" },
  { name: "Multigrain Millet Cookies", category: "Multigrain Snacks" },
  { name: "Quinoa Energy Balls", category: "Healthy Foods" },
  { name: "Ragi Protein Ladoo", category: "Healthy Foods" },
  { name: "Oats & Honey Bar", category: "Protein Bars" },
];

const categories = [
  { name: "Protein Bars", count: 24 },
  { name: "Multigrain Snacks", count: 18 },
  { name: "Healthy Foods", count: 32 },
  { name: "Combos & Value Packs", count: 12 },
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
  "Millet snacks",
  "Protein bars",
  "Sugar free",
  "Healthy breakfast",
  "Ragi cookies",
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Container */}
      <div className="relative z-10 bg-background">
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
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Dropdown Panel */}
        <div className="max-h-[calc(100vh-100px)] overflow-y-auto border-t border-border bg-card shadow-xl">
          <div className="container mx-auto px-4 py-6 md:px-8">
            {/* When typing - show filtered results */}
            {query.length > 0 ? (
              <div className="space-y-6">
                {/* Suggested Products */}
                {filteredProducts.length > 0 && (
                  <div>
                    <h3 className="mb-3 font-body text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Suggested Products
                    </h3>
                    <div className="space-y-1">
                      {filteredProducts.map((product, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(product.name)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted"
                        >
                          <div className="flex items-center gap-3">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <span className="font-body text-foreground">
                              {product.name}
                            </span>
                          </div>
                          <span className="font-body text-xs text-muted-foreground">
                            {product.category}
                          </span>
                        </button>
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
                        <button
                          key={index}
                          onClick={() => handleSearch(cat.name)}
                          className="flex items-center justify-between rounded-xl border border-border bg-background p-3 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                        >
                          <span className="font-body text-sm font-medium text-foreground">
                            {cat.name}
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </button>
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
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer rounded-full border-primary/30 px-4 py-1.5 font-body text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                          onClick={() => handleSearch(keyword)}
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* No results */}
                {filteredProducts.length === 0 &&
                  filteredCategories.length === 0 &&
                  filteredKeywords.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="font-body text-muted-foreground">
                        No suggestions found for "{query}"
                      </p>
                      <button
                        onClick={() => handleSearch(query)}
                        className="mt-2 font-body text-primary hover:underline"
                      >
                        Search for "{query}" anyway
                      </button>
                    </div>
                  )}
              </div>
            ) : (
              /* Default state - no query */
              <div className="space-y-8">
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
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer rounded-full px-4 py-1.5 font-body text-sm transition-colors hover:bg-secondary/80"
                          onClick={() => handleSearch(search)}
                        >
                          {search}
                        </Badge>
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
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer rounded-full border-accent/50 bg-accent/10 px-4 py-1.5 font-body text-sm text-foreground transition-colors hover:bg-accent/20"
                        onClick={() => handleSearch(search)}
                      >
                        🔥 {search}
                      </Badge>
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
                      <button
                        key={index}
                        onClick={() => handleSearch(cat.name)}
                        className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-background p-4 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                      >
                        <span className="font-body text-sm font-semibold text-foreground">
                          {cat.name}
                        </span>
                        <span className="font-body text-xs text-muted-foreground">
                          {cat.count} products
                        </span>
                      </button>
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
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer rounded-full border-primary/30 px-4 py-2 font-body text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleSearch(keyword)}
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
