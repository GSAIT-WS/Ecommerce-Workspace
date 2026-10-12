import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const PrivacyPage = () => {
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
              <h1 className="text-xl font-bold">Privacy Policy</h1>
              <p className="text-sm text-muted-foreground">
                Last updated: February 2026
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6 rounded-xl bg-card p-6 shadow-sm">
            <section>
              <h2 className="mb-2 font-semibold">Information We Collect</h2>
              <p className="text-sm text-muted-foreground">
                We collect information you provide directly, including name,
                email, phone number, delivery address, and payment information.
                We also collect usage data like browsing history and preferences
                to improve your experience.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-semibold">How We Use Your Information</h2>
              <p className="text-sm text-muted-foreground">
                Your information is used to process orders, provide customer
                support, send order updates, personalize recommendations, and
                improve our services. We may also use it for marketing purposes
                with your consent.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-semibold">Information Sharing</h2>
              <p className="text-sm text-muted-foreground">
                We share your information with delivery partners to fulfill
                orders, payment processors to process transactions, and service
                providers who assist our operations. We never sell your personal
                information to third parties.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-semibold">Data Security</h2>
              <p className="text-sm text-muted-foreground">
                We implement industry-standard security measures to protect your
                data. All payment information is encrypted and processed through
                secure payment gateways. However, no method of transmission is
                100% secure.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-semibold">Your Rights</h2>
              <p className="text-sm text-muted-foreground">
                You have the right to access, update, or delete your personal
                information. You can opt out of marketing communications at any
                time. To exercise these rights, contact us at privacy@purvita.in
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-semibold">Cookies</h2>
              <p className="text-sm text-muted-foreground">
                We use cookies to enhance your browsing experience, analyze site
                traffic, and personalize content. You can manage cookie
                preferences in your browser settings.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-semibold">Children's Privacy</h2>
              <p className="text-sm text-muted-foreground">
                Our services are not intended for children under 18. We do not
                knowingly collect personal information from children.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-semibold">Contact Us</h2>
              <p className="text-sm text-muted-foreground">
                For privacy-related questions or concerns, please contact our
                Data Protection Officer at privacy@purvita.in or write to us at
                our registered office address.
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPage;
