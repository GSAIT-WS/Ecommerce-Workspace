import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Truck, ShieldCheck, Clock, AlertCircle, MapPin, Home, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DeliverySlotSelector from "@/components/checkout/DeliverySlotSelector";
import AddressFormModal from "@/components/address/AddressFormModal";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useAddress } from "@/context/AddressContext";
import type { ApiAddress } from "@/services/addressApi";
import { toast } from "sonner";
import { canProceedFromCheckout, getCheckoutCtaLabel } from "@/lib/checkoutFlow";

const labelIcon = (label?: string) => {
  switch (label?.toLowerCase()) {
    case "work":
      return Briefcase;
    case "other":
      return MapPin;
    default:
      return Home;
  }
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items: cartItems, updateQuantity, getSubtotal, getDeliveryCharge } = useCart();
  const { session } = useAuth();
  const { addresses, selectedAddressId, setSelectedAddressId, refreshAddresses } = useAddress();

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");

  const token = session?.access_token ?? null;

  const handleApplyCoupon = () => {
    setCouponError("");
    if (couponCode.trim().toUpperCase() === "CRUNCHFIRST") {
      setAppliedCoupon("CRUNCHFIRST");
      setCouponCode("");
    } else {
      setCouponError("Invalid coupon code");
      setAppliedCoupon(null);
    }
  };

  const subtotal = getSubtotal();
  const delivery = getDeliveryCharge();
  const couponDiscount = appliedCoupon === "CRUNCHFIRST" ? Math.floor(subtotal * 0.2) : 0;
  const total = subtotal + delivery - couponDiscount;

  const selectedAddress: ApiAddress | undefined = addresses.find(
    (a) => a.id === selectedAddressId
  );

  const canProceed = canProceedFromCheckout({
    addressesCount: addresses.length,
    selectedAddressId,
    hasToken: Boolean(token),
  });
  const ctaLabel = getCheckoutCtaLabel({
    addressesCount: addresses.length,
    selectedAddressId,
    hasToken: Boolean(token),
  });

  const handleProceedToPayment = () => {
    if (addresses.length === 0) {
      toast.error("Add a delivery address to continue.");
      return;
    }
    if (!selectedAddressId) {
      toast.error("Select a delivery address to continue.");
      return;
    }
    if (!token) {
      toast.error("Sign in to continue to payment.");
      return;
    }
    navigate("/payment", {
      state: {
        selectedAddress,
        couponDiscount,
        couponCode: appliedCoupon,
        total,
        subtotal,
        delivery,
      },
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">Your cart is empty</h1>
          <p className="mt-2 font-body text-muted-foreground">Add items to your cart before checkout.</p>
          <Button asChild className="mt-6">
            <Link to="/search">Continue Shopping</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="container mx-auto px-4 py-8 md:py-12"
      >
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
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* ── Delivery Address Section ── */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-foreground">
                  Delivery Address
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full font-body text-sm"
                  onClick={() => setShowAddressModal(true)}
                >
                  <Plus className="h-4 w-4" />
                  {addresses.length === 0 ? "Add Address" : "Add New"}
                </Button>
              </div>

              {addresses.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center">
                  <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 font-semibold text-foreground">
                    No delivery address
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Please add a delivery address to continue
                  </p>
                  <Button className="mt-4" onClick={() => setShowAddressModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => {
                    const Icon = labelIcon(address.label);
                    const isSelected = selectedAddressId === address.id;
                    return (
                      <button
                        key={address.id}
                        type="button"
                        onClick={() => setSelectedAddressId(address.id)}
                        className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border bg-background hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Radio indicator */}
                          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-current transition-colors"
                            style={{ borderColor: isSelected ? "hsl(var(--primary))" : "hsl(var(--border))" }}
                          >
                            {isSelected && (
                              <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                            )}
                          </div>

                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isSelected ? "bg-primary/10" : "bg-muted"}`}>
                            <Icon className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-sm text-foreground">
                                {address.label ?? "Home"}
                              </span>
                              {address.is_default && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-foreground mt-0.5">
                              {address.recipient_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {[address.address_line1, address.address_line2]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {address.city}, {address.state} – {address.postal_code}
                            </p>
                            <p className="text-xs text-muted-foreground">{address.phone}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── Delivery Time Section ── */}
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

            {/* ── Order Items Section ── */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-6 font-display text-xl font-bold text-foreground">
                Order Items ({cartItems.length})
              </h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
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
                          <p className="font-display font-semibold text-foreground">{item.name}</p>
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
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-muted"
                          >
                            −
                          </button>
                          <span className="w-6 text-center font-body text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-muted"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-display font-bold text-foreground">
                            ₹{item.price * item.quantity}
                          </p>
                          {item.originalPrice && (
                            <p className="font-body text-xs text-muted-foreground line-through">
                              ₹{item.originalPrice * item.quantity}
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
            <div className="surface-card sticky top-32 p-6 shadow-card-elevated">
              <h2 className="mb-6 font-display text-xl font-bold text-foreground">
                Order Summary
              </h2>

              {/* Coupon */}
              <div className="mb-6 rounded-xl border border-border bg-background p-4">
                <label className="mb-3 block font-body text-sm font-medium text-foreground">
                  Have a coupon?
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
                    className="flex-1 rounded-lg font-body text-sm"
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim()}
                    variant="secondary"
                    className="rounded-lg font-body text-sm font-semibold"
                  >
                    Apply
                  </Button>
                </div>
                <AnimatePresence>
                  {couponError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mt-2 flex items-center gap-2 text-destructive"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <p className="font-body text-xs">{couponError}</p>
                    </motion.div>
                  )}
                  {appliedCoupon && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mt-2 rounded-lg bg-secondary/10 px-3 py-2"
                    >
                      <p className="font-body text-xs font-semibold text-secondary">
                        ✓ {appliedCoupon} applied - 20% off
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

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
                {couponDiscount > 0 && (
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <motion.span
                      key={couponDiscount}
                      initial={{ scale: 1.15, color: "hsl(var(--secondary))" }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="font-semibold text-secondary"
                    >
                      −₹{couponDiscount}
                    </motion.span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between py-4">
                <span className="font-display font-bold text-foreground">Total</span>
                <motion.span
                  key={total}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="font-display text-2xl font-bold text-primary"
                >
                  ₹{total}
                </motion.span>
              </div>

              {/* Delivery info */}
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-secondary/10 px-4 py-3">
                <Truck className="h-5 w-5 text-secondary" />
                <div>
                  <p className="font-body text-sm font-semibold text-foreground">Express Delivery</p>
                  <p className="font-body text-xs text-muted-foreground">Estimated 30-45 mins</p>
                </div>
              </div>

              {/* CTA */}
              {!token && addresses.length > 0 && selectedAddressId && (
                <p className="mb-3 rounded-xl border border-border bg-muted/40 px-3 py-2 font-body text-xs text-muted-foreground">
                  <Link to="/login" state={{ from: "/checkout" }} className="font-semibold text-primary underline">
                    Sign in
                  </Link>{" "}
                  to place your order and sync your cart with your account.
                </p>
              )}
              <Button
                onClick={handleProceedToPayment}
                disabled={!canProceed}
                className="w-full rounded-full bg-primary py-6 font-body font-semibold text-primary-foreground"
              >
                {ctaLabel}
              </Button>

              <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span className="font-body text-xs">Secure & Encrypted Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </motion.main>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card p-4 lg:hidden">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-body text-sm text-muted-foreground">Total Amount</span>
          <span className="font-display text-lg font-bold text-primary">₹{total}</span>
        </div>
        <Button
          onClick={handleProceedToPayment}
          disabled={!canProceed}
          className="w-full rounded-full bg-primary py-6 font-body font-semibold text-primary-foreground"
        >
          {ctaLabel}
        </Button>
      </div>

      {/* Add new address modal */}
      <AddressFormModal
        open={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        token={token}
        onSuccess={async () => {
          setShowAddressModal(false);
          await refreshAddresses();
        }}
      />

      <div className="h-32 lg:h-0" />
      <Footer />
    </div>
  );
};

export default CheckoutPage;
