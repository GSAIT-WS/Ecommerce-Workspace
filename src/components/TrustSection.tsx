import Reveal from "@/components/motion/Reveal";

const TrustSection = () => (
  <section className="relative overflow-hidden border-y border-border/50 bg-surface-green/45 py-14 dark:bg-surface-green/55 md:py-20">
    <div
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,hsl(var(--secondary)/0.14),transparent_62%),radial-gradient(ellipse_55%_45%_at_100%_100%,hsl(var(--accent)/0.08),transparent_58%)]"
      aria-hidden
    />
    <div className="container relative mx-auto px-4 md:px-8">
      <Reveal distance={14} amount={0.2}>
        <article className="mx-auto max-w-4xl rounded-[2rem] border border-border/70 bg-card/85 px-6 py-8 shadow-card sm:px-10 sm:py-10 md:px-14 md:py-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-5 font-brand text-3xl font-semibold leading-tight tracking-[-0.03em] text-foreground sm:text-4xl md:text-5xl">
              Our Story
            </h2>
            <p className="font-brand text-base leading-[1.85] text-muted-foreground sm:text-lg sm:leading-[1.9]">
              Rooted in India’s rich food heritage, PURVITA brings traditional flavours to
              today’s generation. Starting with our delicious range of chikki, we celebrate
              the familiar tastes we love while creating new ways to enjoy them. Every
              product is a reminder that goodness never goes out of style.
            </p>
            <p className="mt-5 font-brand text-lg font-semibold italic text-primary sm:text-xl">
              PURVITA — Goodness from the Roots.
            </p>
          </div>
        </article>
      </Reveal>
    </div>
  </section>
);

export default TrustSection;
