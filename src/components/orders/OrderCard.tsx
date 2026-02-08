import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, RefreshCw, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Order, getStatusLabel, getStatusColor } from "@/data/orders";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface OrderCardProps {
  order: Order;
  index: number;
}

const OrderCard = ({ order, index }: OrderCardProps) => {
  const { addToCart } = useCart();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleReorder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    order.items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        addToCart({
          id: item.id,
          name: item.name,
          tag: item.variant,
          price: item.price,
          image: item.image,
        });
      }
    });

    toast.success("Items added to cart", {
      description: `${order.items.length} item(s) from order ${order.id} added`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={`/order/${order.id}`}>
        <div className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-foreground">
                  {order.id}
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  {formatDate(order.date)}
                </p>
              </div>
            </div>
            <Badge className={`${getStatusColor(order.status)} border-0 font-body text-xs`}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>

          {/* Product Images */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex -space-x-3">
              {order.items.slice(0, 3).map((item, idx) => (
                <img
                  key={item.id}
                  src={item.image}
                  alt={item.name}
                  className="h-12 w-12 rounded-xl border-2 border-card object-cover"
                  style={{ zIndex: 3 - idx }}
                />
              ))}
              {order.items.length > 3 && (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-card bg-muted font-body text-sm font-medium text-muted-foreground">
                  +{order.items.length - 3}
                </div>
              )}
            </div>
            <div className="ml-2 flex-1">
              <p className="font-body text-sm text-foreground">
                {order.items.length} {order.items.length === 1 ? "item" : "items"}
              </p>
              <p className="font-display text-lg font-bold text-foreground">
                ₹{order.total}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Reorder Button for Delivered Orders */}
          {order.status === "delivered" && (
            <div className="mt-4 border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 rounded-xl border-primary font-body text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={handleReorder}
              >
                <RefreshCw className="h-4 w-4" />
                Reorder
              </Button>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default OrderCard;
