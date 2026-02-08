import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Import product images
import productProteinBar from "@/assets/product-protein-bar.jpg";
import productMultigrainSnack from "@/assets/product-multigrain-snack.jpg";
import productChikki from "@/assets/product-chikki.jpg";
import productCombo from "@/assets/product-combo.jpg";
import productMilletBar from "@/assets/product-millet-bar.jpg";
import productHealthyMix from "@/assets/product-healthy-mix.jpg";
import productShilajitBar from "@/assets/product-shilajit-bar.jpg";

const allProducts = [
  {
    name: "Peanut Butter Protein Bar",
    tag: "High Protein",
    price: 149,
    originalPrice: 199,
    rating: 4.8,
    image: productProteinBar,
  },
  {
    name: "Multigrain Millet Crunch",
    tag: "Multigrain",
    price: 129,
    originalPrice: 179,
    rating: 4.6,
    image: productMultigrainSnack,
  },
  {
    name: "Traditional Groundnut Chikki",
    tag: "No Sugar",
    price: 99,
    rating: 4.5,
    image: productChikki,
  },
  {
    name: "Healthy Snack Combo Pack",
    tag: "Best Value",
    price: 449,
    originalPrice: 599,
    rating: 4.9,
    image: productCombo,
  },
  {
    name: "Ragi Millet Energy Bar",
    tag: "High Fiber",
    price: 139,
    rating: 4.7,
    image: productMilletBar,
  },
  {
    name: "Mixed Nuts & Seeds Trail Mix",
    tag: "Healthy",
    price: 249,
    originalPrice: 299,
    rating: 4.4,
    image: productHealthyMix,
  },
  {
    name: "Shilajit Power Bar",
    tag: "Energy Boost",
    price: 199,
    originalPrice: 249,
    rating: 4.8,
    image: productShilajitBar,
  },
  {
    name: "Quinoa Crunch Bites",
    tag: "Gluten Free",
    price: 179,
    rating: 4.6,
    image: productMultigrainSnack,
  },
  {
    name: "Oats & Honey Bar",
    tag: "Breakfast",
    price: 119,
    originalPrice: 149,
    rating: 4.5,
    image: productProteinBar,
  },
  {
    name: "Amaranth Ladoo",
    tag: "Traditional",
    price: 159,
    rating: 4.7,
    image: productChikki,
  },
  {
    name: "Jowar Puffs",
    tag: "Light Snack",
    price: 89,
    rating: 4.3,
    image: productMilletBar,
  },
  {
    name: "Super Seeds Mix",
    tag: "Omega Rich",
    price: 299,
    originalPrice: 349,
    rating: 4.8,
    image: productHealthyMix,
  },
];

const filterTags = [
  "All",
  "High Protein",
  "Multigrain",
  "Sugar Free",
  "Gluten Free",
  "Vegan",
];

const sortOptions = [
  "Relevance",
  "Price: Low to High",
  "Price: High to Low",
  "Rating",
  "Newest",
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [localQuery, setLocalQuery] = useState(query);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeSort, setActiveSort] = useState("Relevance");
  const [showFilters, setShowFilters] = useState(false);

  // Filter products based on query (dummy filtering)
  const filteredProducts = allProducts.filter((product) => {
    const matchesQuery =
      !query ||
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.tag.toLowerCase().includes(query.toLowerCase());
    const matchesFilter =
      activeFilter === "All" ||
      product.tag.toLowerCase().includes(activeFilter.toLowerCase());
    return matchesQuery && matchesFilter;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchParams({ q: localQuery });
    }
  };

  const clearSearch = () => {
    setLocalQuery("");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Search Header */}
      <section className="border-b border-border bg-card py-6">
        <div className="container mx-auto px-4 md:px-8">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative mx-auto max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Search for multigrain snacks, protein bars…"
                className="h-12 rounded-full border-2 border-primary/30 bg-background pl-12 pr-12 font-body text-base focus-visible:border-primary"
              />
              {localQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </form>

          {/* Results count and query */}
          {query && (
            <div className="text-center">
              <p className="font-body text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {filteredProducts.length} results
                </span>{" "}
                for "
                <span className="font-semibold text-foreground">{query}</span>"
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Filters Bar */}
      <section className="sticky top-[73px] z-40 border-b border-border bg-background/95 py-3 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Filter Tags - Scrollable on mobile */}
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2">
                {filterTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={activeFilter === tag ? "default" : "outline"}
                    className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-1.5 font-body text-sm transition-all ${
                      activeFilter === tag
                        ? "bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50 hover:bg-primary/5"
                    }`}
                    onClick={() => setActiveFilter(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Sort & Filter Button */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-full border-border font-body"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
            </div>
          </div>

          {/* Expanded Filters Panel */}
          {showFilters && (
            <div className="mt-4 rounded-xl border border-border bg-card p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Sort By */}
                <div>
                  <h4 className="mb-2 font-body text-sm font-semibold text-foreground">
                    Sort By
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {sortOptions.map((option) => (
                      <Badge
                        key={option}
                        variant={activeSort === option ? "default" : "outline"}
                        className={`cursor-pointer rounded-full px-3 py-1 font-body text-xs transition-all ${
                          activeSort === option
                            ? "bg-secondary text-secondary-foreground"
                            : "border-border hover:border-secondary/50"
                        }`}
                        onClick={() => setActiveSort(option)}
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Price Range (UI only) */}
                <div>
                  <h4 className="mb-2 font-body text-sm font-semibold text-foreground">
                    Price Range
                  </h4>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      className="h-9 w-24 rounded-lg font-body text-sm"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      className="h-9 w-24 rounded-lg font-body text-sm"
                    />
                  </div>
                </div>

                {/* Rating (UI only) */}
                <div>
                  <h4 className="mb-2 font-body text-sm font-semibold text-foreground">
                    Minimum Rating
                  </h4>
                  <div className="flex gap-2">
                    {[4, 3, 2].map((rating) => (
                      <Badge
                        key={rating}
                        variant="outline"
                        className="cursor-pointer rounded-full border-border px-3 py-1 font-body text-xs hover:border-accent/50 hover:bg-accent/10"
                      >
                        {rating}+ ⭐
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Search Results Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4 md:px-8">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredProducts.map((product, index) => (
                <ProductCard key={index} {...product} />
              ))}
            </div>
          ) : (
            /* No Results */
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-display text-xl font-bold text-foreground">
                No products found
              </h3>
              <p className="mb-6 font-body text-muted-foreground">
                We couldn't find any products matching "{query}"
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="font-body text-sm text-muted-foreground">
                  Try searching for:
                </span>
                {["Protein bars", "Multigrain", "Healthy snacks"].map(
                  (suggestion) => (
                    <Badge
                      key={suggestion}
                      variant="outline"
                      className="cursor-pointer rounded-full border-primary/30 px-3 py-1 font-body text-sm hover:bg-primary hover:text-primary-foreground"
                      onClick={() => {
                        setLocalQuery(suggestion);
                        setSearchParams({ q: suggestion });
                      }}
                    >
                      {suggestion}
                    </Badge>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SearchPage;
