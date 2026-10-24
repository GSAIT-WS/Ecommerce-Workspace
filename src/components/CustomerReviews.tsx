import { Star } from "lucide-react";
import { useState } from "react";
import Reveal from "@/components/motion/Reveal";

const testimonials = [
  { name: "Priya Sharma", rating: 5, text: "PURVITA bars are my go-to post-workout snack. Clean ingredients and amazing taste!" },
  { name: "Rahul Verma", rating: 5, text: "Finally a brand that doesn't compromise on quality. My whole family loves these." },
  { name: "Ananya Patel", rating: 5, text: "The protein bars keep me energized throughout my busy workday. Highly recommend!" },
  { name: "Vikram Joshi", rating: 4, text: "Great taste, honest nutrition. PURVITA has replaced all my unhealthy snacking habits." },
  { name: "Sneha Reddy", rating: 5, text: "I ordered the combo pack and every single item was delicious. Will order again!" },
  { name: "Arjun Nair", rating: 5, text: "Best healthy snacks I've found in India. The multigrain crunch is addictive!" },
  { name: "Meera Iyer", rating: 4, text: "Love that they use natural ingredients. My kids enjoy them as school snacks." },
  { name: "Karan Singh", rating: 5, text: "Premium quality at a fair price. PURVITA delivers what it promises every time." },
];

const CustomerReviews = () => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section className="overflow-hidden border-t border-border/50 bg-surface-cream/20 py-14 dark:bg-background md:py-20">
      <div className="container mx-auto px-4 md:px-8">
        <Reveal distance={14} amount={0.2}>
          <div className="section-heading mb-9 md:mb-11">
            <span className="eyebrow eyebrow-centered mb-3">Real reviews</span>
            <h2 className="section-title">Loved by PURVITA Customers</h2>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="flex gap-0.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <span className="font-body text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">4.9</span> from 2,400+ reviews
              </span>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal distance={12} amount={0.1}>
        <div className="relative">
          {/* Edge fades so cards dissolve into the page instead of being cut off */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent md:w-28"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent md:w-28"
            aria-hidden
          />

          {/*
            Marquee runs entirely on the compositor via the `marquee` keyframe.
            The list is duplicated and the track translates -50%, so the second
            copy lands exactly where the first began — a seamless loop with no
            JS, no per-frame layout reads, and identical speed on 60Hz and 120Hz
            displays. `.marquee-track` pauses it on hover/focus, and the reduced
            motion block in index.css switches it off entirely.
          */}
          <div
            className="marquee-track flex w-max animate-marquee"
            style={{ willChange: "transform" }}
          >
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="flex shrink-0 gap-4 px-4 md:gap-5"
                aria-hidden={copy === 1}
              >
                {testimonials.map((t, i) => {
                  const index = copy * testimonials.length + i;
                  return (
                    <figure
                      key={`${copy}-${i}`}
                      onClick={() => setSelected(selected === index ? null : index)}
                      className={`card-interactive relative w-72 shrink-0 cursor-pointer rounded-[1.5rem] border p-6 shadow-card md:w-80 ${
                        selected === index
                          ? "-translate-y-1 border-primary/40 bg-gradient-to-b from-card to-surface-purple/50 shadow-card-hover"
                          : "border-border/70 bg-card"
                      }`}
                    >
                      <span
                        className="pointer-events-none absolute right-5 top-2 select-none font-brand text-6xl font-semibold leading-none text-primary/10"
                        aria-hidden
                      >
                        &rdquo;
                      </span>
                      <div className="relative mb-3.5 flex gap-0.5" aria-label={`Rated ${t.rating} out of 5`}>
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star
                            key={s}
                            className={`h-4 w-4 ${s < t.rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground/30"}`}
                            aria-hidden
                          />
                        ))}
                      </div>
                      <blockquote className="relative mb-5 font-body text-sm leading-[1.75] text-foreground/85">
                        &ldquo;{t.text}&rdquo;
                      </blockquote>
                      <figcaption className="relative flex items-center gap-2.5 border-t border-border/60 pt-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/25 font-body text-xs font-bold text-primary">
                          {t.name.charAt(0)}
                        </span>
                        <span className="font-body text-xs font-bold uppercase tracking-wide text-foreground/90">
                          {t.name}
                        </span>
                        <span className="meta-chip ml-auto">Verified</span>
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default CustomerReviews;
