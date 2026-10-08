import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { toast } from "@/components/ui/sonner";

interface ProductListCardProps {
  id?: string;
  name: string;
  tag: string;
  price: number;
  originalPrice?: number;
  rating: number;
  image: string;
  protein?: string;
  calories?: number | string;
  dietType?: string;
  packType?: string;
}

const ProductListCard = ({
  id = "1",
  name,
  tag,
  price,
  originalPrice,
  rating,
  image,
  protein = "12g",
  calories = 180,
  dietType = "Vegetarian",
  packType = "Single",
}: ProductListCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ id, name, tag, price, originalPrice, image });
    toast.success("Added to cart ✓");
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ id, name, tag, price, originalPrice, image });
    navigate("/checkout");
  };

  return (
    <Link 
      to={`/product/${id}`}
      className="card-interactive group flex gap-4 overflow-hidden rounded-2xl border border-border/80 bg-card p-4 shadow-card md:gap-6 md:p-5"
    >
      {/* Product Image */}
      <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-inset ring-border/50 md:h-36 md:w-36">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-smooth group-hover:scale-[1.07]"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent"
          aria-hidden
        />
        <Badge className="absolute left-2 top-2 rounded-full bg-secondary/95 font-semibold text-secondary-foreground shadow-sm">
          {tag}
        </Badge>
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="mb-1.5 font-display text-base font-bold tracking-[-0.02em] text-foreground transition-colors duration-300 group-hover:text-primary md:text-lg">
            {name}
          </h3>
          
          {/* Rating */}
          <div className="mb-2 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(rating)
                    ? "fill-primary text-primary"
                    : "fill-muted text-muted-foreground/25"
                }`}
              />
            ))}
            <span className="ml-1 font-body text-xs text-muted-foreground">
              {rating.toFixed(1)}
            </span>
          </div>

          {/* Nutrition Info Grid */}
          <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1 md:grid-cols-4">
            <div className="font-body text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Protein:</span> {protein}
            </div>
            <div className="font-body text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Calories:</span> {typeof calories === 'number' ? `${calories} kcal` : calories}
            </div>
            <div className="font-body text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Diet:</span> {dietType}
            </div>
            <div className="font-body text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Pack:</span> {packType}
            </div>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-xl font-extrabold tracking-tight text-foreground text-glow-gold">
              ₹{price}
            </span>
            {originalPrice && (
              <span className="font-body text-sm text-muted-foreground line-through">
                ₹{originalPrice}
              </span>
            )}
            {originalPrice && (
              <span className="meta-chip bg-primary/12 text-primary">
                {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className={`rounded-full px-4 transition-all duration-200 ${added ? "bg-secondary hover:bg-secondary" : ""}`}
              onClick={handleAddToCart}
            >
              {added ? (
                <>
                  <Check className="mr-1.5 h-4 w-4 animate-[bounce_0.4s_ease-out]" />
                  <span className="text-sm">Added ✓</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-1.5 h-4 w-4" />
                  <span className="text-sm">Add</span>
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full px-4"
              onClick={handleBuyNow}
            >
              <span className="text-sm">Buy</span>
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductListCard;
