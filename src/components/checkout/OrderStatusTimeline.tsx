import { Check, Package, Truck, MapPin, Clock, XCircle } from "lucide-react";
import type { OrderStatus } from "@/data/orders";

interface TimelineStep {
  id: OrderStatus;
  label: string;
  description: string;
  icon: React.ElementType;
  time?: string;
}

const timelineSteps: TimelineStep[] = [
  {
    id: "pending",
    label: "Order Placed",
    description: "We received your order",
    icon: Clock,
    time: "Processing",
  },
  {
    id: "confirmed",
    label: "Order Confirmed",
    description: "Your order has been placed",
    icon: Check,
    time: "Just now",
  },
  {
    id: "packed",
    label: "Packed",
    description: "Your order is being packed",
    icon: Package,
    time: "Expected soon",
  },
  {
    id: "shipped",
    label: "Out for Delivery",
    description: "Your order is on the way",
    icon: Truck,
    time: "In transit",
  },
  {
    id: "delivered",
    label: "Delivered",
    description: "Order delivered successfully",
    icon: MapPin,
    time: "Completed",
  },
];

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
}

const OrderStatusTimeline = ({ currentStatus }: OrderStatusTimelineProps) => {
  if (currentStatus === "cancelled") {
    return (
      <div className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <XCircle className="h-6 w-6 shrink-0 text-destructive" />
        <div>
          <p className="font-display font-semibold text-foreground">Order cancelled</p>
          <p className="font-body text-sm text-muted-foreground">
            This order is no longer active. Contact support if you need help.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = timelineSteps.findIndex((step) => step.id === currentStatus);
  const safeIndex = currentIndex < 0 ? 0 : currentIndex;

  return (
    <div className="space-y-0">
      {timelineSteps.map((step, index) => {
        const isCompleted = index <= safeIndex;
        const isCurrent = index === safeIndex;
        const isLast = index === timelineSteps.length - 1;
        const Icon = step.icon;

        return (
          <div key={step.id} className="relative flex gap-4">
            {!isLast && (
              <div
                className={`absolute left-5 top-10 h-full w-0.5 ${
                  index < safeIndex ? "bg-secondary" : "bg-border"
                }`}
              />
            )}

            <div
              className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                isCompleted
                  ? "border-secondary bg-secondary text-secondary-foreground"
                  : "border-border bg-card text-muted-foreground"
              } ${isCurrent ? "ring-4 ring-secondary/20" : ""}`}
            >
              <Icon className="h-5 w-5" />
            </div>

            <div className={`pb-8 ${isLast ? "pb-0" : ""}`}>
              <div className="flex items-center gap-2">
                <p
                  className={`font-display font-semibold ${
                    isCompleted ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <span className="flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
                    <Clock className="h-3 w-3" />
                    Current
                  </span>
                )}
              </div>
              <p className="font-body text-sm text-muted-foreground">{step.description}</p>
              {step.time && (
                <p
                  className={`mt-1 font-body text-xs ${
                    isCompleted ? "text-secondary" : "text-muted-foreground"
                  }`}
                >
                  {isCompleted && index < safeIndex ? "Completed" : step.time}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderStatusTimeline;
