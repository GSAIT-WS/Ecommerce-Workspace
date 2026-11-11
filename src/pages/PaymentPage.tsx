import { useCallback, useRef, useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock, MapPin, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PaymentMethodCard from "@/components/checkout/PaymentMethodCard";
import { StripePaymentForm } from "@/components/checkout/StripePaymentForm";
import { Button } from "@/components/ui/button";
import type { ApiAddress } from "@/services/addressApi";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  syncLocalCartToServer,
  placeOrder,
  createPaymentIntent,
  confirmMockPayment,
  finalizeCodOrder,
  type PlacedOrder,
} from "@/services/checkoutApi";
import { toast } from "sonner";
import type { OrderStatus } from "@/data/orders";
import type { CartItem } from "@/context/CartContext";
import { isCheckoutPaymentState, type CheckoutPaymentState } from "@/lib/checkoutFlow";

type PaymentMethod = "upi" | "card" | "netbanking" | "cod";

type PaymentRouteState = CheckoutPaymentState & {
  selectedAddress?: ApiAddress;
};

type StripePayState = {
  clientSecret: string;
  paymentIntentId: string;
  order: PlacedOrder;
};

function isMockIntent(intent: {
  payment_intent_id: string;
  provider?: string;
}): boolean {
  return (
    intent.provider === "mock" ||
    intent.payment_intent_id.startsWith("pi_mock")
  );
}

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();
  const { items: cartItems, clearCart } = useCart();
  const token = session?.access_token ?? null;

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [processStep, setProcessStep] = useState("");
  const [stripePay, setStripePay] = useState<StripePayState | null>(null);
  const checkoutLockRef = useRef(false);

  const checkout = isCheckoutPaymentState(location.state)
    ? (location.state as PaymentRouteState)
    : null;
  const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim() ?? "";

  const goToConfirmation = useCallback(
    (
      order: PlacedOrder,
      orderStatus: OrderStatus,
      snap: PaymentRouteState,
      items: CartItem[],
      method: PaymentMethod,
    ) => {
      const itemSnapshot = items.map((i) => ({
        id: i.id,
        name: i.name,
        tag: i.tag,
        quantity: i.quantity,
        lineTotal: i.price * i.quantity,
        image: i.image,
      }));
      clearCart();
      navigate("/order-confirmation", {
        replace: true,
        state: {
          orderId: order.id,
          orderNumber: order.order_number,
          orderStatus,
          total: snap.total,
          subtotal: snap.subtotal,
          delivery: snap.delivery,
          couponDiscount: snap.couponDiscount,
          selectedAddress: snap.selectedAddress,
          paymentMethod: method,
          items: itemSnapshot,
        },
      });
    },
    [clearCart, navigate],
  );

  const runCheckout = useCallback(async () => {
    if (!checkout || !token || checkoutLockRef.current) return;
    checkoutLockRef.current = true;
    const addr = checkout.selectedAddress;
    if (!addr?.id) {
      toast.error("Please select a saved address.");
      navigate("/checkout", { replace: true });
      checkoutLockRef.current = false;
      return;
    }

    setProcessError(null);
    setStripePay(null);
    setIsProcessing(true);
    setProcessStep("Syncing your cart…");

    const sync = await syncLocalCartToServer(token, cartItems);
    if (sync.error) {
      setProcessError(sync.error);
      setIsProcessing(false);
      toast.error(sync.error);
      checkoutLockRef.current = false;
      return;
    }

    setProcessStep("Placing your order…");
    const placed = await placeOrder(token, {
      shipping_address_id: addr.id,
      coupon_code: checkout.couponCode,
    });

    if (placed.error || !placed.order) {
      const msg = placed.error ?? "Could not place order.";
      setProcessError(msg);
      setIsProcessing(false);
      toast.error(msg);
      checkoutLockRef.current = false;
      return;
    }

    const order = placed.order;
    let orderStatus: OrderStatus = (order.status as OrderStatus) ?? "pending";

    if (selectedMethod === "cod") {
      setProcessStep("Confirming cash on delivery…");
      const cod = await finalizeCodOrder(token, order.id);
      if (cod.error) {
        setProcessError(cod.error);
        setIsProcessing(false);
        toast.error(cod.error);
        checkoutLockRef.current = false;
        return;
      }
      orderStatus = "confirmed";
      setIsProcessing(false);
      checkoutLockRef.current = false;
      goToConfirmation(order, orderStatus, checkout, cartItems, selectedMethod);
      return;
    }

    setProcessStep("Starting payment…");
    const pi = await createPaymentIntent(token, order.id);
    const intent = pi.intent;
    if (pi.error || !intent?.payment_intent_id) {
      const msg = pi.error ?? "Could not start payment.";
      setProcessError(msg);
      setIsProcessing(false);
      toast.error(msg);
      checkoutLockRef.current = false;
      return;
    }

    if (isMockIntent(intent)) {
      setProcessStep("Confirming payment…");
      const paid = await confirmMockPayment(token, intent.payment_intent_id);
      if (paid.error) {
        setProcessError(paid.error);
        setIsProcessing(false);
        toast.error(paid.error);
        checkoutLockRef.current = false;
        return;
      }
      orderStatus = "confirmed";
      setIsProcessing(false);
      checkoutLockRef.current = false;
      goToConfirmation(order, orderStatus, checkout, cartItems, selectedMethod);
      return;
    }

    if (!intent.client_secret) {
      const msg = "Server did not return a payment client secret.";
      setProcessError(msg);
      setIsProcessing(false);
      toast.error(msg);
      checkoutLockRef.current = false;
      return;
    }

    if (!stripePublishableKey) {
      const msg =
        "Stripe checkout requires VITE_STRIPE_PUBLISHABLE_KEY. Set it in your env or omit STRIPE_SECRET_KEY on the server to use mock payment.";
      setProcessError(msg);
      setIsProcessing(false);
      toast.error(msg);
      checkoutLockRef.current = false;
      return;
    }

    setIsProcessing(false);
    checkoutLockRef.current = false;
    setStripePay({
      clientSecret: intent.client_secret,
      paymentIntentId: intent.payment_intent_id,
      order,
    });
  }, [
    checkout,
    token,
    cartItems,
    selectedMethod,
    goToConfirmation,
    navigate,
    stripePublishableKey,
  ]);

  const handleProceed = () => {
    void runCheckout();
  };

  const handleStripeSuccess = useCallback(async () => {
    if (!checkout || !token || !stripePay) return;
    const paid = await confirmMockPayment(token, stripePay.paymentIntentId);
    if (paid.error) {
      toast.error(paid.error);
      throw new Error(paid.error);
    }
    setStripePay(null);
    goToConfirmation(stripePay.order, "confirmed", checkout, cartItems, selectedMethod);
  }, [checkout, token, stripePay, goToConfirmation, cartItems, selectedMethod]);

  if (!checkout) {
    return <Navigate to="/checkout" replace />;
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">Sign in required</h1>
          <p className="mt-2 font-body text-muted-foreground">
            Log in to complete payment and place your order.
          </p>
          <Button asChild className="mt-6">
            <Link to="/login" state={{ from: "/checkout" }}>
              Sign in
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const { total, subtotal, delivery, couponDiscount, selectedAddress } = checkout;

  if (isProcessing) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background px-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-6 text-center font-display text-lg font-semibold text-foreground">
          {processStep || "Please wait…"}
        </p>
        <p className="mt-2 text-center font-body text-sm text-muted-foreground">
          Do not close this window.
        </p>
      </div>
    );
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
            Choose a payment method. You will enter payment credentials only on the secure gateway step.
          </p>
        </div>

        {processError && (
          <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 font-body text-sm text-destructive">
            {processError}
          </div>
        )}

        {stripePay && stripePublishableKey ? (
          <div className="mb-8 rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-2 font-display text-xl font-bold text-foreground">Complete payment</h2>
            <p className="mb-6 font-body text-sm text-muted-foreground">
              Your order is reserved. Pay securely with Stripe (test cards work in test mode).
            </p>
            <StripePaymentForm
              publishableKey={stripePublishableKey}
              clientSecret={stripePay.clientSecret}
              amountLabel={`₹${total}`}
              onSuccess={handleStripeSuccess}
              onError={(m) => toast.error(m)}
            />
            <Button
              type="button"
              variant="ghost"
              className="mt-4 font-body text-muted-foreground"
              onClick={() => setStripePay(null)}
            >
              Cancel — return to payment options
            </Button>
            <p className="mt-2 font-body text-xs text-muted-foreground">
              If you cancel, the order stays pending until you pay from your account orders.
            </p>
          </div>
        ) : null}

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
            <div className="surface-card p-6 shadow-card-elevated lg:sticky lg:top-32">
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
                  <Link to="/terms-of-service" className="text-primary underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy-policy" className="text-primary underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
              <div className="mt-4 space-y-2 rounded-xl border border-border bg-background p-4">
                <p className="font-body text-xs font-semibold text-foreground">Need help?</p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <a href="tel:+918012345678" className="font-body text-primary underline">
                    Call support
                  </a>
                  <Link to="/contact" className="font-body text-primary underline">
                    Contact support
                  </Link>
                  <Link to="/profile/help" className="font-body text-primary underline">
                    FAQ
                  </Link>
                </div>
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
