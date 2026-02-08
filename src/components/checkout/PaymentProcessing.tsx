import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, Lock } from "lucide-react";

interface PaymentProcessingProps {
  onComplete: () => void;
}

const processingSteps = [
  "Verifying payment details...",
  "Processing payment...",
  "Confirming with bank...",
  "Almost done...",
];

const PaymentProcessing = ({ onComplete }: PaymentProcessingProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < processingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center px-8 text-center">
        {/* Animated loader */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative mb-8"
        >
          {/* Outer ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-primary/20"
          />
          
          {/* Spinning indicator */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-transparent border-t-primary"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </motion.div>
        </motion.div>

        {/* Processing message */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 font-display text-2xl font-bold text-foreground"
        >
          Processing Payment
        </motion.h2>

        <motion.p
          key={currentStep}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="mb-8 font-body text-muted-foreground"
        >
          {processingSteps[currentStep]}
        </motion.p>

        {/* Progress bar */}
        <div className="mb-8 h-2 w-64 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep + 1) / processingSteps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full rounded-full bg-primary"
          />
        </div>

        {/* Security badges */}
        <div className="flex items-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="font-body text-xs">256-bit SSL</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span className="font-body text-xs">Secure Payment</span>
          </div>
        </div>

        <p className="mt-6 font-body text-xs text-muted-foreground">
          Please do not close this window or press back button
        </p>
      </div>
    </div>
  );
};

export default PaymentProcessing;
