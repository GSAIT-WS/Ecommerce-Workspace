import { useEffect } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, MapPin, Clock, Phone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderStatusTimeline from "@/components/checkout/OrderStatusTimeline";
import AnimatedCheckmark from "@/components/AnimatedCheckmark";
import type { ApiAddress } from "@/services/addressApi";
import type { OrderStatus } from "@/data/orders";
import { normalizeOrderStatus } from "@/data/orders";

type PaymentMethodId = "upi" | "card" | "netbanking" | "cod";

const paymentMethodLabels: Record<PaymentMethodId, string> = {
  upi: "UPI",
  card: "Debit / Credit Card",
  netbanking: "Net Banking",
  cod: "Cash on Delivery",
};

type ConfirmationItem = {
  id: string;
  name: string;
  tag?: string;
  quantity: number;
  lineTotal: number;
  image?: string;
};

const PRODUCT_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3C/svg%3E";

function isOrderConfirmationState(x: unknown): x is {
  orderId: string;
  orderNumber: string;
  orderStatus?: OrderStatus;
  total: number;
  subtotal: number;
  delivery: number;
  couponDiscount: number;
  selectedAddress?: ApiAddress;
  paymentMethod: PaymentMethodId;
  items: ConfirmationItem[];
} {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (typeof o.orderId !== "string" || typeof o.orderNumber !== "string") return false;
  if (typeof o.total !== "number" || typeof o.paymentMethod !== "string") return false;
  if (!Array.isArray(o.items)) return false;
  return o.paymentMethod in paymentMethodLabels;
}

function formatApiAddress(a: ApiAddress) {
  return {
    name: a.recipient_name,
    phone: a.phone,
    address: [a.address_line1, a.address_line2].filter(Boolean).join(", "),
    landmark: `${a.city}, ${a.state}`,
    pincode: a.postal_code,
  };
}

const OrderConfirmationPage = () => {
  const location = useLocation();
  const placed = isOrderConfirmationState(location.state) ? location.state : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!placed) {
    return <Navigate to="/orders" replace />;
  }

  const timelineStatus = normalizeOrderStatus(placed.orderStatus ?? "confirmed");
  const displayAddress = placed.selectedAddress
    ? formatApiAddress(placed.selectedAddress)
    : {
        name: "—",
        phone: "—",
        address: "—",
        landmark: "",
        pincode: "",
      };

  const displayPayment = {
    method: paymentMethodLabels[placed.paymentMethod],
    status: placed.paymentMethod === "cod" ? "Pay on delivery" : "Paid",
  };

  const now = new Date();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 text-center"
        >
          <AnimatedCheckmark />

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-2 font-display text-3xl font-bold text-foreground md:text-4xl"
          >
            Order Placed Successfully!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="font-body text-muted-foreground"
          >
            Thank you for your order. We&apos;re preparing your healthy snacks!
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mx-auto mb-8 max-w-md rounded-2xl border border-border bg-card p-6 text-center"
        >
          <p className="mb-1 font-body text-sm text-muted-foreground">Order number</p>
          <p className="mb-4 font-display text-xl font-bold text-primary">{placed.orderNumber}</p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="font-body">
                {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="font-body text-muted-foreground">
              {now.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-2xl border border-secondary/30 bg-secondary/10 p-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-foreground">Delivery</p>
                  <p className="font-body text-sm text-muted-foreground">
                    Estimated 30–45 mins after dispatch
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-6 font-display text-xl font-bold text-foreground">Order Status</h2>
              <OrderStatusTimeline currentStatus={timelineStatus} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-4 font-display text-xl font-bold text-foreground">Order Items</h2>
              <div className="space-y-4">
                {placed.items.map((item) => (
                  <div key={`${item.id}-${item.name}`} className="flex gap-4">
                    <img
                      src={item.image || PRODUCT_PLACEHOLDER}
                      alt={item.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-display font-semibold text-foreground">{item.name}</p>
                      {item.tag && (
                        <p className="font-body text-xs text-muted-foreground">
                          {item.tag} × {item.quantity}
                        </p>
                      )}
                      {!item.tag && (
                        <p className="font-body text-xs text-muted-foreground">× {item.quantity}</p>
                      )}
                    </div>
                    <p className="font-display font-bold text-foreground">₹{item.lineTotal}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="font-display font-bold text-foreground">Total Paid</span>
                <span className="font-display text-xl font-bold text-primary">₹{placed.total}</span>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-4 font-display text-lg font-bold text-foreground">Delivery Address</h2>
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-display font-semibold text-foreground">{displayAddress.name}</p>
                  <p className="mt-1 font-body text-sm text-muted-foreground">{displayAddress.address}</p>
                  {displayAddress.landmark ? (
                    <p className="font-body text-sm text-muted-foreground">{displayAddress.landmark}</p>
                  ) : null}
                  <p className="font-body text-sm text-muted-foreground">{displayAddress.pincode}</p>
                  <p className="mt-2 flex items-center gap-2 font-body text-sm text-foreground">
                    <Phone className="h-4 w-4" />
                    {displayAddress.phone}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-4 font-display text-lg font-bold text-foreground">Payment Details</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-display font-semibold text-foreground">{displayPayment.method}</p>
                </div>
                <span className="rounded-full bg-secondary/10 px-3 py-1 font-body text-sm font-semibold text-secondary">
                  {displayPayment.status}
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="space-y-3"
            >
              <Button
                asChild
                className="w-full rounded-full bg-primary py-6 font-body font-semibold text-primary-foreground"
              >
                <Link to={`/order/${placed.orderId}`}>
                  View order details
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full rounded-full py-6 font-body font-semibold"
              >
                <Link to={`/order-tracking?orderId=${encodeURIComponent(placed.orderId)}`}>
                  Track delivery
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full rounded-full py-6 font-body font-semibold"
              >
                <Link to="/">Continue Shopping</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center"
            >
              <p className="font-body text-sm text-muted-foreground">
                Need help?{" "}
                <span className="cursor-pointer text-primary underline">Contact Support</span>
              </p>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;
