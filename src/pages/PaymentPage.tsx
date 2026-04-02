import { useCallback, useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PaymentMethodCard from "@/components/checkout/PaymentMethodCard";
import PaymentProcessing from "@/components/checkout/PaymentProcessing";
import type { ApiAddress } from "@/services/addressApi";

type PaymentMethod = "upi" | "card" | "netbanking" | "cod";

type CheckoutPaymentState = {
  selectedAddress?: ApiAddress;
  couponDiscount: number;
  total: number;
  subtotal: number;
  delivery: number;
};

function isCheckoutPaymentState(s: unknown): s is CheckoutPaymentState {
  if (!s || typeof s !== "object") return false;
  const o = s as Record<string, unknown>;
  return (
    typeof o.total === "number" &&
    typeof o.subtotal === "number" &&
    typeof o.delivery === "number" &&
    typeof o.couponDiscount === "number"
  );
}

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("upi");
  const [isProcessing, setIsProcessing] = useState(false);

  const checkout = isCheckoutPaymentState(location.state) ? location.state : null;

  const handleProcessingComplete = useCallback(() => {
    if (!checkout) {
      navigate("/checkout", { replace: true });
      return;
    }
    navigate("/order-confirmation", {
      replace: true,
      state: {
        total: checkout.total,
        subtotal: checkout.subtotal,
        delivery: checkout.delivery,
        couponDiscount: checkout.couponDiscount,
        selectedAddress: checkout.selectedAddress,
        paymentMethod: selectedMethod,
      },
    });
  }, [navigate, checkout, selectedMethod]);

  const handleProceed = () => {
    setIsProcessing(true);
  };

  if (!checkout) {
    return <Navigate to="/checkout" replace />;
  }

  const { total, subtotal, delivery, couponDiscount, selectedAddress } = checkout;

  if (isProcessing) {
    return <PaymentProcessing onComplete={handleProcessingComplete} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <Link
            to="/checkout"
            className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Checkout
          </Link>
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground md:text-4xl">
            Payment
          </h1>
          <p className="mt-2 font-body text-muted-foreground">
            Choose your preferred payment method
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <PaymentMethodCard
              method="upi"
              isSelected={selectedMethod === "upi"}
              onSelect={() => setSelectedMethod("upi")}
              onProceed={handleProceed}
              amount={total}
            />
            <PaymentMethodCard
              method="card"
              isSelected={selectedMethod === "card"}
              onSelect={() => setSelectedMethod("card")}
              onProceed={handleProceed}
              amount={total}
            />
            <PaymentMethodCard
              method="netbanking"
              isSelected={selectedMethod === "netbanking"}
              onSelect={() => setSelectedMethod("netbanking")}
              onProceed={handleProceed}
              amount={total}
            />
            <PaymentMethodCard
              method="cod"
              isSelected={selectedMethod === "cod"}
              onSelect={() => setSelectedMethod("cod")}
              onProceed={handleProceed}
              amount={total}
            />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 font-display text-lg font-bold text-foreground">
                Order summary
              </h2>

              {selectedAddress && (
                <div className="mb-4 flex gap-3 rounded-xl border border-border bg-muted/30 p-3 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div className="min-w-0 font-body text-foreground">
                    <p className="font-display font-semibold">{selectedAddress.recipient_name}</p>
                    <p className="mt-1 text-muted-foreground">
                      {[selectedAddress.address_line1, selectedAddress.address_line2]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postal_code}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2 border-b border-border pb-4 font-body text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span className="text-foreground">₹{delivery}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-secondary">
                    <span>Coupon</span>
                    <span>−₹{couponDiscount}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="font-body text-muted-foreground">Amount to pay</span>
                <span className="font-display text-2xl font-bold text-primary">₹{total}</span>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span className="font-body text-xs">256-bit SSL Encryption</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="font-body text-xs">100% Secure Payment</span>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-muted/50 p-4">
                <p className="font-body text-xs text-muted-foreground">
                  By placing this order, you agree to our{" "}
                  <span className="text-primary underline">Terms of Service</span> and{" "}
                  <span className="text-primary underline">Privacy Policy</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentPage;
