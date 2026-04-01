import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, MapPin, Clock, Phone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderStatusTimeline from "@/components/checkout/OrderStatusTimeline";
import AnimatedCheckmark from "@/components/AnimatedCheckmark";

// Placeholder for product images (replace with real images later)
const PRODUCT_IMAGE_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3C/svg%3E";

// Dummy order data
const orderData = {
  orderId: "ORD" + Math.random().toString(36).substring(2, 10).toUpperCase(),
  date: new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }),
  time: new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }),
  estimatedDelivery: "30-45 mins",
  items: [
    {
      id: "1",
      name: "Peanut Butter Protein Bar",
      variant: "Pack of 6 • Chocolate",
      quantity: 2,
      price: 298,
      image: PRODUCT_IMAGE_PLACEHOLDER,
    },
    {
      id: "5",
      name: "Ragi Millet Energy Bar",
      variant: "Pack of 4 • Original",
      quantity: 1,
      price: 139,
      image: PRODUCT_IMAGE_PLACEHOLDER,
    },
  ],
  address: {
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    address: "123, Green Valley Apartments, Koramangala, 5th Block",
    landmark: "Near Sony World Signal",
    pincode: "560095, Bangalore",
  },
  payment: {
    method: "UPI",
    status: "Paid",
  },
  total: 387,
};

const OrderConfirmationPage = () => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Success Header */}
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
            Order Placed Successfully! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="font-body text-muted-foreground"
          >
            Thank you for your order. We're preparing your healthy snacks!
          </motion.p>
        </motion.div>

        {/* Order ID Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mx-auto mb-8 max-w-md rounded-2xl border border-border bg-card p-6 text-center"
        >
          <p className="mb-1 font-body text-sm text-muted-foreground">Order ID</p>
          <p className="mb-4 font-display text-xl font-bold text-primary">
            {orderData.orderId}
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="font-body">{orderData.time}</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="font-body text-muted-foreground">{orderData.date}</div>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estimated Delivery */}
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
                  <p className="font-display text-lg font-bold text-foreground">
                    Estimated Delivery
                  </p>
                  <p className="font-body text-2xl font-bold text-secondary">
                    {orderData.estimatedDelivery}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Order Status Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-6 font-display text-xl font-bold text-foreground">
                Order Status
              </h2>
              <OrderStatusTimeline currentStatus="confirmed" />
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-4 font-display text-xl font-bold text-foreground">
                Order Items
              </h2>
              <div className="space-y-4">
                {orderData.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-display font-semibold text-foreground">
                        {item.name}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        {item.variant} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-display font-bold text-foreground">
                      ₹{item.price}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="font-display font-bold text-foreground">Total Paid</span>
                <span className="font-display text-xl font-bold text-primary">
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
              transition={{ delay: 0.9 }}
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

            {/* Payment Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="mb-4 font-display text-lg font-bold text-foreground">
                Payment Details
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-sm text-muted-foreground">
                    Payment Method
                  </p>
                  <p className="font-display font-semibold text-foreground">
                    {orderData.payment.method}
                  </p>
                </div>
                <span className="rounded-full bg-secondary/10 px-3 py-1 font-body text-sm font-semibold text-secondary">
                  {orderData.payment.status}
                </span>
              </div>
            </motion.div>

            {/* Action Buttons */}
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
                <Link to="/order-tracking">
                  Track Order
                  <ChevronRight className="ml-2 h-4 w-4" />
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

            {/* Help */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center"
            >
              <p className="font-body text-sm text-muted-foreground">
                Need help?{" "}
                <span className="cursor-pointer text-primary underline">
                  Contact Support
                </span>
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
