import { useState } from "react";
import { ChevronDown, Smartphone, CreditCard, Building2, Banknote, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const upiApps = [
  { id: "gpay", name: "Google Pay", color: "#4285F4" },
  { id: "phonepe", name: "PhonePe", color: "#5F259F" },
  { id: "paytm", name: "Paytm", color: "#00BAF2" },
];

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
  const [upiId, setUpiId] = useState("");
  const [selectedUpiApp, setSelectedUpiApp] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState("");

  const config = methodConfig[method];
  const Icon = config.icon;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

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
                Choose a UPI app or enter your UPI ID
              </p>
              
              {/* UPI App icons */}
              <div className="flex gap-3">
                {upiApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => setSelectedUpiApp(app.id)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-3 transition-all ${
                      selectedUpiApp === app.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold text-xs"
                      style={{ backgroundColor: app.color }}
                    >
                      {app.name.charAt(0)}
                    </div>
                    <span className="font-body text-xs text-foreground">
                      {app.name}
                    </span>
                  </button>
                ))}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <div>
                <label className="font-body text-sm font-medium text-foreground">
                  Enter UPI ID
                </label>
                <Input
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="mt-2 rounded-xl border-border"
                />
              </div>

              <Button
                onClick={onProceed}
                className="w-full rounded-full bg-primary py-6 font-body font-semibold text-primary-foreground"
              >
                Pay ₹{amount}
              </Button>
            </div>
          )}

          {/* Card Content */}
          {method === "card" && (
            <div className="space-y-4">
              <div>
                <label className="font-body text-sm font-medium text-foreground">
                  Card Number
                </label>
                <Input
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  className="mt-2 rounded-xl border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-sm font-medium text-foreground">
                    Expiry Date
                  </label>
                  <Input
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                    className="mt-2 rounded-xl border-border"
                  />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground">
                    CVV
                  </label>
                  <Input
                    placeholder="123"
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    maxLength={3}
                    className="mt-2 rounded-xl border-border"
                  />
                </div>
              </div>

              <div>
                <label className="font-body text-sm font-medium text-foreground">
                  Cardholder Name
                </label>
                <Input
                  placeholder="Name on card"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="mt-2 rounded-xl border-border"
                />
              </div>

              <Button
                onClick={onProceed}
                className="w-full rounded-full bg-primary py-6 font-body font-semibold text-primary-foreground"
              >
                Pay ₹{amount}
              </Button>
            </div>
          )}

          {/* Net Banking Content */}
          {method === "netbanking" && (
            <div className="space-y-4">
              <p className="font-body text-sm text-muted-foreground">
                Select your bank
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                {banks.map((bank) => (
                  <button
                    key={bank}
                    onClick={() => setSelectedBank(bank)}
                    className={`flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-left transition-all ${
                      selectedBank === bank
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Building2 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <span className="font-body text-sm text-foreground truncate">
                      {bank}
                    </span>
                    {selectedBank === bank && (
                      <Check className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>

              <Button
                onClick={onProceed}
                disabled={!selectedBank}
                className="w-full rounded-full bg-primary py-6 font-body font-semibold text-primary-foreground disabled:opacity-50"
              >
                Continue to {selectedBank || "Bank"}
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
