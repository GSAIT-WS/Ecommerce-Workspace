import { Button } from "@/components/ui/button";
import offerBanner from "@/assets/offer-banner.jpg";

const OffersSection = () => (
  <section className="bg-muted/50 py-16 md:py-20">
    <div className="container mx-auto px-4 md:px-8">
      <div className="mb-10 text-center">
        <h2 className="mb-2 font-display text-3xl font-bold text-foreground md:text-4xl">
          Offers & Combos
        </h2>
        <p className="font-body text-muted-foreground">Grab value packs and save more on your favourites</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Offer Banner */}
        <div className="relative overflow-hidden rounded-2xl shadow-md md:col-span-2">
          <img src={offerBanner} alt="Combo deal" className="h-64 w-full object-cover md:h-80" />
          <div className="absolute inset-0 flex items-center bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent p-8 md:p-12">
            <div>
              <span className="mb-2 inline-block rounded-full bg-accent px-3 py-1 font-body text-xs font-bold text-accent-foreground">
                Limited Offer
              </span>
              <h3 className="mb-2 font-display text-2xl font-bold text-card md:text-3xl">
                Family Combo Pack
              </h3>
              <p className="mb-4 max-w-sm font-body text-sm text-card/80">
                Get 6 assorted bars + 2 trail mix packs at 30% off. Perfect for the whole family.
              </p>
              <Button className="rounded-full bg-primary px-6 font-body font-semibold text-primary-foreground hover:bg-primary/90">
                Shop Combos
              </Button>
            </div>
          </div>
        </div>

        {/* Mini offer cards */}
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-display text-2xl font-bold text-primary">
            20%
          </div>
          <div>
            <h4 className="font-body text-sm font-bold text-foreground">First Order Discount</h4>
            <p className="font-body text-xs text-muted-foreground">Use code CRUNCHFIRST at checkout</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary/10 font-display text-2xl font-bold text-secondary">
            Free
          </div>
          <div>
            <h4 className="font-body text-sm font-bold text-foreground">Free Delivery</h4>
            <p className="font-body text-xs text-muted-foreground">On all orders above ₹499 across India</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default OffersSection;
