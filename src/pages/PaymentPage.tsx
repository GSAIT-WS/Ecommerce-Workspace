import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PaymentMethodCard from "@/components/checkout/PaymentMethodCard";
import PaymentProcessing from "@/components/checkout/PaymentProcessing";

type PaymentMethod = "upi" | "card" | "netbanking" | "cod";

const PaymentPage = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);

  const total = 387; // Dummy total from checkout

  const handleProceed = () => {
    setPaymentFailed(false);
    setIsProcessing(true);
  };

  const handleProcessingComplete = () => {
    // 90% success rate simulation
    if (Math.random() > 0.1) {
      navigate("/order-confirmation");
    } else {
      setIsProcessing(false);
      setPaymentFailed(true);
    }
  };

  if (isProcessing) {
    return <PaymentProcessing onComplete={handleProcessingComplete} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
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

        {/* Payment Failed Alert */}
        {paymentFailed && (
          <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
            <p className="font-display font-semibold text-destructive">
              Payment Failed
            </p>
            <p className="mt-1 font-body text-sm text-destructive/80">
              Your payment could not be processed. Please try again or choose a different payment method.
            </p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Payment Methods */}
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

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 font-display text-lg font-bold text-foreground">
                Order Total
              </h2>

              <div className="mb-4 flex items-baseline justify-between border-b border-border pb-4">
                <span className="font-body text-muted-foreground">Amount to Pay</span>
                <span className="font-display text-2xl font-bold text-primary">
                  ₹{total}
                </span>
              </div>

              <div className="space-y-3">
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
