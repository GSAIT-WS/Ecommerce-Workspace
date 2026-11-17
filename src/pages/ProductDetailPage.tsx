import { useState, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  ChevronLeft, 
  Plus, 
  Minus,
  Check,
  Leaf,
  Zap,
  Shield,
  Package,
  X,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { toast } from "@/components/ui/sonner";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/productImagePlaceholder";
import { resolveProductDescription } from "@/data/productDescriptions";
import { CrunchXDoodleBackground } from "@/components/doodles";
import { useAuth } from "@/context/AuthContext";
import { submitProductReview } from "@/services/productReviewApi";

function buildProductGallery(primary: string, gallery: string[] | undefined): string[] {
  const main = primary || PRODUCT_IMAGE_PLACEHOLDER;
  const rest = (gallery ?? []).filter((u) => u && u !== main);
  const out = [main, ...rest];
  while (out.length < 4) out.push(PRODUCT_IMAGE_PLACEHOLDER);
  return out.slice(0, 4);
}

// Extended product details (for PDP display)
const productDetails: Record<string, {
  subtitle: string;
  reviewCount: number;
  images: string[];
  tags: string[];
  description: string;
  highlights: string[];
  nutrition: {
    servingSize: string;
    calories: number;
    protein: string;
    carbs: string;
    fiber: string;
    sugar: string;
    fat: string;
    sodium: string;
    iron: string;
    calcium: string;
  };
  ingredients: string;
  dietInfo: {
    isVegan: boolean;
    isGlutenFree: boolean;
    isNutFree: boolean;
    isDairyFree: boolean;
  };
}> = {
  default: {
    subtitle: "High Protein | Low Sugar | Natural Ingredients",
    reviewCount: 2847,
    images: [PRODUCT_IMAGE_PLACEHOLDER, PRODUCT_IMAGE_PLACEHOLDER, PRODUCT_IMAGE_PLACEHOLDER, PRODUCT_IMAGE_PLACEHOLDER],
    tags: ["High Protein", "Multigrain", "No Added Sugar"],
    description: "Our Premium Multigrain Protein Bar is crafted with a blend of ancient Indian grains including ragi, jowar, and bajra. Each bar delivers 15g of plant-based protein, making it perfect for your active lifestyle. Made with natural jaggery and zero artificial sweeteners.",
    highlights: [
      "15g Plant-Based Protein",
      "Made with Ancient Indian Grains",
      "No Artificial Sweeteners",
      "Rich in Fiber & Iron",
      "Gluten-Free Formula"
    ],
    nutrition: {
      servingSize: "40g (1 bar)",
      calories: 180,
      protein: "15g",
      carbs: "18g",
      fiber: "4g",
      sugar: "3g",
      fat: "6g",
      sodium: "80mg",
      iron: "15%",
      calcium: "10%"
    },
    ingredients: "Rolled Oats, Whey Protein, Almonds, Dates, Jaggery, Ragi Flour, Jowar Flakes, Bajra Puffs, Coconut Oil, Chia Seeds, Flax Seeds, Natural Vanilla, Pink Salt.",
    dietInfo: {
      isVegan: false,
      isGlutenFree: true,
      isNutFree: false,
      isDairyFree: false
    }
  }
};

// Reviews and rating breakdown will be populated from backend data.
// When real review data is available, pass it via API and replace the empty arrays below.
const reviews: {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  helpful: number;
  verified: boolean;
}[] = [];

const ratingBreakdown: { stars: number; percentage: number }[] = [];

// ── You May Also Like ───────────────────────────────────────────────────────
const YouMayAlsoLike = ({ currentProductId }: { currentProductId: string }) => {
  const { data, isLoading } = useProducts({ limit: 4 });
  const suggestions = (data?.items ?? []).filter((p) => p.id !== currentProductId).slice(0, 4);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-16"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground md:text-2xl">
          You May Also Like
        </h2>
        <Link
          to="/search"
          className="font-body text-sm text-primary hover:underline underline-offset-2"
        >
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : suggestions.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {suggestions.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}
    </motion.section>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewBody, setReviewBody] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // ── Bulk Order State ────────────────────────────────────────────────────
  const bulkSectionRef = useRef<HTMLDivElement>(null);
  const [bulkQty, setBulkQty] = useState<string>("");
  const [bulkError, setBulkError] = useState<string>("");

  const { data: baseProduct, isLoading, error } = useProduct(id);
  const details = productDetails.default;

  const product = baseProduct
    ? {
        ...baseProduct,
        ...details,
        description: resolveProductDescription(baseProduct.name),
        images: buildProductGallery(baseProduct.image, baseProduct.galleryImages),
        tags: [baseProduct.tag, ...details.tags.slice(1)],
      }
    : null;

  const discount = product
    ? (product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0)
    : 0;

  // Deletion-period products are fully hidden — treat as not found.
  const isNotFound = !isLoading && (!baseProduct || baseProduct.isInDeletionPeriod);

  if (isLoading || isNotFound || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6 md:py-10">
          {isLoading ? (
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="aspect-square animate-pulse rounded-3xl bg-muted" />
              <div className="space-y-4">
                <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                <div className="h-12 w-24 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ) : isNotFound || error ? (
            <div className="py-16 text-center">
              <p className="font-body text-muted-foreground">Product not found or unable to load.</p>
              <Link to="/" className="mt-4 inline-block font-body text-primary hover:underline">
                Back to Home
              </Link>
            </div>
          ) : null}
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        tag: product.tag,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
      },
      quantity
    );
    toast.success(`Added ${quantity} item(s) to cart ✓`);
  };

  const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error("Sign in to submit a review.");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (reviewRating < 1 || reviewRating > 5) {
      toast.error("Choose a rating from 1 to 5 stars.");
      return;
    }
    if (reviewBody.trim().length < 3) {
      toast.error("Write at least 3 characters in your review.");
      return;
    }

    setReviewSubmitting(true);
    try {
      await submitProductReview({
        customerId: user.id,
        productId: product.id,
        rating: reviewRating,
        body: reviewBody,
      });
      setReviewOpen(false);
      setReviewRating(0);
      setReviewBody("");
      toast.success("Your review was submitted and is awaiting approval.");
    } catch (reviewError) {
      toast.error(
        reviewError instanceof Error
          ? reviewError.message
          : "Unable to submit your review. Please try again."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  // ── Bulk helpers ─────────────────────────────────────────────────────────
  const handleBulkQtyChange = (val: string) => {
    setBulkQty(val);
    const n = parseInt(val, 10);
    if (val && (isNaN(n) || n < 25)) {
      setBulkError("Minimum bulk order is 25 units.");
    } else {
      setBulkError("");
    }
  };

  const handleBulkAddToCart = () => {
    const n = parseInt(bulkQty, 10);
    if (isNaN(n) || n < 25) { setBulkError("Minimum bulk order is 25 units."); return; }
    addToCart(
      {
        id: product.id,
        name: product.name,
        tag: product.tag,
        price: product.price,
        originalPrice: product.price,
        image: product.image,
      },
      n
    );
    toast.success(`Bulk order of ${n} units added to cart ✓`);
  };

  const scrollToBulk = () => {
    bulkSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };



  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 z-0 min-h-full">
        <CrunchXDoodleBackground variant="product" className="h-full min-h-screen w-full" />
      </div>
      <div className="relative z-[1]">
      <Navbar />

      <main className="container mx-auto px-4 py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronLeft className="h-4 w-4 rotate-180" />
          <Link to="/category/protein-bars" className="hover:text-primary transition-colors">Protein Bars</Link>
          <ChevronLeft className="h-4 w-4 rotate-180" />
          <span className="min-w-0 break-words text-foreground">{product.name}</span>
        </nav>

        {/* Unavailable Banner */}
        {!product.isActive && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-800 dark:bg-amber-950/40"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-body font-semibold text-amber-800 dark:text-amber-300">
                This product is unavailable temporarily
              </p>
              <p className="font-body text-sm text-amber-700 dark:text-amber-400">
                Our team is working on restocking this item. Check back soon or explore similar products below.
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={product.images[selectedImage]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`h-full w-full object-cover ${!product.isActive ? "opacity-40 grayscale" : ""}`}
                />
              </AnimatePresence>
              {!product.isActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="rounded-full bg-amber-500/90 px-5 py-2 font-body text-sm font-bold uppercase tracking-widest text-white shadow-lg">
                    Temporarily Unavailable
                  </span>
                </div>
              )}
              {product.isActive && discount > 0 && (
                <Badge className="absolute left-4 top-4 rounded-full bg-secondary px-3 py-1 font-body text-sm font-semibold text-secondary-foreground">
                  {discount}% OFF
                </Badge>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImage === index 
                      ? "border-primary ring-2 ring-primary/20" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="rounded-full border-secondary bg-secondary/10 px-3 py-1 font-body text-xs text-secondary-foreground"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Title & Rating */}
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                {product.name}
              </h1>
              <p className="mt-1 font-body text-muted-foreground">{product.subtitle}</p>
              
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? "fill-primary text-primary"
                          : "fill-muted text-muted-foreground/25"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-body text-sm font-medium text-foreground">
                  {product.rating}
                </span>
                {reviews.length > 0 && (
                  <span className="font-body text-sm text-muted-foreground">
                    ({reviews.length.toLocaleString()} reviews)
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl font-bold text-foreground">
                  ₹{product.price}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="font-body text-lg text-muted-foreground line-through">
                      ₹{product.originalPrice}
                    </span>
                    <Badge className="rounded-full bg-primary/10 px-2 py-0.5 font-body text-sm font-semibold text-primary">
                      Save ₹{product.originalPrice - product.price}
                    </Badge>
                  </>
                )}
              </div>
              {/* Bulk Order Link */}
              <button
                onClick={scrollToBulk}
                className="group flex items-center gap-1.5 font-body text-sm text-primary transition-all hover:text-primary/80"
              >
                <Package className="h-4 w-4" />
                <span className="underline underline-offset-2 group-hover:no-underline">
                  Looking to buy in bulk?
                </span>
              </button>
            </div>

            {/* Description */}
            <p className="font-body leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {/* Highlights */}
            <div className="space-y-3">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
                Key Benefits
              </h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {product.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-center gap-2 font-body text-sm text-foreground">
                    <Check className="h-4 w-4 text-secondary" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <div className={`flex items-center gap-3 rounded-full border border-border bg-card px-2 py-1 ${!product.isActive ? "opacity-40 pointer-events-none" : ""}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-full"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!product.isActive}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-body font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-full"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={!product.isActive}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button 
                className="flex-1 rounded-full bg-primary px-8 py-6 font-body text-base font-semibold text-primary-foreground hover:bg-primary/90 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddToCart}
                disabled={!product.isActive}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>

              <Button
                className="flex-1 rounded-full bg-brand-gold bg-none px-8 py-6 font-display text-base font-bold text-brand-deep opacity-60 shadow-md shadow-brand-gold/25 sm:flex-none disabled:cursor-not-allowed"
                disabled
              >
                Buy Now
              </Button>

              <Button
                variant="outline"
                size="icon"
                className={`h-12 w-12 rounded-full ${isWishlisted ? "border-red-500 text-red-500" : ""}`}
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500" : ""}`} />
              </Button>

              <Button variant="outline" size="icon" className="h-12 w-12 rounded-full">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <p
              role="status"
              className="mt-4 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-destructive/80"
            >
              Currently not accepting orders.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 border-t border-border pt-6">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                  <Leaf className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-body text-xs font-semibold text-foreground">100% Natural</p>
                  <p className="font-body text-xs text-muted-foreground">No preservatives</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-body text-xs font-semibold text-foreground">Fast Delivery</p>
                  <p className="font-body text-xs text-muted-foreground">Within 2-3 days</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                  <Shield className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-body text-xs font-semibold text-foreground">Quality Assured</p>
                  <p className="font-body text-xs text-muted-foreground">FSSAI certified</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <Tabs defaultValue="nutrition" className="w-full">
            <TabsList className="h-auto w-full justify-start gap-2 rounded-none border-b border-border bg-transparent p-0">
              <TabsTrigger 
                value="nutrition" 
                className="rounded-none border-b-2 border-transparent px-6 py-3 font-body font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Nutrition
              </TabsTrigger>
              <TabsTrigger 
                value="ingredients"
                className="rounded-none border-b-2 border-transparent px-6 py-3 font-body font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Ingredients
              </TabsTrigger>
              <TabsTrigger 
                value="reviews"
                className="rounded-none border-b-2 border-transparent px-6 py-3 font-body font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Reviews{reviews.length > 0 ? ` (${reviews.length.toLocaleString()})` : ""}
              </TabsTrigger>
            </TabsList>

            {/* Nutrition Tab */}
            <TabsContent value="nutrition" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
                    Nutrition Facts
                  </h3>
                  <p className="mb-4 font-body text-sm text-muted-foreground">
                    Serving Size: {product.nutrition.servingSize}
                  </p>
                  <div className="space-y-3">
                    {[
                      { label: "Calories", value: product.nutrition.calories, unit: "kcal" },
                      { label: "Protein", value: product.nutrition.protein },
                      { label: "Carbohydrates", value: product.nutrition.carbs },
                      { label: "Dietary Fiber", value: product.nutrition.fiber },
                      { label: "Sugar", value: product.nutrition.sugar },
                      { label: "Total Fat", value: product.nutrition.fat },
                      { label: "Sodium", value: product.nutrition.sodium }
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between border-b border-border pb-2 last:border-0">
                        <span className="font-body text-sm text-muted-foreground">{item.label}</span>
                        <span className="font-body text-sm font-semibold text-foreground">
                          {item.value}{item.unit || ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
                      Daily Value %
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="mb-1 flex justify-between font-body text-sm">
                          <span>Iron</span>
                          <span className="font-semibold">{product.nutrition.iron}</span>
                        </div>
                        <Progress value={15} className="h-2" />
                      </div>
                      <div>
                        <div className="mb-1 flex justify-between font-body text-sm">
                          <span>Calcium</span>
                          <span className="font-semibold">{product.nutrition.calcium}</span>
                        </div>
                        <Progress value={10} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
                      Dietary Info
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.dietInfo.isGlutenFree && (
                        <Badge className="rounded-full bg-secondary/10 px-3 py-1 font-body text-secondary-foreground">
                          Gluten-Free
                        </Badge>
                      )}
                      {product.dietInfo.isVegan && (
                        <Badge className="rounded-full bg-secondary/10 px-3 py-1 font-body text-secondary-foreground">
                          Vegan
                        </Badge>
                      )}
                      {!product.dietInfo.isVegan && (
                        <Badge className="rounded-full bg-primary/10 px-3 py-1 font-body text-primary">
                          Vegetarian
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Ingredients Tab */}
            <TabsContent value="ingredients" className="mt-6">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
                  Full Ingredients List
                </h3>
                <p className="font-body leading-relaxed text-muted-foreground">
                  {product.ingredients}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
                    <Check className="h-4 w-4 text-secondary" />
                    <span className="font-body text-sm">No Artificial Colors</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
                    <Check className="h-4 w-4 text-secondary" />
                    <span className="font-body text-sm">No Preservatives</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
                    <Check className="h-4 w-4 text-secondary" />
                    <span className="font-body text-sm">No Trans Fat</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-6">
              {reviews.length > 0 ? (
                <div className="grid gap-8 lg:grid-cols-3">
                  {/* Rating Summary — only shown when real review data exists */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="mb-4 text-center">
                      <div className="font-display text-5xl font-bold text-foreground">
                        {product.rating}
                      </div>
                      <div className="mt-2 flex justify-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(product.rating)
                                ? "fill-primary text-primary"
                                : "fill-muted text-muted-foreground/25"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-2 font-body text-sm text-muted-foreground">
                        Based on {reviews.length.toLocaleString()} reviews
                      </p>
                    </div>

                    {ratingBreakdown.length > 0 && (
                      <div className="space-y-2">
                        {ratingBreakdown.map((item) => (
                          <div key={item.stars} className="flex items-center gap-3">
                            <span className="w-3 font-body text-sm text-muted-foreground">
                              {item.stars}
                            </span>
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            <Progress value={item.percentage} className="h-2 flex-1" />
                            <span className="w-10 text-right font-body text-sm text-muted-foreground">
                              {item.percentage}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      className="mt-6 w-full rounded-full"
                      variant="outline"
                      onClick={() => setReviewOpen(true)}
                    >
                      Write a Review
                    </Button>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-4 lg:col-span-2">
                    {reviews.map((review) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-border bg-card p-6"
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-body font-semibold text-primary">
                              {review.avatar}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-body font-semibold text-foreground">
                                  {review.name}
                                </span>
                                {review.verified && (
                                  <Badge className="rounded bg-secondary/10 px-1.5 py-0.5 font-body text-xs text-secondary-foreground">
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <span className="font-body text-xs text-muted-foreground">
                                {review.date}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-primary text-primary"
                                    : "fill-muted text-muted-foreground/25"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <h4 className="mb-2 font-body font-semibold text-foreground">
                          {review.title}
                        </h4>
                        <p className="font-body text-sm leading-relaxed text-muted-foreground">
                          {review.content}
                        </p>
                        <div className="mt-4 flex items-center gap-4">
                          <Button variant="ghost" size="sm" className="h-8 font-body text-xs">
                            Helpful ({review.helpful})
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Empty state — shown until real reviews are connected from backend */
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-6 rounded-2xl border border-dashed border-border bg-muted/30 py-16 text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <MessageSquare className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-semibold text-foreground">
                      No reviews yet
                    </p>
                    <p className="mt-1 font-body text-sm text-muted-foreground">
                      Be the first to share your experience with this product.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-full px-8"
                    onClick={() => setReviewOpen(true)}
                  >
                    Write the First Review
                  </Button>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Bulk Order Section */}
        <motion.div
          ref={bulkSectionRef}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`mt-16 scroll-mt-24 rounded-3xl border border-border bg-card p-6 md:p-10 ${!product.isActive ? "opacity-50 pointer-events-none select-none" : ""}`}
        >
          {/* Section Header */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground md:text-2xl">
                  Want to purchase in bulk?
                </h2>
                <p className="font-body text-sm text-muted-foreground">Minimum order: 25 units</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 md:gap-10">
            {/* Add quantity */}
            <div className="space-y-3">
              <label htmlFor="bulk-quantity" className="font-body text-sm font-semibold text-foreground">
                Add quantity
              </label>
              <div className="relative">
                <Input
                  id="bulk-quantity"
                  type="number"
                  min={25}
                  placeholder="Min. 25 units"
                  value={bulkQty}
                  onChange={(e) => handleBulkQtyChange(e.target.value)}
                  className={`h-12 rounded-xl font-body text-base pr-16 ${bulkError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {bulkQty && !bulkError && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-body text-sm text-muted-foreground">
                    units
                  </span>
                )}
              </div>
              {bulkError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 font-body text-sm text-destructive"
                >
                  <X className="h-3.5 w-3.5" /> {bulkError}
                </motion.p>
              )}
              <Button
                className="w-full rounded-xl bg-primary py-6 font-body text-base font-semibold text-primary-foreground hover:bg-primary/90"
                onClick={handleBulkAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add Bulk to Cart
              </Button>
            </div>

            {/* Contact us */}
            <div className="rounded-2xl border border-border bg-background p-5">
              <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-foreground">
                Contact us
              </h3>
              <p className="mb-4 font-body text-sm text-muted-foreground">
                Have a bulk requirement? Reach out with your email or phone number.
              </p>
              <div className="space-y-3">
                <a
                  href="mailto:admin@purvita.in"
                  className="block font-body text-sm font-semibold text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
                >
                  admin@purvita.in
                </a>
                <a
                  href="tel:+917842245679"
                  className="block font-body text-sm font-semibold text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
                >
                  7842245679
                </a>
              </div>
            </div>
          </div>
        </motion.div>


        {/* You May Also Like */}
        <YouMayAlsoLike currentProductId={product.id} />
      </main>

      <Footer />
      </div>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Write a Review</DialogTitle>
            <DialogDescription className="font-body text-sm text-muted-foreground">
              Share your experience with {product.name}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
            <fieldset className="space-y-2">
              <legend className="font-body text-sm font-medium text-foreground">
                Your rating *
              </legend>
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, index) => {
                  const rating = index + 1;
                  return (
                    <button
                      key={rating}
                      type="button"
                      aria-label={`${rating} ${rating === 1 ? "star" : "stars"}`}
                      aria-pressed={reviewRating === rating}
                      onClick={() => setReviewRating(rating)}
                      className="flex h-11 w-11 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          rating <= reviewRating
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="space-y-1.5">
              <label htmlFor="review-body" className="font-body text-sm font-medium text-foreground">
                Your review *
              </label>
              <textarea
                id="review-body"
                required
                minLength={3}
                maxLength={2000}
                rows={5}
                value={reviewBody}
                onChange={(e) => setReviewBody(e.target.value)}
                placeholder="What did you think of this product?"
                className="w-full resize-y rounded-xl border border-input bg-background px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <Button
              type="submit"
              disabled={reviewSubmitting}
              className="w-full rounded-xl py-5 font-body text-base font-semibold"
            >
              {reviewSubmitting ? "Submitting…" : "Submit Review"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetailPage;
