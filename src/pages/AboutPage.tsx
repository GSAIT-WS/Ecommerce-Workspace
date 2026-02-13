import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Leaf, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AboutPage = () => {
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

        <div className="mx-auto mt-8 max-w-3xl space-y-12">
          {/* Hero */}
          <section className="text-center">
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
              About <span className="text-primary">CRUNCH</span>
              <span className="text-secondary">X</span>
            </h1>
            <p className="mt-4 font-body text-lg text-muted-foreground">
              Fueling India with wholesome, crunchy goodness — one bar at a time.
            </p>
          </section>

          {/* Brand Story */}
          <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <h2 className="mb-4 font-display text-2xl font-bold text-foreground">
              Our Story
            </h2>
            <div className="space-y-4 font-body text-sm leading-relaxed text-muted-foreground md:text-base">
              <p>
                CrunchX was born out of a simple frustration — finding healthy snacks in India that actually taste great. In 2023, our founders, a group of fitness enthusiasts from Bangalore, set out to create protein bars and multigrain snacks using locally-sourced millets, nuts, and superfoods.
              </p>
              <p>
                What started as a weekend kitchen experiment quickly grew into a movement. Today, CrunchX serves thousands of health-conscious snackers across India — from gym-goers and office warriors to school kids and busy parents.
              </p>
              <p>
                Every product is crafted with care — no refined sugar, no artificial preservatives, just clean ingredients backed by traditional Indian wisdom and modern nutrition science.
              </p>
            </div>
          </section>

          {/* Mission */}
          <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <h2 className="mb-6 font-display text-2xl font-bold text-foreground">
              Our Mission
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Heart,
                  title: "Health First",
                  description: "Every product is designed to nourish, not just fill. We prioritize real nutrition over empty calories.",
                },
                {
                  icon: Leaf,
                  title: "Sustainably Sourced",
                  description: "We partner with local farmers to source millets, ragi, and nuts — supporting communities while staying sustainable.",
                },
                {
                  icon: Shield,
                  title: "Transparency",
                  description: "No hidden ingredients, no misleading labels. What you see is exactly what you get — clean and honest.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col items-center rounded-xl bg-background p-6 text-center"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-display text-base font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="font-body text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Fun Fact */}
          <section className="rounded-2xl bg-primary/5 p-6 text-center md:p-8">
            <p className="font-display text-lg font-bold text-primary md:text-xl">
              🎉 Over 1,00,000 bars sold across India!
            </p>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Thank you for being part of the CrunchX family.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
