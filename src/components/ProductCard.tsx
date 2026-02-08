import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  name: string;
  tag: string;
  price: number;
  originalPrice?: number;
  rating: number;
  image: string;
}

const ProductCard = ({ name, tag, price, originalPrice, rating, image }: ProductCardProps) => (
  <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
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
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-body text-lg font-bold text-foreground">₹{price}</span>
          {originalPrice && (
            <span className="font-body text-sm text-muted-foreground line-through">₹{originalPrice}</span>
          )}
        </div>
        <Button size="sm" className="rounded-full bg-primary px-3 text-primary-foreground hover:bg-primary/90">
          <ShoppingCart className="mr-1 h-3.5 w-3.5" />
          <span className="font-body text-xs">Add</span>
        </Button>
      </div>
    </div>
  </div>
);

export default ProductCard;
