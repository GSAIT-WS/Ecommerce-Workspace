import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw, DollarSign, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ReturnsRefundsPage = () => {
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
              Returns & Refunds
            </h1>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Our hassle-free return and refund policy
            </p>
          </section>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: RotateCcw, title: "Easy Returns", desc: "7 days from delivery" },
              { icon: DollarSign, title: "Full Refund", desc: "For unopened products" },
              { icon: AlertCircle, title: "No Questions", desc: "Simple return process" },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center rounded-xl bg-card p-6 text-center border border-border"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-1 font-display text-base font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="font-body text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="space-y-6 font-body text-sm leading-relaxed text-muted-foreground md:text-base">
              <div>
                <h3 className="mb-2 font-semibold text-foreground">Return Eligibility</h3>
                <ul className="space-y-2 list-disc pl-5">
                  <li>Unopened, undamaged products: Full refund within 7 days</li>
                  <li>Opened products: Only if defective or damaged during delivery</li>
                  <li>Product must be in original packaging</li>
                  <li>Return window starts from delivery date</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">How to Return</h3>
                <ol className="space-y-2 list-decimal pl-5">
                  <li>Login to your account and initiate a return request</li>
                  <li>Choose your reason for return</li>
                  <li>Print the return label from your account</li>
                  <li>Ship the product back to us using the provided label</li>
                  <li>We'll process your refund upon receipt</li>
                </ol>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">Refund Timeline</h3>
                <p>
                  Refunds are processed within 5-7 business days after we receive and verify your returned product. The amount will be credited to your original payment method.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">Non-Returnable Items</h3>
                <p>
                  Items opened without seal, custom orders, and items damaged due to misuse cannot be returned.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">Damaged or Defective Products</h3>
                <p>
                  If you receive a damaged product, report it within 24 hours with photos. We'll replace it free of cost.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">Need Help?</h3>
                <p>
                  Contact our support team at support@purvita.in for any return or refund queries.
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

export default ReturnsRefundsPage;
