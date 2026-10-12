import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl"
        >
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Terms & Conditions</h1>
              <p className="text-sm text-muted-foreground">
                Last updated: February 2026
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6 rounded-xl bg-card p-6 shadow-sm">
            <section>
              <h2 className="mb-2 font-semibold">1. Acceptance of Terms</h2>
              <p className="text-sm text-muted-foreground">
                By accessing and using PURVITA, you agree to be bound by these
                Terms and Conditions. If you do not agree with any part of these
                terms, you may not use our services.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-semibold">2. Use of Service</h2>
              <p className="text-sm text-muted-foreground">
                You must be at least 18 years old to use this service. You agree
                to provide accurate information when creating an account and
                making purchases. You are responsible for maintaining the
                confidentiality of your account.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-semibold">3. Orders & Payments</h2>
              <p className="text-sm text-muted-foreground">
                All orders are subject to availability and confirmation. We
                reserve the right to refuse or cancel any order. Prices are
                subject to change without notice. Payment must be made in full
                before order processing.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-semibold">4. Shipping & Delivery</h2>
              <p className="text-sm text-muted-foreground">
                Delivery times are estimates and may vary. We are not liable for
                delays caused by courier services or circumstances beyond our
                control. Risk of loss transfers to you upon delivery.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-semibold">5. Returns & Refunds</h2>
              <p className="text-sm text-muted-foreground">
                Unopened products may be returned within 7 days of delivery.
                Opened products can only be returned if defective. Refunds will
                be processed within 5-7 business days after receiving the
                returned item.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-semibold">6. Intellectual Property</h2>
              <p className="text-sm text-muted-foreground">
                All content on this platform, including text, graphics, logos,
                and images, is the property of PURVITA and protected by
                intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-semibold">7. Limitation of Liability</h2>
              <p className="text-sm text-muted-foreground">
                PURVITA shall not be liable for any indirect, incidental, or
                consequential damages arising from the use of our products or
                services.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-semibold">8. Contact</h2>
              <p className="text-sm text-muted-foreground">
                For questions about these Terms, please contact us at
                legal@purvita.in
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsPage;
