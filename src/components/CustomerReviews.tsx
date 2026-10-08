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
    <section className="overflow-hidden border-t border-border/40 bg-background py-10 md:py-14">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="mb-6 text-center font-display text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
          Loved by CrunchX Customers
        </h2>
      </div>
      <div className="relative">
        <div ref={scrollRef} className="flex gap-4 will-change-transform" style={{ width: "max-content" }}>
          {doubled.map((t, i) => (
            <div
              key={i}
              onClick={() => setSelected(selected === i ? null : i)}
              className={`w-72 shrink-0 cursor-pointer rounded-2xl border p-5 shadow-card transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:scale-[1.02] hover:border-primary/60 hover:shadow-[0_0_24px_hsl(var(--primary)/0.45),0_0_8px_hsl(var(--primary)/0.3)] active:border-primary/80 active:shadow-[0_0_32px_hsl(var(--primary)/0.6),0_0_12px_hsl(var(--primary)/0.4)] ${
                selected === i
                  ? "border-primary/80 bg-card shadow-[0_0_32px_hsl(var(--primary)/0.6),0_0_12px_hsl(var(--primary)/0.4)]"
                  : "border-border/50 bg-card"
              }`}
            >
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${s < t.rating ? "fill-primary text-primary" : "text-muted-foreground/35"}`}
                  />
                ))}
              </div>
              <p className="mb-4 text-sm leading-[1.7] text-foreground/85">"{t.text}"</p>
              <p className="text-xs font-semibold tracking-wide text-foreground/95">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
