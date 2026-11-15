import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Check, Zap } from "lucide-react";
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

const ProductCard = ({ id = "1", name, tag, price, originalPrice, image }: ProductCardProps) => {
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
  };

  return (
    <Link
      to={`/product/${id}`}
      className="card-interactive group relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-[1.6rem] border border-border/80 bg-card shadow-card"
    >
      <div className="relative aspect-[4/4.15] overflow-hidden bg-surface-cream/50 dark:bg-surface-cream">
        <img
          src={image}
          alt={name}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="h-full w-full object-cover transition-transform duration-500 ease-smooth group-hover:scale-[1.04]"
        />
        <div
          className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/15"
          aria-hidden
        />

        <Badge className="absolute left-3 top-3 rounded-full border border-border/70 bg-card/90 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-[0.12em] text-primary shadow-sm backdrop-blur-sm">
          {tag}
        </Badge>

        {discount > 0 && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 font-body text-[11px] font-bold text-accent-foreground shadow-sm ring-1 ring-inset ring-white/35">
            <Zap className="h-3 w-3" aria-hidden />
            {discount}% OFF
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <h3 className="mb-3 line-clamp-2 min-h-[2.8rem] font-body text-sm font-semibold leading-snug text-primary transition-colors duration-300 group-hover:text-primary/80 md:text-base">
          {name}
        </h3>

        <div className="mt-auto space-y-3">
          <div className="flex min-h-[2.25rem] items-end gap-2">
            <span className="font-brand text-[1.35rem] font-semibold tracking-tight text-primary md:text-2xl">
              ₹{price}
            </span>
            {originalPrice && (
              <span className="font-body text-sm text-muted-foreground line-through">
                ₹{originalPrice}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-border/60 pt-3 sm:flex-row">
            <Button
              type="button"
              size="sm"
              variant="cta"
              className={`w-full rounded-full px-3 sm:flex-1 ${added ? "bg-secondary text-secondary-foreground hover:bg-secondary" : ""}`}
              onClick={handleAddToCart}
              aria-label={`Add ${name} to cart`}
            >
              {added ? (
                <>
                  <Check className="h-3.5 w-3.5 animate-pop-in" aria-hidden />
                  <span className="text-[13px]">Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3.5 w-3.5" aria-hidden />
                  <span className="text-[13px]">Add</span>
                </>
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full rounded-full bg-background/70 px-3 sm:flex-1"
              onClick={handleBuyNow}
              aria-label={`Buy ${name} now`}
            >
              <span className="text-[13px]">Buy</span>
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
