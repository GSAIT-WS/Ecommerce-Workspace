import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  MapPin,
  Package,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderStatusTimeline from "@/components/checkout/OrderStatusTimeline";
import productProteinBar from "@/assets/product-protein-bar.jpg";
import productMilletBar from "@/assets/product-millet-bar.jpg";

type OrderStatus = "confirmed" | "packed" | "shipped" | "delivered";

// Dummy order data
const orderData = {
  orderId: "ORDABC12345",
  date: new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }),
  estimatedDelivery: "Today, by 7:30 PM",
  items: [
    {
      id: "1",
      name: "Peanut Butter Protein Bar",
      quantity: 2,
      image: productProteinBar,
    },
    {
      id: "5",
      name: "Ragi Millet Energy Bar",
      quantity: 1,
      image: productMilletBar,
    },
  ],
  address: {
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    address: "123, Green Valley Apartments, Koramangala, 5th Block",
    landmark: "Near Sony World Signal",
    pincode: "560095, Bangalore",
  },
  deliveryPartner: {
    name: "Suresh Kumar",
    phone: "+91 87654 32109",
    vehicleNumber: "KA 01 AB 1234",
  },
  total: 387,
};

const OrderTrackingPage = () => {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>("confirmed");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate status progression
  useEffect(() => {
    const statuses: OrderStatus[] = ["confirmed", "packed", "shipped", "delivered"];
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < statuses.length - 1) {
        currentIndex++;
        setCurrentStatus(statuses[currentIndex]);
      }
    }, 8000); // Progress every 8 seconds for demo

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
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
                Order ID: <span className="font-semibold text-foreground">{orderData.orderId}</span>
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
          {/* Left Column - Main Tracking */}
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
                <div>
                  <p className="font-body text-sm text-muted-foreground">
                    {currentStatus === "delivered" ? "Delivered" : "Estimated Delivery"}
                  </p>
                  <p
                    className={`font-display text-2xl font-bold ${
                      currentStatus === "delivered" ? "text-secondary" : "text-primary"
                    }`}
                  >
                    {currentStatus === "delivered"
                      ? "Order Delivered! 🎉"
                      : orderData.estimatedDelivery}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Order Status Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-6 font-display text-xl font-bold text-foreground">
                Order Status
              </h2>
              <OrderStatusTimeline currentStatus={currentStatus} />
            </motion.div>

            {/* Delivery Partner (shown when shipped) */}
            {(currentStatus === "shipped" || currentStatus === "delivered") && (
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
                      {orderData.deliveryPartner.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-display font-semibold text-foreground">
                        {orderData.deliveryPartner.name}
                      </p>
                      <p className="font-body text-sm text-muted-foreground">
                        {orderData.deliveryPartner.vehicleNumber}
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

            {/* Order Items Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-4 font-display text-lg font-bold text-foreground">
                Order Summary
              </h2>
              <div className="flex flex-wrap gap-3">
                {orderData.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">
                        {item.name}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="font-body text-sm text-muted-foreground">
                  {orderData.items.length} items
                </span>
                <span className="font-display font-bold text-foreground">
                  ₹{orderData.total}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
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
                <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-display font-semibold text-foreground">
                    {orderData.address.name}
                  </p>
                  <p className="mt-1 font-body text-sm text-muted-foreground">
                    {orderData.address.address}
                  </p>
                  <p className="font-body text-sm text-muted-foreground">
                    {orderData.address.landmark}
                  </p>
                  <p className="font-body text-sm text-muted-foreground">
                    {orderData.address.pincode}
                  </p>
                  <p className="mt-2 flex items-center gap-2 font-body text-sm text-foreground">
                    <Phone className="h-4 w-4" />
                    {orderData.address.phone}
                  </p>
                </div>
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
              </div>
            </motion.div>

            {/* Back to Shopping */}
            <Button
              asChild
              className="w-full rounded-full bg-primary py-6 font-body font-semibold text-primary-foreground"
            >
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderTrackingPage;
