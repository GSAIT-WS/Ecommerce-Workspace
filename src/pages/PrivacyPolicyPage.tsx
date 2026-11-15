import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicyPage = () => {
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
              Privacy Policy
            </h1>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Last updated: February 2026
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <h2 className="mb-4 font-display text-2xl font-bold text-foreground">
              Your Privacy Matters
            </h2>
            <div className="space-y-4 font-body text-sm leading-relaxed text-muted-foreground md:text-base">
              <p>
                At PURVITA, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.
              </p>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">Information We Collect</h3>
                <p>
                  We collect information you provide during registration, checkout, and account management, including name, email, phone number, and delivery address.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">How We Use Your Data</h3>
                <p>
                  Your information is used to process orders, improve our services, send order updates, and with your consent, share promotional offers and health tips.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">Data Security</h3>
                <p>
                  We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">Third-Party Sharing</h3>
                <p>
                  We do not sell your data. We share information with delivery partners and payment processors only as necessary to fulfill your orders.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">Your Rights</h3>
                <p>
                  You have the right to access, update, or delete your personal information. Contact us at admin@purvita.in for requests.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">Changes to This Policy</h3>
                <p>
                  We may update this policy occasionally. Continued use of our service constitutes acceptance of changes.
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

export default PrivacyPolicyPage;
