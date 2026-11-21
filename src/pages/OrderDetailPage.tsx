import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  MapPin,
  Package,
  Clock,
  RefreshCw,
  CreditCard,
  HelpCircle,
  Home,
  Building2,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderStatusTimeline from "@/components/checkout/OrderStatusTimeline";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getOrderByIdApi } from "@/services/orderApi";
import { getStatusLabel, getStatusColor, normalizeOrderStatus, type OrderStatus } from "@/data/orders";
import { toast } from "sonner";
import { formatProductName } from "@/lib/productName";

const PRODUCT_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3C/svg%3E";
const SUPPORT_PHONE_TEL = "+917842245679";

function parseShippingSnapshot(s: unknown): {
  name: string;
  phone: string;
  address: string;
  landmark: string;
  pincode: string;
  type: "home" | "work";
} {
  if (!s || typeof s !== "object") {
    return {
      name: "—",
      phone: "—",
      address: "—",
      landmark: "",
      pincode: "—",
      type: "home",
    };
  }
  const j = s as Record<string, unknown>;
  const label = String(j.label ?? "").toLowerCase();
  return {
    name: String(j.recipient_name ?? j.name ?? "—"),
    phone: String(j.phone ?? "—"),
    address: [j.address_line1, j.address_line2].filter(Boolean).join(", ") || "—",
    landmark: [j.city, j.state].filter(Boolean).join(", ") || "",
    pincode: String(j.postal_code ?? "—"),
    type: label === "work" ? "work" : "home",
  };
}

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const timelineRef = useRef<HTMLDivElement>(null);
  const token = session?.access_token ?? null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>("pending");
  const [orderNumber, setOrderNumber] = useState("");
  const [placedAt, setPlacedAt] = useState<Date | null>(null);
  const [items, setItems] = useState<
    { id: string; productId: string | null; name: string; quantity: number; unitPrice: number; lineTotal: number }[]
  >([]);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [total, setTotal] = useState(0);
  const [address, setAddress] = useState<ReturnType<typeof parseShippingSnapshot> | null>(null);
  const [shipment, setShipment] = useState<Record<string, unknown> | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = async () => {
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
    setPlacedAt(new Date(o.created_at));
    setCurrentStatus(normalizeOrderStatus(o.order_status));
    setItems(
      (o.items ?? []).map((it) => ({
        id: String(it.id),
        productId: it.product_id,
        name: it.product_name ?? "Item",
        quantity: it.quantity,
        unitPrice: it.unit_price,
        lineTotal: it.line_total,
      })),
    );
    setSubtotal(o.subtotal);
    setDiscount(o.discount_amount);
    setDeliveryCharge(o.shipping_amount);
    setTotal(o.total);
    setAddress(parseShippingSnapshot(o.shipping_address));
    setShipment(o.shipment && typeof o.shipment === "object" ? o.shipment : null);
    setLoading(false);
  };

  useEffect(() => {
    if (!token || !orderId) return;
    setLoading(true);
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load when id/token ready
  }, [orderId, token]);

  const handleRefresh = async () => {
    if (!token || !orderId) return;
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
    toast.success("Order details refreshed");
  };

  const handleReorder = () => {
    const withProducts = items.filter((i) => i.productId);
    if (withProducts.length === 0) {
      toast.error("Cannot reorder — product links missing for these items.");
      return;
    }

    withProducts.forEach((item) => {
      if (!item.productId) return;
      for (let i = 0; i < item.quantity; i++) {
        addToCart({
          id: item.productId,
          name: item.name,
          tag: "",
          price: item.unitPrice,
          image: PRODUCT_PLACEHOLDER,
        });
      }
    });

    toast.success("Items added to cart");
    navigate("/cart");
  };

  const scrollToTimeline = () => {
    timelineRef.current?.scrollIntoView({ behavior: "smooth" });
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
    return <Navigate to="/login" state={{ from: `/order/${orderId ?? ""}` }} replace />;
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

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

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
            to="/orders"
            className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="break-words font-display text-2xl font-bold text-foreground md:text-3xl">{orderNumber}</h1>
                <Badge className={`${getStatusColor(currentStatus)} border-0 font-body`}>
                  {getStatusLabel(currentStatus)}
                </Badge>
              </div>
              {placedAt && (
                <p className="mt-1 font-body text-muted-foreground">Ordered on {formatDate(placedAt)}</p>
              )}
            </div>
            <Button variant="outline" size="icon" onClick={() => void handleRefresh()} className="shrink-0 rounded-full">
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
              <div className="flex flex-wrap items-center gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${
                    currentStatus === "delivered"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {currentStatus === "delivered" ? <Package className="h-7 w-7" /> : <Clock className="h-7 w-7" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-body text-sm text-muted-foreground">
                    {currentStatus === "delivered" ? "Delivered" : "Estimated / status"}
                  </p>
                  <p
                    className={`break-words font-display text-xl font-bold md:text-2xl ${
                      currentStatus === "delivered" ? "text-secondary" : "text-primary"
                    }`}
                  >
                    {currentStatus === "delivered"
                      ? "Order delivered"
                      : shipment?.estimated_delivery
                        ? String(shipment.estimated_delivery)
                        : "We’ll update you as the order progresses"}
                  </p>
                </div>
                {currentStatus !== "delivered" && currentStatus !== "cancelled" && (
                  <Button variant="outline" size="sm" onClick={scrollToTimeline} className="ml-auto shrink-0 gap-1 rounded-xl font-body">
                    Track
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>

            <motion.div
              ref={timelineRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-6 font-display text-xl font-bold text-foreground">Delivery Status</h2>
              <OrderStatusTimeline currentStatus={currentStatus} />
            </motion.div>

            {(currentStatus === "shipped" || currentStatus === "delivered") && deliveryPartner && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h2 className="mb-4 font-display text-lg font-bold text-foreground">Delivery</h2>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-foreground">{deliveryPartner.name}</p>
                    {deliveryPartner.vehicleNumber ? (
                      <p className="break-words font-body text-sm text-muted-foreground">{deliveryPartner.vehicleNumber}</p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="icon" className="rounded-full">
                      <a href={`tel:${SUPPORT_PHONE_TEL}`} aria-label="Call support">
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="icon" className="rounded-full">
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
              <h2 className="mb-4 font-display text-lg font-bold text-foreground">Order Items</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex min-w-0 items-center gap-4 rounded-xl border border-border bg-background p-3">
                    <img
                      src={PRODUCT_PLACEHOLDER}
                      alt={formatProductName(item.name)}
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-display font-semibold text-foreground">{formatProductName(item.name)}</p>
                      <p className="font-body text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="shrink-0 font-display font-bold text-foreground">₹{item.lineTotal}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 border-t border-border pt-4">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">₹{subtotal}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={deliveryCharge === 0 ? "text-secondary" : "text-foreground"}>
                    {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-secondary">-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-display font-bold text-foreground">Total</span>
                  <span className="font-display text-lg font-bold text-primary">₹{total}</span>
                </div>
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  {address.type === "home" ? (
                    <Home className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display font-semibold text-foreground">{address.name}</p>
                    <Badge variant="outline" className="text-xs capitalize">
                      {address.type}
                    </Badge>
                  </div>
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
              transition={{ delay: 0.35 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-4 font-display text-lg font-bold text-foreground">Payment</h2>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="font-body text-foreground">Paid via checkout</p>
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
                  <a href={`tel:${SUPPORT_PHONE_TEL}`}>
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
                  <Link to="/profile/help">
                    <HelpCircle className="h-4 w-4" />
                    FAQs
                  </Link>
                </Button>
              </div>
            </motion.div>

            <div className="space-y-3">
              <Button
                onClick={handleReorder}
                className="w-full gap-2 rounded-full bg-primary py-6 font-body font-semibold text-primary-foreground"
              >
                <RefreshCw className="h-4 w-4" />
                Reorder
              </Button>
              <Button asChild variant="outline" className="w-full rounded-full py-6 font-body">
                <Link to="/">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderDetailPage;
