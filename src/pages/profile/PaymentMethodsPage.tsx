import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  CreditCard,
  Smartphone,
  Wallet,
  MoreVertical,
  Check,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { paymentMethods as initialMethods, PaymentMethod } from "@/data/user";
import { toast } from "sonner";

const PaymentMethodsPage = () => {
  const navigate = useNavigate();
  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods);

  const getIcon = (type: PaymentMethod["type"]) => {
    switch (type) {
      case "upi":
        return Smartphone;
      case "card":
        return CreditCard;
      case "wallet":
        return Wallet;
    }
  };

  const handleSetDefault = (id: string) => {
    setMethods((prev) =>
      prev.map((m) => ({ ...m, isDefault: m.id === id }))
    );
    toast.success("Default payment method updated");
  };

  const handleDelete = (id: string) => {
    setMethods((prev) => prev.filter((m) => m.id !== id));
    toast.success("Payment method removed");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-lg"
        >
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/profile")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">Payment Methods</h1>
            </div>
            <Button
              size="sm"
              onClick={() => toast.info("Add payment method coming soon!")}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>

          {/* Payment Methods List */}
          <div className="space-y-3">
            {methods.map((method) => {
              const Icon = getIcon(method.type);
              return (
                <motion.div
                  key={method.id}
                  layout
                  className={`rounded-xl border-2 bg-card p-4 shadow-sm transition-colors ${
                    method.isDefault ? "border-primary" : "border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        method.isDefault ? "bg-primary/10" : "bg-muted"
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${
                          method.isDefault
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{method.label}</h3>
                        {method.isDefault && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {method.details}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!method.isDefault && (
                          <DropdownMenuItem
                            onClick={() => handleSetDefault(method.id)}
                          >
                            Set as Default
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(method.id)}
                        >
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {methods.length === 0 && (
            <div className="rounded-xl bg-card p-8 text-center shadow-sm">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">No payment methods saved</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a payment method for faster checkout
              </p>
              <Button
                className="mt-4"
                onClick={() => toast.info("Add payment method coming soon!")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </div>
          )}

          {/* Security Note */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            🔒 Your payment information is encrypted and secure
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentMethodsPage;
