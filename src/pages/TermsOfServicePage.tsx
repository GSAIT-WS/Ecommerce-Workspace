import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="mx-auto mt-8 max-w-3xl space-y-6">
          <section>
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
              Terms of Service
            </h1>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Last updated: February 2026
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="space-y-6 font-body text-sm leading-relaxed text-muted-foreground md:text-base">
              <div>
                <h3 className="mb-2 font-semibold text-foreground">1. Acceptance of Terms</h3>
                <p>
                  By accessing and using PURVITA, you agree to be bound by these Terms of Service. If you do not agree, you may not use our services.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">2. Use of Service</h3>
                <p>
                  You must be at least 18 years old to use this service. You agree to provide accurate information and are responsible for maintaining account confidentiality.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">3. Orders & Payments</h3>
                <p>
                  All orders are subject to availability and confirmation. Prices may change without notice. Payment must be made in full before processing.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">4. Intellectual Property</h3>
                <p>
                  All content on this platform, including text, graphics, logos, and images, is the property of PURVITA and protected by law.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">5. Limitation of Liability</h3>
                <p>
                  PURVITA is not liable for any indirect, incidental, or consequential damages arising from the use of our products or services.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">6. Contact</h3>
                <p>
                  For questions about these terms, please contact us at admin@purvita.in
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfServicePage;
