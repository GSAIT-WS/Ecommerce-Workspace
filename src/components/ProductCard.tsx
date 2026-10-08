import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, ShoppingCart, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { toast } from "@/components/ui/sonner";

interface ProductCardProps {
  id?: string;
  name: string;
  tag: string;
  price: number;
  originalPrice?: number;
  rating: number;
  image: string;
}

const ProductCard = ({ id = "1", name, tag, price, originalPrice, rating, image }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const discount =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

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
      className="card-interactive group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-smooth group-hover:scale-[1.07]"
        />
        {/* Legibility wash + hairline frame */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-t-2xl ring-1 ring-inset ring-white/10"
          aria-hidden
        />

        <Badge className="absolute left-3 top-3 rounded-full bg-secondary/95 font-semibold text-secondary-foreground shadow-sm backdrop-blur-sm">
          {tag}
        </Badge>

        {discount > 0 && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-accent to-primary px-2.5 py-1 font-body text-[11px] font-bold text-primary-foreground shadow-glow-sm ring-1 ring-inset ring-white/25">
            <Zap className="h-3 w-3" />
            {discount}% OFF
          </span>
        )}

        {/* Quick-add revealed on hover (desktop) — same handler as the button below */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 ease-smooth group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
          <div className="glass-panel flex items-center justify-center gap-1.5 rounded-full px-4 py-2 font-body text-xs font-bold text-white">
            View details
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <h3 className="mb-2 line-clamp-2 font-body text-sm font-semibold leading-snug text-foreground transition-colors duration-300 group-hover:text-primary md:text-base">
          {name}
        </h3>

        <div className="mb-3 flex items-center gap-1.5">
          <div className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 transition-colors duration-300 ${
                  i < Math.floor(rating) ? "fill-primary text-primary" : "fill-muted text-muted-foreground/25"
                }`}
              />
            ))}
          </div>
          <span className="font-body text-xs font-semibold text-muted-foreground">
            {rating.toFixed(1)}
          </span>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-xl font-extrabold tracking-tight text-foreground text-glow-gold">
              ₹{price}
            </span>
            {originalPrice && (
              <span className="font-body text-sm text-muted-foreground line-through">
                ₹{originalPrice}
              </span>
            )}
          </div>

          {/* Footer actions get their own opaque bar so they stay legible over image bleed */}
          <div className="flex gap-2 border-t border-border/60 pt-3">
            <Button
              size="sm"
              className={`flex-1 rounded-full px-3 ${added ? "bg-secondary hover:bg-secondary" : ""}`}
              onClick={handleAddToCart}
              aria-label={`Add ${name} to cart`}
            >
              {added ? (
                <>
                  <Check className="mr-1 h-3.5 w-3.5 animate-pop-in" />
                  <span className="text-sm">Added ✓</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                  <span className="text-sm">Add</span>
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 rounded-full"
              onClick={handleBuyNow}
              aria-label={`Buy ${name} now`}
            >
              <span className="text-sm">Buy</span>
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;