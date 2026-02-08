import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { allProducts, searchProducts, getProductsByCategory, getPopularProducts, categories } from "@/data/products";

const filterTags = [
  { label: "All", value: "all" },
  { label: "High Protein", value: "high-protein" },
  { label: "Multigrain", value: "multigrain" },
  { label: "Sugar Free", value: "sugar-free" },
  { label: "Gluten Free", value: "gluten-free" },
  { label: "Vegan", value: "vegan" },
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
  const categoryParam = searchParams.get("category") || "";
  const [localQuery, setLocalQuery] = useState(query);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeSort, setActiveSort] = useState("Relevance");
  const [showFilters, setShowFilters] = useState(false);

  // Sync local query with URL
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  // Get filtered products based on query or category
  const getFilteredProducts = () => {
    let products = allProducts;

    // Filter by category if specified
    if (categoryParam) {
      products = getProductsByCategory(categoryParam);
    }

    // Filter by search query
    if (query) {
      products = searchProducts(query);
    }

    // Apply additional tag filter
    if (activeFilter !== "all") {
      products = products.filter((product) => {
        const tagMatch = product.tag.toLowerCase().includes(activeFilter.replace("-", " "));
        const dietMatch = product.dietType?.toLowerCase().includes(activeFilter.replace("-", " "));
        return tagMatch || dietMatch;
      });
    }

    // Apply sorting
    switch (activeSort) {
      case "Price: Low to High":
        products = [...products].sort((a, b) => a.price - b.price);
        break;
      case "Price: High to Low":
        products = [...products].sort((a, b) => b.price - a.price);
        break;
      case "Rating":
        products = [...products].sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return products;
  };

  const filteredProducts = getFilteredProducts();
  const popularProducts = getPopularProducts();

  // Get category name for display
  const getCategoryName = () => {
    if (categoryParam) {
      const cat = categories.find((c) => c.slug === categoryParam);
      return cat?.name || categoryParam;
    }
    return null;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchParams({ q: localQuery });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setLocalQuery("");
    setSearchParams({});
  };

  const clearCategory = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("category");
    setSearchParams(newParams);
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

          {/* Results count and query/category */}
          <div className="text-center">
            {getCategoryName() && (
              <div className="mb-2 flex items-center justify-center gap-2">
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  {getCategoryName()}
                  <button onClick={clearCategory} className="ml-2 hover:text-primary">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </div>
            )}
            <p className="font-body text-muted-foreground">
              {query || categoryParam ? (
                <>
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {filteredProducts.length} results
                  </span>
                  {query && (
                    <>
                      {" "}for "<span className="font-semibold text-foreground">{query}</span>"
                    </>
                  )}
                </>
              ) : (
                <>
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {filteredProducts.length} products
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="sticky top-[73px] z-40 border-b border-border bg-background/95 py-3 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Filter Tags */}
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2">
                {filterTags.map((tag) => (
                  <Badge
                    key={tag.value}
                    variant={activeFilter === tag.value ? "default" : "outline"}
                    className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-1.5 font-body text-sm transition-all ${
                      activeFilter === tag.value
                        ? "bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50 hover:bg-primary/5"
                    }`}
                    onClick={() => setActiveFilter(tag.value)}
                  >
                    {tag.label}
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
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            /* No Results - Show suggestions and popular products */
            <div className="py-8">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mb-2 font-display text-xl font-bold text-foreground">
                  No exact matches found
                </h3>
                <p className="mb-6 font-body text-muted-foreground">
                  {query ? `We couldn't find products matching "${query}"` : "Try browsing our categories"}
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  <span className="font-body text-sm text-muted-foreground">
                    Browse categories:
                  </span>
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/search?category=${cat.slug}`}
                    >
                      <Badge
                        variant="outline"
                        className="cursor-pointer rounded-full border-primary/30 px-3 py-1 font-body text-sm hover:bg-primary hover:text-primary-foreground"
                      >
                        {cat.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Popular Products */}
              <div>
                <h3 className="mb-4 text-center font-display text-lg font-bold text-foreground">
                  Popular Products You Might Like
                </h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                  {popularProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
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
