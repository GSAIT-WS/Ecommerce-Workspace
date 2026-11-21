import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  MapPin,
  Package,
  Clock,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderStatusTimeline from "@/components/checkout/OrderStatusTimeline";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/productImagePlaceholder";
import { useAuth } from "@/context/AuthContext";
import { getOrderByIdApi } from "@/services/orderApi";
import { normalizeOrderStatus, type OrderStatus } from "@/data/orders";
import { formatProductName } from "@/lib/productName";

function parseShippingSnapshot(s: unknown): {
  name: string;
  phone: string;
  address: string;
  landmark: string;
  pincode: string;
} {
  if (!s || typeof s !== "object") {
    return { name: "—", phone: "—", address: "—", landmark: "", pincode: "—" };
  }
  const j = s as Record<string, unknown>;
  return {
    name: String(j.recipient_name ?? j.name ?? "—"),
    phone: String(j.phone ?? "—"),
    address: [j.address_line1, j.address_line2].filter(Boolean).join(", ") || "—",
    landmark: [j.city, j.state].filter(Boolean).join(", ") || "",
    pincode: String(j.postal_code ?? "—"),
  };
}

const OrderTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId")?.trim() ?? "";

  const { session, loading: authLoading } = useAuth();
  const token = session?.access_token ?? null;

  const [loading, setLoading] = useState(!!orderId);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>("pending");
  const [orderNumber, setOrderNumber] = useState("");
  const [placedAtLabel, setPlacedAtLabel] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("We’ll update you as the order progresses");
  const [items, setItems] = useState<{ id: string; name: string; quantity: number; image: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [address, setAddress] = useState<ReturnType<typeof parseShippingSnapshot> | null>(null);
  const [shipment, setShipment] = useState<Record<string, unknown> | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!orderId || !token) return;
    setError(null);
    const res = await getOrderByIdApi(token, orderId);
    if (res.error || !res.order) {
      setError(res.error ?? "Order not found");
      setLoading(false);
      return;
    }
    const o = res.order;
    setOrderNumber(o.order_number ?? o.id.slice(0, 8).toUpperCase());
    setPlacedAtLabel(
      new Date(o.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    );
    setCurrentStatus(normalizeOrderStatus(o.order_status));
    setItems(
      (o.items ?? []).map((it) => ({
        id: String(it.id),
        name: it.product_name ?? "Item",
        quantity: it.quantity,
        image: PRODUCT_IMAGE_PLACEHOLDER,
      })),
    );
    setTotal(o.total);
    setAddress(parseShippingSnapshot(o.shipping_address));
    setShipment(o.shipment && typeof o.shipment === "object" ? o.shipment : null);
    const est = o.shipment && typeof o.shipment === "object" && o.shipment.estimated_delivery;
    if (typeof est === "string" && est.trim()) {
      setEstimatedDelivery(est);
    } else {
      setEstimatedDelivery("We’ll update you as the order progresses");
    }
    setLoading(false);
  }, [orderId, token]);

  useEffect(() => {
    if (!orderId || !token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void load();
  }, [orderId, token, load]);

  const handleRefresh = async () => {
    if (!orderId || !token) return;
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex items-center justify-center px-4 py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: "/order-tracking" }} replace />;
  }

  if (!orderId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">Track an order</h1>
          <p className="mt-2 font-body text-muted-foreground">
            Open tracking from your order confirmation or add{" "}
            <code className="rounded bg-muted px-1 text-sm">?orderId=…</code> to the URL.
          </p>
          <Button asChild className="mt-6">
            <Link to="/orders">My orders</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex items-center justify-center px-4 py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !address) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="font-body text-destructive">{error ?? "Unable to load order."}</p>
          <Button asChild className="mt-6">
            <Link to="/orders">Back to orders</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const deliveryPartner =
    shipment && typeof shipment.tracking_notes === "string"
      ? { name: "Delivery", phone: "", vehicleNumber: String(shipment.shipment_number ?? "") }
      : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                Track Order
              </h1>
              <p className="mt-1 font-body text-muted-foreground">
                <span className="font-semibold text-foreground">{orderNumber}</span>
                {placedAtLabel ? ` · Placed ${placedAtLabel}` : null}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => void handleRefresh()}
              className="rounded-full"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border p-6 ${
                currentStatus === "delivered"
                  ? "border-secondary/30 bg-secondary/10"
                  : "border-primary/30 bg-primary/5"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full ${
                    currentStatus === "delivered"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {currentStatus === "delivered" ? (
                    <Package className="h-7 w-7" />
                  ) : (
                    <Clock className="h-7 w-7" />
                  )}
                </div>
                <div>
                  <p className="font-body text-sm text-muted-foreground">
                    {currentStatus === "delivered" ? "Delivered" : "Estimated / status"}
                  </p>
                  <p
                    className={`font-display text-2xl font-bold ${
                      currentStatus === "delivered" ? "text-secondary" : "text-primary"
                    }`}
                  >
                    {currentStatus === "delivered" ? "Order delivered" : estimatedDelivery}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-6 font-display text-xl font-bold text-foreground">Order Status</h2>
              <OrderStatusTimeline currentStatus={currentStatus} />
            </motion.div>

            {(currentStatus === "shipped" || currentStatus === "delivered") && deliveryPartner && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h2 className="mb-4 font-display text-lg font-bold text-foreground">
                  Delivery Partner
                </h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted font-display text-lg font-bold text-foreground">
                      {deliveryPartner.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-display font-semibold text-foreground">
                        {deliveryPartner.name}
                      </p>
                      {deliveryPartner.vehicleNumber ? (
                        <p className="font-body text-sm text-muted-foreground">
                          {deliveryPartner.vehicleNumber}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <a href="tel:+917842245679" aria-label="Call support">
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <Link to="/contact" aria-label="Open support chat">
                        <MessageCircle className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-4 font-display text-lg font-bold text-foreground">Order Summary</h2>
              <div className="flex flex-wrap gap-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2"
                  >
                    <img
                      src={item.image}
                      alt={formatProductName(item.name)}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">{formatProductName(item.name)}</p>
                      <p className="font-body text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="font-body text-sm text-muted-foreground">{items.length} items</span>
                <span className="font-display font-bold text-foreground">₹{total}</span>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-4 font-display text-lg font-bold text-foreground">Delivery Address</h2>
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-display font-semibold text-foreground">{address.name}</p>
                  <p className="mt-1 font-body text-sm text-muted-foreground">{address.address}</p>
                  {address.landmark ? (
                    <p className="font-body text-sm text-muted-foreground">{address.landmark}</p>
                  ) : null}
                  <p className="font-body text-sm text-muted-foreground">{address.pincode}</p>
                  <p className="mt-2 flex items-center gap-2 font-body text-sm text-foreground">
                    <Phone className="h-4 w-4" />
                    {address.phone}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-4 font-display text-lg font-bold text-foreground">Need Help?</h2>
              <div className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start gap-3 rounded-xl font-body">
                  <a href="tel:+917842245679">
                    <Phone className="h-4 w-4" />
                    Call Support
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start gap-3 rounded-xl font-body">
                  <Link to="/contact">
                    <MessageCircle className="h-4 w-4" />
                    Chat with Us
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start gap-3 rounded-xl font-body">
                  <Link to="/profile/help">FAQs</Link>
                </Button>
              </div>
            </motion.div>

            <Button
              asChild
              className="w-full rounded-full bg-primary py-6 font-body font-semibold text-primary-foreground"
            >
              <Link to="/">Continue Shopping</Link>
            </Button>
            <Button asChild variant="outline" className="w-full rounded-full font-body">
              <Link to={`/order/${orderId}`}>Full order details</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderTrackingPage;
