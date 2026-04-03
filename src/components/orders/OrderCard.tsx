import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/data/orders";
import { getStatusLabel, getStatusColor } from "@/data/orders";

export interface OrderListRow {
  id: string;
  orderNumber: string;
  placedAt: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
}

interface OrderCardProps {
  order: OrderListRow;
  index: number;
}

const OrderCard = ({ order, index }: OrderCardProps) => {
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
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
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-foreground">{order.orderNumber}</p>
                <p className="font-body text-xs text-muted-foreground">{formatDate(order.placedAt)}</p>
              </div>
            </div>
            <Badge className={`${getStatusColor(order.status)} border-0 font-body text-xs`}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div className="ml-2 flex-1">
              <p className="font-body text-sm text-foreground">
                {order.itemCount > 0
                  ? `${order.itemCount} ${order.itemCount === 1 ? "item" : "items"}`
                  : "View details"}
              </p>
              <p className="font-display text-lg font-bold text-foreground">₹{order.total}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default OrderCard;
