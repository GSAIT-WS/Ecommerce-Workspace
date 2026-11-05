import { Link } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Leaf, IndianRupee, Shield, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { toast } from "@/components/ui/sonner";
import emptyCartIllustration from "@/assets/empty-cart-illustration.jpg";
import { getAmountLeftForFreeShipping } from "@/lib/shipping";

const trustBadges = [
  { icon: Leaf, label: "100% Natural" },
  { icon: Factory, label: "Multigrain" },
  { icon: IndianRupee, label: "Made in India" },
  { icon: Shield, label: "Secure Payments" },
];

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, getSubtotal, getDeliveryCharge, getSavings, getCartTotal } = useCart();

  const subtotal = getSubtotal();
  const shipping = getDeliveryCharge();
  const savings = getSavings();
  const total = getCartTotal();
  const amountLeftForFreeShipping = getAmountLeftForFreeShipping(subtotal);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground md:text-4xl">
            Your Cart
          </h1>
        </div>

        {items.length > 0 ? (
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-4 md:p-6 shadow-sm transition-all hover:shadow-md"
                >
                  {/* Product Image */}
                  <Link
                    to={`/product/${item.id}`}
                    className="relative h-24 w-24 md:h-28 md:w-28 flex-shrink-0 overflow-hidden rounded-xl bg-muted group"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <Badge className="absolute left-2 top-2 rounded-full bg-secondary/90 text-xs font-semibold text-secondary-foreground">
                      {item.tag}
                    </Badge>
                  </Link>

                  {/* Product Details */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <Link
                        to={`/product/${item.id}`}
                        className="break-words font-display text-sm font-semibold text-foreground hover:text-primary md:text-base"
                      >
                        {item.name}
                      </Link>
                      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="font-body text-lg font-bold text-foreground">
                          ₹{item.price}
                        </span>
                        {item.originalPrice && (
                          <>
                            <span className="font-body text-sm text-muted-foreground line-through">
                              ₹{item.originalPrice}
                            </span>
                            <span className="font-body text-xs font-semibold text-secondary">
                              Save ₹{item.originalPrice - item.price}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Remove */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2">
                        <button 
                          className="p-1 hover:bg-muted rounded transition-colors"
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateQuantity(item.id, item.quantity - 1);
                              toast.success("Quantity updated");
                            }
                          }}
                        >
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <span className="w-6 text-center font-body text-sm font-semibold text-foreground">
                          {item.quantity}
                        </span>
                        <button 
                          className="p-1 hover:bg-muted rounded transition-colors"
                          onClick={() => {
                            updateQuantity(item.id, item.quantity + 1);
                            toast.success("Quantity updated");
                          }}
                        >
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                      <button 
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-muted-foreground hover:text-red-500"
                        onClick={() => {
                          removeFromCart(item.id);
                          toast.success("Item removed from cart");
                        }}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="surface-card sticky top-32 p-6 shadow-card-elevated md:p-8">
                <h2 className="mb-6 font-display text-xl font-bold text-foreground">
                  Order Summary
                </h2>

                {/* Price Breakdown */}
                <div className="space-y-4 border-b border-border pb-6">
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-foreground">
                      {shipping === 0 ? (
                        <span className="font-semibold text-secondary">Free</span>
                      ) : (
                        `₹${shipping}`
                      )}
                    </span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-muted-foreground">Savings</span>
                      <span className="font-semibold text-secondary">−₹{savings}</span>
                    </div>
                  )}
                  {shipping > 0 && (
                    <p className="font-body text-xs text-secondary pt-2">
                      ✓ Add ₹{amountLeftForFreeShipping} more for free shipping!
                    </p>
                  )}
                </div>

                {/* Grand Total */}
                <div className="py-6 border-b border-border">
                  <div className="flex justify-between">
                    <span className="font-display font-bold text-foreground">Total</span>
                    <span className="font-display text-2xl font-bold text-primary">₹{total}</span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {trustBadges.map((badge) => (
                    <div
                      key={badge.label}
                      className="flex flex-col items-center gap-2 py-3 px-2 rounded-lg bg-background"
                    >
                      <badge.icon className="h-5 w-5 text-secondary" />
                      <span className="font-body text-xs text-center font-medium text-foreground">
                        {badge.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="mt-8 space-y-3">
                  <Button 
                    asChild
                    className="w-full rounded-full bg-primary py-6 font-body font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    <Link to="/checkout">Proceed to Checkout</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-full py-6 font-body font-semibold border-border hover:bg-background"
                  >
                    <Link to="/search">Continue Shopping</Link>
                  </Button>
                </div>

                <p className="mt-4 text-center font-body text-xs text-muted-foreground">
                  Secure checkout powered by trusted payment partners
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
            <img
              src={emptyCartIllustration}
              alt="Empty cart"
              className="mb-8 w-full max-w-xs rounded-2xl"
            />
            <h2 className="mb-3 font-display text-2xl font-bold text-foreground md:text-3xl">
              Your cart is empty
            </h2>
            <p className="mb-8 font-body text-muted-foreground max-w-sm">
              Start exploring our range of healthy multigrain snacks and nutritious treats
            </p>
            <Button
              asChild
              className="rounded-full px-8 py-6 bg-primary font-body font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Link to="/search">Explore Healthy Snacks</Link>
            </Button>
          </div>
        )}
      </main>

      {/* Mobile Sticky CTA (visible only on mobile for empty cart scenario) */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 lg:hidden">
          <Button 
            asChild
            className="w-full rounded-full bg-primary py-6 font-body font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Link to="/checkout">Proceed to Checkout</Link>
          </Button>
        </div>
      )}

      <div className={items.length > 0 ? "h-24 lg:h-0" : ""} />

      <Footer />
    </div>
  );
};

export default CartPage;
