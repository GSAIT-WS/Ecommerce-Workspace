import { Link, useNavigate } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ id, name, tag, price, originalPrice, image });
    toast.success("Added to cart ✓");
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ id, name, tag, price, originalPrice, image });
    navigate("/checkout");
  };

  return (
    <Link 
      to={`/product/${id}`}
      className="group flex gap-4 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md md:gap-6"
    >
      {/* Product Image */}
      <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-muted md:h-36 md:w-36">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Badge className="absolute left-2 top-2 rounded-full bg-secondary font-body text-xs font-semibold text-secondary-foreground">
          {tag}
        </Badge>
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="mb-1 font-display text-base font-semibold text-foreground md:text-lg">
            {name}
          </h3>
          
          {/* Rating */}
          <div className="mb-2 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(rating)
                    ? "fill-accent text-accent"
                    : "fill-muted text-muted"
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
            <span className="font-body text-xl font-bold text-foreground">₹{price}</span>
            {originalPrice && (
              <span className="font-body text-sm text-muted-foreground line-through">
                ₹{originalPrice}
              </span>
            )}
            {originalPrice && (
              <span className="font-body text-xs font-semibold text-secondary">
                {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="rounded-full bg-primary px-4 text-primary-foreground hover:bg-primary/90"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-1.5 h-4 w-4" />
              <span className="font-body text-sm">Add</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full px-4"
              onClick={handleBuyNow}
            >
              <span className="font-body text-sm">Buy</span>
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductListCard;
