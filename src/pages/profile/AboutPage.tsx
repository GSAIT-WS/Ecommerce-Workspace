import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Leaf, Award, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const AboutPage = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Heart,
      title: "Health First",
      description:
        "Every product is crafted with your health as our top priority. No compromises.",
    },
    {
      icon: Leaf,
      title: "Natural Ingredients",
      description:
        "We source the finest natural ingredients from certified organic farms across India.",
    },
    {
      icon: Award,
      title: "Quality Certified",
      description:
        "All products are FSSAI certified and undergo rigorous quality testing.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description:
        "Built by health enthusiasts, for health enthusiasts. Your feedback shapes our products.",
    },
  ];

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
            <h1 className="text-xl font-bold">About CRUNCHX</h1>
          </div>

          {/* Hero */}
          <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 text-center">
            <h2 className="text-3xl font-bold text-foreground">
              CRUNCH<span className="text-secondary">X</span>
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Healthy Snacking, Redefined
            </p>
          </div>

          {/* Story */}
          <div className="mb-8 rounded-xl bg-card p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold">Our Story</h3>
            <p className="text-muted-foreground">
              CRUNCHX was born from a simple idea: healthy snacking shouldn't
              mean compromising on taste. Founded in 2024 by a team of health
              enthusiasts and food scientists, we set out to create snacks that
              are both nutritious and delicious.
            </p>
            <p className="mt-3 text-muted-foreground">
              Today, we're proud to offer a range of multigrain protein bars,
              traditional Indian snacks with a healthy twist, and innovative
              nutrition products that fuel your active lifestyle.
            </p>
          </div>

          {/* Values */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold">Our Values</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="rounded-xl bg-card p-4 shadow-sm"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <value.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-semibold">{value.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-3 gap-4 rounded-xl bg-primary/5 p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">50K+</p>
              <p className="text-xs text-muted-foreground">Happy Customers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">100+</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">500+</p>
              <p className="text-xs text-muted-foreground">Cities Served</p>
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <h3 className="mb-3 font-semibold">Get in Touch</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>📧 hello@crunchx.in</p>
              <p>📞 1800-XXX-XXXX (Toll Free)</p>
              <p>📍 Bengaluru, Karnataka, India</p>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
