import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Package, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderCard from "@/components/orders/OrderCard";
import { dummyOrders, Order } from "@/data/orders";

type FilterType = "all" | "active" | "delivered";

const OrdersPage = () => {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredOrders = dummyOrders.filter((order) => {
    if (filter === "all") return true;
    if (filter === "active") return order.status !== "delivered";
    return order.status === "delivered";
  });

  const activeCount = dummyOrders.filter((o) => o.status !== "delivered").length;
  const deliveredCount = dummyOrders.filter((o) => o.status === "delivered").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground md:text-4xl">
            My Orders
          </h1>
          <p className="mt-1 font-body text-muted-foreground">
            Track and manage your orders
          </p>
        </div>

        {/* Filter Tabs */}
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as FilterType)}
          className="mb-6"
        >
          <TabsList className="grid w-full max-w-md grid-cols-3 rounded-xl bg-muted p-1">
            <TabsTrigger
              value="all"
              className="rounded-lg font-body data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              All ({dummyOrders.length})
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="rounded-lg font-body data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              Active ({activeCount})
            </TabsTrigger>
            <TabsTrigger
              value="delivered"
              className="rounded-lg font-body data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              Delivered ({deliveredCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order, index) => (
              <OrderCard key={order.id} order={order} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">
              No orders found
            </h2>
            <p className="mt-2 max-w-sm font-body text-muted-foreground">
              {filter === "active"
                ? "You don't have any active orders right now."
                : filter === "delivered"
                ? "No delivered orders yet."
                : "Start shopping to see your orders here."}
            </p>
            <Button
              asChild
              className="mt-6 gap-2 rounded-full bg-primary px-8 py-6 font-body font-semibold text-primary-foreground"
            >
              <Link to="/">
                <ShoppingBag className="h-5 w-5" />
                Start Shopping
              </Link>
            </Button>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default OrdersPage;
