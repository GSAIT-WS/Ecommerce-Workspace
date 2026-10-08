import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const testimonials = [
  { name: "Priya Sharma", rating: 5, text: "CrunchX bars are my go-to post-workout snack. Clean ingredients and amazing taste!" },
  { name: "Rahul Verma", rating: 5, text: "Finally a brand that doesn't compromise on quality. My whole family loves these." },
  { name: "Ananya Patel", rating: 5, text: "The protein bars keep me energized throughout my busy workday. Highly recommend!" },
  { name: "Vikram Joshi", rating: 4, text: "Great taste, honest nutrition. CrunchX has replaced all my unhealthy snacking habits." },
  { name: "Sneha Reddy", rating: 5, text: "I ordered the combo pack and every single item was delicious. Will order again!" },
  { name: "Arjun Nair", rating: 5, text: "Best healthy snacks I've found in India. The multigrain crunch is addictive!" },
  { name: "Meera Iyer", rating: 4, text: "Love that they use natural ingredients. My kids enjoy them as school snacks." },
  { name: "Karan Singh", rating: 5, text: "Premium quality at a fair price. CrunchX delivers what it promises every time." },
];

// Double for seamless loop
const doubled = [...testimonials, ...testimonials];

const CustomerReviews = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const offsetRef = useRef(0);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const halfWidth = el.scrollWidth / 2;
    let running = true;

    const tick = () => {
      if (!running) return;
      offsetRef.current += 0.4;
      if (offsetRef.current >= halfWidth) offsetRef.current = 0;
      el.style.transform = `translateX(-${offsetRef.current}px)`;
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, []);

  return (
    <section className="overflow-hidden border-t border-border/40 bg-background py-14 md:py-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="section-heading mb-9 md:mb-11">
          <span className="eyebrow eyebrow-centered mb-3">Real reviews</span>
          <h2 className="section-title">
            Loved by <span className="text-gradient">CrunchX Customers</span>
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
              ))}
            </div>
            <span className="font-body text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">4.9</span> from 2,400+ reviews
            </span>
          </div>
        </div>
      </div>
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
        <div
          ref={scrollRef}
          className="flex gap-4 px-4 will-change-transform md:gap-5"
          style={{ width: "max-content" }}
        >
          {doubled.map((t, i) => (
            <figure
              key={i}
              onClick={() => setSelected(selected === i ? null : i)}
              className={`card-interactive relative w-72 shrink-0 cursor-pointer rounded-2xl border p-6 shadow-card md:w-80 ${
                selected === i
                  ? "-translate-y-1 border-primary/50 bg-gradient-to-b from-card to-primary/[0.05] shadow-card-hover"
                  : "border-border/70 bg-card"
              }`}
            >
              {/* Oversized quote glyph for visual weight */}
              <span
                className="pointer-events-none absolute right-5 top-3 select-none font-display text-6xl font-black leading-none text-primary/12"
                aria-hidden
              >
                &rdquo;
              </span>
              <div className="relative mb-3.5 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${s < t.rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground/30"}`}
                  />
                ))}
              </div>
              <blockquote className="relative mb-5 font-body text-sm leading-[1.75] text-foreground/85">
                &ldquo;{t.text}&rdquo;
              </blockquote>
              <figcaption className="relative flex items-center gap-2.5 border-t border-border/60 pt-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/25 to-secondary/25 font-display text-xs font-bold text-primary">
                  {t.name.charAt(0)}
                </span>
                <span className="font-body text-xs font-bold uppercase tracking-wide text-foreground/90">
                  {t.name}
                </span>
                <span className="meta-chip ml-auto">Verified</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
