import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Truck, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddressCard from "@/components/checkout/AddressCard";
import DeliverySlotSelector from "@/components/checkout/DeliverySlotSelector";
import productProteinBar from "@/assets/product-protein-bar.jpg";
import productMilletBar from "@/assets/product-millet-bar.jpg";

// Dummy addresses
const addresses = [
  {
    id: "1",
    type: "home" as const,
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    address: "123, Green Valley Apartments, Koramangala, 5th Block",
    landmark: "Near Sony World Signal",
    pincode: "560095, Bangalore",
    isDefault: true,
  },
  {
    id: "2",
    type: "work" as const,
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    address: "Tech Park, Tower B, 4th Floor, Outer Ring Road",
    landmark: "Opposite Marathahalli Bridge",
    pincode: "560037, Bangalore",
    isDefault: false,
  },
];

// Dummy cart items for checkout
const checkoutItems = [
  {
    id: "1",
    name: "Peanut Butter Protein Bar",
    variant: "Pack of 6 • Chocolate",
    price: 149,
    originalPrice: 199,
    quantity: 2,
    image: productProteinBar,
    tag: "High Protein",
  },
  {
    id: "5",
    name: "Ragi Millet Energy Bar",
    variant: "Pack of 4 • Original",
    price: 139,
    quantity: 1,
    image: productMilletBar,
    tag: "Multigrain",
  },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState(addresses[0].id);
  const [quantities, setQuantities] = useState<Record<string, number>>(
    checkoutItems.reduce((acc, item) => ({ ...acc, [item.id]: item.quantity }), {})
  );

  const updateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta),
    }));
  };

  const subtotal = checkoutItems.reduce(
    (sum, item) => sum + item.price * (quantities[item.id] || item.quantity),
    0
  );
  const delivery = subtotal > 499 ? 0 : 49;
  const discount = 50; // Dummy discount
  const total = subtotal + delivery - discount;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground md:text-4xl">
            Checkout
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Address Section */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-foreground">
                  Delivery Address
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full font-body text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add New
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {addresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    isSelected={selectedAddress === address.id}
                    onSelect={() => setSelectedAddress(address.id)}
                    onEdit={() => {}}
                    deliveryAvailable={true}
                  />
                ))}
              </div>
            </section>

            {/* Delivery Time Section */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                  <Clock className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Delivery Time
                  </h2>
                  <p className="font-body text-sm text-muted-foreground">
                    Choose when you'd like your order delivered
                  </p>
                </div>
              </div>

              <DeliverySlotSelector onSlotSelect={() => {}} />
            </section>

            {/* Order Items Section */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-6 font-display text-xl font-bold text-foreground">
                Order Items ({checkoutItems.length})
              </h2>

              <div className="space-y-4">
                {checkoutItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-xl border border-border bg-background p-4"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-display font-semibold text-foreground">
                              {item.name}
                            </p>
                            <p className="font-body text-xs text-muted-foreground">
                              {item.variant}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="rounded-full bg-secondary/10 text-xs font-medium text-secondary"
                          >
                            {item.tag}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-muted"
                          >
                            −
                          </button>
                          <span className="w-6 text-center font-body text-sm font-semibold">
                            {quantities[item.id]}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-muted"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-display font-bold text-foreground">
                            ₹{item.price * quantities[item.id]}
                          </p>
                          {item.originalPrice && (
                            <p className="font-body text-xs text-muted-foreground line-through">
                              ₹{item.originalPrice * quantities[item.id]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-6 font-display text-xl font-bold text-foreground">
                Order Summary
              </h2>

              {/* Price breakdown */}
              <div className="space-y-3 border-b border-border pb-4">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">₹{subtotal}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={delivery === 0 ? "font-semibold text-secondary" : "text-foreground"}>
                    {delivery === 0 ? "Free" : `₹${delivery}`}
                  </span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-semibold text-secondary">−₹{discount}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between py-4">
                <span className="font-display font-bold text-foreground">Total</span>
                <span className="font-display text-2xl font-bold text-primary">
                  ₹{total}
                </span>
              </div>

              {/* Delivery info */}
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-secondary/10 px-4 py-3">
                <Truck className="h-5 w-5 text-secondary" />
                <div>
                  <p className="font-body text-sm font-semibold text-foreground">
                    Express Delivery
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    Estimated 30-45 mins
                  </p>
                </div>
              </div>

              {/* CTA */}
              <Button
                onClick={() => navigate("/payment")}
                className="w-full rounded-full bg-primary py-6 font-body font-semibold text-primary-foreground"
              >
                Proceed to Payment
              </Button>

              {/* Security badge */}
              <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span className="font-body text-xs">Secure & Encrypted Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card p-4 lg:hidden">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-body text-sm text-muted-foreground">Total Amount</span>
          <span className="font-display text-lg font-bold text-primary">₹{total}</span>
        </div>
        <Button
          onClick={() => navigate("/payment")}
          className="w-full rounded-full bg-primary py-6 font-body font-semibold text-primary-foreground"
        >
          Proceed to Payment
        </Button>
      </div>

      <div className="h-32 lg:h-0" />

      <Footer />
    </div>
  );
};

export default CheckoutPage;
