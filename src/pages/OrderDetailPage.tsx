import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderStatusTimeline from "@/components/checkout/OrderStatusTimeline";
import { getOrderById, getStatusLabel, getStatusColor, Order, OrderStatus, dummyOrders } from "@/data/orders";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const timelineRef = useRef<HTMLDivElement>(null);

  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>("confirmed");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const foundOrder = getOrderById(orderId || "");
    if (foundOrder) {
      setOrder(foundOrder);
      setCurrentStatus(foundOrder.status);
    } else {
      // Use the first order as fallback for demo
      setOrder(dummyOrders[0]);
      setCurrentStatus(dummyOrders[0].status);
    }
  }, [orderId]);

  // Simulate status progression for active orders
  useEffect(() => {
    if (!order || order.status === "delivered") return;

    const statuses: OrderStatus[] = ["confirmed", "packed", "shipped", "delivered"];
    let currentIndex = statuses.indexOf(order.status);

    const interval = setInterval(() => {
      if (currentIndex < statuses.length - 1) {
        currentIndex++;
        setCurrentStatus(statuses[currentIndex]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [order]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleReorder = () => {
    if (!order) return;

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
      description: `${order.items.length} item(s) added`,
    });

    navigate("/cart");
  };

  const scrollToTimeline = () => {
    timelineRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex items-center justify-center px-4 py-20">
          <p className="font-body text-muted-foreground">Loading order details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
          <div className="mt-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                  {order.id}
                </h1>
                <Badge className={`${getStatusColor(currentStatus)} border-0 font-body`}>
                  {getStatusLabel(currentStatus)}
                </Badge>
              </div>
              <p className="mt-1 font-body text-muted-foreground">
                Ordered on {formatDate(order.date)}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              className="rounded-full"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estimated Delivery Card */}
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
                <div className="flex-1">
                  <p className="font-body text-sm text-muted-foreground">
                    {currentStatus === "delivered" ? "Delivered" : "Estimated Delivery"}
                  </p>
                  <p
                    className={`font-display text-xl font-bold md:text-2xl ${
                      currentStatus === "delivered" ? "text-secondary" : "text-primary"
                    }`}
                  >
                    {currentStatus === "delivered"
                      ? "Order Delivered! 🎉"
                      : order.estimatedDelivery}
                  </p>
                </div>
                {currentStatus !== "delivered" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={scrollToTimeline}
                    className="gap-1 rounded-xl font-body"
                  >
                    Track
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Order Status Timeline */}
            <motion.div
              ref={timelineRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-6 font-display text-xl font-bold text-foreground">
                Delivery Status
              </h2>
              <OrderStatusTimeline currentStatus={currentStatus} />
            </motion.div>

            {/* Delivery Partner (shown when shipped) */}
            {(currentStatus === "shipped" || currentStatus === "delivered") &&
              order.deliveryPartner && (
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
                        {order.deliveryPartner.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-display font-semibold text-foreground">
                          {order.deliveryPartner.name}
                        </p>
                        <p className="font-body text-sm text-muted-foreground">
                          {order.deliveryPartner.vehicleNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-4 font-display text-lg font-bold text-foreground">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-xl border border-border bg-background p-3"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-display font-semibold text-foreground">
                        {item.name}
                      </p>
                      <p className="font-body text-sm text-muted-foreground">
                        {item.variant}
                      </p>
                      <p className="font-body text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-display font-bold text-foreground">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="mt-6 space-y-2 border-t border-border pt-4">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={order.deliveryCharge === 0 ? "text-secondary" : "text-foreground"}>
                    {order.deliveryCharge === 0 ? "FREE" : `₹${order.deliveryCharge}`}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-secondary">-₹{order.discount}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-display font-bold text-foreground">Total</span>
                  <span className="font-display text-lg font-bold text-primary">
                    ₹{order.total}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-4 font-display text-lg font-bold text-foreground">
                Delivery Address
              </h2>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  {order.address.type === "home" ? (
                    <Home className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display font-semibold text-foreground">
                      {order.address.name}
                    </p>
                    <Badge variant="outline" className="text-xs capitalize">
                      {order.address.type}
                    </Badge>
                  </div>
                  <p className="mt-1 font-body text-sm text-muted-foreground">
                    {order.address.address}
                  </p>
                  <p className="font-body text-sm text-muted-foreground">
                    {order.address.landmark}
                  </p>
                  <p className="font-body text-sm text-muted-foreground">
                    {order.address.pincode}
                  </p>
                  <p className="mt-2 flex items-center gap-2 font-body text-sm text-foreground">
                    <Phone className="h-4 w-4" />
                    {order.address.phone}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-4 font-display text-lg font-bold text-foreground">
                Payment Method
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="font-body text-foreground">{order.paymentMethod}</p>
              </div>
            </motion.div>

            {/* Help Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-4 font-display text-lg font-bold text-foreground">
                Need Help?
              </h2>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 rounded-xl font-body"
                >
                  <Phone className="h-4 w-4" />
                  Call Support
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 rounded-xl font-body"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat with Us
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 rounded-xl font-body"
                >
                  <HelpCircle className="h-4 w-4" />
                  FAQs
                </Button>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleReorder}
                className="w-full gap-2 rounded-full bg-primary py-6 font-body font-semibold text-primary-foreground"
              >
                <RefreshCw className="h-4 w-4" />
                Reorder
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full rounded-full py-6 font-body"
              >
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
