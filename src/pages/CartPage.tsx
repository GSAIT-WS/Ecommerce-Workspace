import { Link } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import productProteinBar from "@/assets/product-protein-bar.jpg";
import productMilletBar from "@/assets/product-millet-bar.jpg";

// Dummy cart items
const cartItems = [
  {
    id: "1",
    name: "Peanut Butter Protein Bar",
    price: 149,
    quantity: 2,
    image: productProteinBar,
  },
  {
    id: "5",
    name: "Ragi Millet Energy Bar",
    price: 139,
    quantity: 1,
    image: productMilletBar,
  },
];

const CartPage = () => {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 499 ? 0 : 49;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
          <h1 className="mt-4 font-display text-2xl font-bold text-foreground md:text-3xl">
            Your Cart
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-2xl border border-border bg-card p-4"
                  >
                    <Link to={`/product/${item.id}`} className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <Link to={`/product/${item.id}`} className="font-body font-semibold text-foreground hover:text-primary">
                          {item.name}
                        </Link>
                        <p className="font-body text-lg font-bold text-foreground">
                          ₹{item.price}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center font-body text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mb-2 font-display text-xl font-bold text-foreground">
                  Your cart is empty
                </h3>
                <p className="mb-6 font-body text-muted-foreground">
                  Start adding some healthy snacks!
                </p>
                <Button asChild className="rounded-full">
                  <Link to="/search">Browse Products</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 font-display text-lg font-bold text-foreground">
                Order Summary
              </h2>
              <div className="space-y-3 border-b border-border pb-4">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">₹{subtotal}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold text-foreground">
                    {shipping === 0 ? "Free" : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="font-body text-xs text-secondary">
                    Add ₹{500 - subtotal} more for free shipping!
                  </p>
                )}
              </div>
              <div className="flex justify-between py-4 font-body">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold text-foreground">₹{total}</span>
              </div>
              <Button className="w-full rounded-full bg-primary py-6 font-body font-semibold text-primary-foreground hover:bg-primary/90">
                Proceed to Checkout
              </Button>
              <p className="mt-4 text-center font-body text-xs text-muted-foreground">
                Secure checkout powered by trusted payment partners
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
