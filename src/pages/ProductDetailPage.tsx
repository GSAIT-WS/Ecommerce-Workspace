import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { allProducts } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { toast } from "@/components/ui/sonner";

// Import product images for gallery
import productProteinBar from "@/assets/product-protein-bar.jpg";
import productMilletBar from "@/assets/product-millet-bar.jpg";
import productHealthyMix from "@/assets/product-healthy-mix.jpg";
import productChikki from "@/assets/product-chikki.jpg";

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
    images: [productProteinBar, productMilletBar, productHealthyMix, productChikki],
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

const reviews = [
  {
    id: 1,
    name: "Priya Sharma",
    avatar: "PS",
    rating: 5,
    date: "2 weeks ago",
    title: "Best protein bar I've ever had!",
    content: "Finally a protein bar that doesn't taste like cardboard! The multigrain texture is amazing and it keeps me full for hours. Perfect for my morning gym sessions.",
    helpful: 124,
    verified: true
  },
  {
    id: 2,
    name: "Rahul Verma",
    avatar: "RV",
    rating: 4,
    date: "1 month ago",
    title: "Great taste, good nutrition",
    content: "Love the fact that it uses traditional Indian grains. The jaggery sweetness is just right - not too sweet. Would love to see more flavors!",
    helpful: 89,
    verified: true
  },
  {
    id: 3,
    name: "Anjali Patel",
    avatar: "AP",
    rating: 5,
    date: "1 month ago",
    title: "Perfect snack for busy professionals",
    content: "I keep these in my office drawer for those mid-afternoon hunger pangs. Healthy, filling, and delicious. The no added sugar aspect is a huge plus for me.",
    helpful: 67,
    verified: true
  },
  {
    id: 4,
    name: "Vikram Singh",
    avatar: "VS",
    rating: 4,
    date: "2 months ago",
    title: "Solid protein source",
    content: "Good macros for the price. The texture is a bit dense but I actually prefer it that way. Feels more substantial than other bars.",
    helpful: 45,
    verified: false
  }
];

const ratingBreakdown = [
  { stars: 5, percentage: 72 },
  { stars: 4, percentage: 18 },
  { stars: 3, percentage: 6 },
  { stars: 2, percentage: 3 },
  { stars: 1, percentage: 1 }
];

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Find product from shared data
  const baseProduct = allProducts.find((p) => p.id === id) || allProducts[0];
  const details = productDetails.default;
  
  // Combine base product with extended details
  const product = {
    ...baseProduct,
    ...details,
    images: [baseProduct.image, productMilletBar, productHealthyMix, productChikki],
    tags: [baseProduct.tag, ...details.tags.slice(1)],
  };

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart({ 
      id: product.id, 
      name: product.name, 
      tag: product.tag, 
      price: product.price, 
      originalPrice: product.originalPrice, 
      image: product.image 
    });
    toast.success(`Added ${quantity} item(s) to cart ✓`);
  };

  const handleBuyNow = () => {
    addToCart({ 
      id: product.id, 
      name: product.name, 
      tag: product.tag, 
      price: product.price, 
      originalPrice: product.originalPrice, 
      image: product.image 
    });
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 font-body text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronLeft className="h-4 w-4 rotate-180" />
          <Link to="/category/protein-bars" className="hover:text-primary transition-colors">Protein Bars</Link>
          <ChevronLeft className="h-4 w-4 rotate-180" />
          <span className="text-foreground">{product.name}</span>
        </nav>

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
                  className="h-full w-full object-cover"
                />
              </AnimatePresence>
              <Badge className="absolute left-4 top-4 rounded-full bg-secondary px-3 py-1 font-body text-sm font-semibold text-secondary-foreground">
                {discount}% OFF
              </Badge>
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
                          ? "fill-accent text-accent"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-body text-sm font-medium text-foreground">
                  {product.rating}
                </span>
                <span className="font-body text-sm text-muted-foreground">
                  ({product.reviewCount.toLocaleString()} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl font-bold text-foreground">
                ₹{product.price}
              </span>
              <span className="font-body text-lg text-muted-foreground line-through">
                ₹{product.originalPrice}
              </span>
              <Badge className="rounded-full bg-primary/10 px-2 py-0.5 font-body text-sm font-semibold text-primary">
                Save ₹{product.originalPrice - product.price}
              </Badge>
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
              <div className="flex items-center gap-3 rounded-full border border-border bg-card px-2 py-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-body font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button 
                className="flex-1 rounded-full bg-primary px-8 py-6 font-body text-base font-semibold text-primary-foreground hover:bg-primary/90 sm:flex-none"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>

              <Button
                className="flex-1 rounded-full bg-secondary px-8 py-6 font-body text-base font-semibold text-secondary-foreground hover:bg-secondary/90 sm:flex-none"
                onClick={handleBuyNow}
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
                Reviews ({product.reviewCount.toLocaleString()})
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
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Rating Summary */}
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
                              ? "fill-accent text-accent"
                              : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-2 font-body text-sm text-muted-foreground">
                      Based on {product.reviewCount.toLocaleString()} reviews
                    </p>
                  </div>

                  <div className="space-y-2">
                    {ratingBreakdown.map((item) => (
                      <div key={item.stars} className="flex items-center gap-3">
                        <span className="w-3 font-body text-sm text-muted-foreground">
                          {item.stars}
                        </span>
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <Progress value={item.percentage} className="h-2 flex-1" />
                        <span className="w-10 text-right font-body text-sm text-muted-foreground">
                          {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button className="mt-6 w-full rounded-full" variant="outline">
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
                                  ? "fill-accent text-accent"
                                  : "fill-muted text-muted"
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

                  <Button variant="outline" className="w-full rounded-full">
                    Load More Reviews
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
