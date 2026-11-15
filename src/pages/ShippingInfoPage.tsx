import { Link } from "react-router-dom";
import { ArrowLeft, Truck, MapPin, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FREE_SHIPPING_THRESHOLD, STANDARD_DELIVERY_FEE } from "@/lib/shipping";

const ShippingInfoPage = () => {
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
              Shipping Information
            </h1>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Learn about our delivery options and timelines
            </p>
          </section>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Truck, title: "Fast Delivery", desc: "2-3 business days for metro cities" },
              { icon: MapPin, title: "Pan-India", desc: "We ship across India" },
              { icon: Clock, title: "On-Time", desc: "Track your order in real-time" },
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
                <h3 className="mb-2 font-semibold text-foreground">Delivery Timeline</h3>
                <ul className="space-y-2 list-disc pl-5">
                  <li>Metro cities (Delhi, Mumbai, Bangalore, Hyderabad): 2-3 business days</li>
                  <li>Tier 2 cities: 4-5 business days</li>
                  <li>Tier 3 cities and rural areas: 5-7 business days</li>
                  <li>Orders placed on weekends are processed on Monday</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">Shipping Charges</h3>
                <p>
                  Free shipping on orders of ₹{FREE_SHIPPING_THRESHOLD} and above. Orders below ₹
                  {FREE_SHIPPING_THRESHOLD} are charged ₹{STANDARD_DELIVERY_FEE} as shipping fee.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">Shipping Coverage</h3>
                <p>
                  We deliver to all Indian cities and most pin codes. Some remote areas may have restricted delivery.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">Order Tracking</h3>
                <p>
                  Once your order ships, you'll receive a tracking link via email and SMS to monitor your delivery in real-time.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">Delivery Issues</h3>
                <p>
                  If your delivery is delayed, contact our support team at admin@purvita.in with your order ID.
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

export default ShippingInfoPage;
