import { ChevronDown, Smartphone, CreditCard, Building2, Banknote, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type PaymentMethod = "upi" | "card" | "netbanking" | "cod";

interface PaymentMethodCardProps {
  method: PaymentMethod;
  isSelected: boolean;
  onSelect: () => void;
  onProceed: () => void;
  amount: number;
}

const methodConfig = {
  upi: {
    icon: Smartphone,
    title: "UPI",
    subtitle: "Pay using any UPI app",
  },
  card: {
    icon: CreditCard,
    title: "Credit / Debit Card",
    subtitle: "Visa, Mastercard, RuPay",
  },
  netbanking: {
    icon: Building2,
    title: "Net Banking",
    subtitle: "All major banks supported",
  },
  cod: {
    icon: Banknote,
    title: "Cash on Delivery",
    subtitle: "Pay when your order arrives",
  },
};

const banks = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
];

const PaymentMethodCard = ({
  method,
  isSelected,
  onSelect,
  onProceed,
  amount,
}: PaymentMethodCardProps) => {
  const config = methodConfig[method];
  const Icon = config.icon;

  return (
    <Collapsible open={isSelected} onOpenChange={() => onSelect()}>
      <CollapsibleTrigger asChild>
        <div
          className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
            isSelected
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground">
                  {config.title}
                </p>
                <p className="font-body text-sm text-muted-foreground">
                  {config.subtitle}
                </p>
              </div>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-muted-foreground transition-transform ${
                isSelected ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="mt-2 rounded-2xl border border-border bg-card p-4">
          {/* UPI Content */}
          {method === "upi" && (
            <div className="space-y-4">
              <p className="font-body text-sm text-muted-foreground">
                You will complete UPI payment securely in the next step via our payment gateway.
              </p>

              <Button
                onClick={onProceed}
                className="w-full rounded-full bg-primary py-6 font-body font-semibold text-primary-foreground"
              >
                Continue to Secure Payment
              </Button>
            </div>
          )}

          {/* Card Content */}
          {method === "card" && (
            <div className="space-y-4">
              <p className="font-body text-sm text-muted-foreground">
                Card details are collected only on the secure payment gateway screen in the next step.
              </p>

              <Button
                onClick={onProceed}
                className="w-full rounded-full bg-primary py-6 font-body font-semibold text-primary-foreground"
              >
                Continue to Secure Payment
              </Button>
            </div>
          )}

          {/* Net Banking Content */}
          {method === "netbanking" && (
            <div className="space-y-4">
              <p className="font-body text-sm text-muted-foreground">
                Net banking authorization is completed securely in the next step.
              </p>
              <p className="font-body text-xs text-muted-foreground">
                Supported banks include: {banks.slice(0, 3).join(", ")} and more.
              </p>

              <Button
                onClick={onProceed}
                className="w-full rounded-full bg-primary py-6 font-body font-semibold text-primary-foreground"
              >
                Continue to Secure Payment
              </Button>
            </div>
          )}

          {/* COD Content */}
          {method === "cod" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="font-body text-sm text-foreground">
                  Pay with cash when your order is delivered.
                </p>
                <ul className="mt-3 space-y-2 font-body text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-secondary" />
                    No advance payment required
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-secondary" />
                    Pay after inspecting your order
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-secondary" />
                    Keep exact change ready
                  </li>
                </ul>
              </div>

              <Button
                onClick={onProceed}
                className="w-full rounded-full bg-primary py-6 font-body font-semibold text-primary-foreground"
              >
                Place Order - ₹{amount}
              </Button>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default PaymentMethodCard;
