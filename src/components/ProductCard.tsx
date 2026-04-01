import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, ShoppingCart, Check } from "lucide-react";
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
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Badge className="absolute left-3 top-3 rounded-full bg-secondary font-body text-xs font-semibold text-secondary-foreground">
          {tag}
        </Badge>
      </div>
      <div className="p-4">
        <h3 className="mb-1 font-body text-sm font-semibold text-foreground line-clamp-2 md:text-base">{name}</h3>
        <div className="mb-2 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${i < Math.floor(rating) ? "fill-accent text-accent" : "fill-muted text-muted"}`}
            />
          ))}
          <span className="ml-1 font-body text-xs text-muted-foreground">{rating.toFixed(1)}</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-body text-lg font-bold text-foreground">₹{price}</span>
              {originalPrice && (
                <span className="font-body text-sm text-muted-foreground line-through">₹{originalPrice}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className={`flex-1 rounded-full px-3 transition-all duration-200 ${added ? "bg-secondary hover:bg-secondary" : ""}`}
              onClick={handleAddToCart}
            >
              {added ? (
                <>
                  <Check className="mr-1 h-3.5 w-3.5 animate-[bounce_0.4s_ease-out]" />
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
