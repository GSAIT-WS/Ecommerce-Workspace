import { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";

function PayInner({
  amountLabel,
  onSuccess,
  onError,
}: {
  amountLabel: string;
  onSuccess: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });
    if (error) {
      onError(error.message ?? "Payment failed");
      setBusy(false);
      return;
    }
    if (paymentIntent && paymentIntent.status !== "succeeded") {
      onError(`Payment status: ${paymentIntent.status}`);
      setBusy(false);
      return;
    }
    try {
      await onSuccess();
    } catch {
      onError("Could not finalize order after payment.");
    }
    setBusy(false);
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || busy} className="w-full rounded-full py-6 font-body font-semibold">
        {busy ? "Processing…" : `Pay ${amountLabel}`}
      </Button>
    </form>
  );
}

export function StripePaymentForm({
  publishableKey,
  clientSecret,
  amountLabel,
  onSuccess,
  onError,
}: {
  publishableKey: string;
  clientSecret: string;
  amountLabel: string;
  onSuccess: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey]);

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: { theme: "stripe" },
      }}
    >
      <PayInner amountLabel={amountLabel} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}
