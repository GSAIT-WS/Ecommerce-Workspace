import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Leaf, Wheat } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const brandPillars = [
  {
    icon: Wheat,
    title: "Rooted in tradition",
    description: "Inspired by the flavours and food heritage we grew up with.",
  },
  {
    icon: Leaf,
    title: "A fresh perspective",
    description: "Familiar ingredients brought together for today.",
  },
  {
    icon: Heart,
    title: "Made for little joys",
    description: "Simple, feel-good moments in every bite.",
  },
];

const AboutPage = ({ embedded = false }: { embedded?: boolean }) => (
  <div className="min-h-screen bg-background">
    {!embedded && <Navbar />}

    <main
      id={embedded ? "about" : undefined}
      className={`relative isolate overflow-hidden px-4 py-8 sm:px-6 md:py-12 ${
        embedded ? "scroll-mt-28" : ""
      }`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem] bg-[radial-gradient(ellipse_65%_75%_at_50%_0%,hsl(var(--primary)/0.09),transparent_68%)]"
        aria-hidden
      />
      <div className="mx-auto max-w-6xl">
        {!embedded && (
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        )}

        <article className="mx-auto mt-5 max-w-5xl overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/90 shadow-card sm:mt-7 sm:rounded-[2rem]">
          <div className="relative overflow-hidden border-b border-border/70 bg-[linear-gradient(110deg,hsl(var(--surface-green)/0.8),hsl(var(--card))_54%,hsl(var(--surface-purple)/0.8))] px-6 py-7 sm:px-9 sm:py-8 md:px-12">
            <div className="pointer-events-none absolute -right-8 -top-20 h-52 w-52 rounded-full border-[24px] border-primary/[0.04]" aria-hidden />
            <p className="mb-2 inline-flex items-center gap-2 font-body text-[11px] font-bold uppercase tracking-[0.2em] text-brand-green-deep">
              <Leaf className="h-4 w-4" aria-hidden="true" />
              The roots of PURVITA
            </p>
            <h1 className="font-brand text-4xl font-semibold leading-tight tracking-[-0.035em] text-foreground sm:text-5xl md:text-[3.5rem]">
              Our Story
            </h1>
            <p className="mt-2 max-w-xl font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
              Familiar flavours, thoughtful ingredients and a little goodness from our roots.
            </p>
          </div>

          <div className="grid gap-6 p-5 sm:gap-8 sm:p-8 md:grid-cols-[1.35fr_0.85fr] md:gap-10 md:p-10">
            <div className="flex flex-col justify-center">
              <div className="space-y-4 font-brand text-base leading-[1.8] text-foreground/80 sm:space-y-5 sm:text-lg">
                <p>
                  At PURVITA, we believe that some of life’s best things come from our roots.
                  Inspired by India’s rich food traditions, we bring together familiar flavours,
                  thoughtfully chosen ingredients and a fresh perspective on everyday eating.
                </p>
                <p>
                  Our journey begins with chikki—a much-loved Indian treat reimagined with
                  traditional grains and delicious combinations. We aim to bring the tastes we
                  grew up with into the lives of today’s generation, creating simple moments of
                  joy with every bite.
                </p>
                <p>
                  As we grow, our commitment remains the same: celebrating our food heritage
                  while creating products that fit today’s lifestyles.
                </p>
              </div>
              <p className="mt-5 border-t border-border/70 pt-4 font-brand text-lg font-semibold italic leading-snug text-primary sm:mt-6 sm:pt-5 sm:text-xl">
                PURVITA — Goodness from the Roots.
              </p>
            </div>

            <aside className="relative overflow-hidden rounded-2xl border border-primary/10 bg-[linear-gradient(145deg,hsl(var(--surface-purple)),hsl(var(--surface-cream))_58%,hsl(var(--surface-yellow)))] p-5 sm:p-6">
              <div className="pointer-events-none absolute -bottom-12 -right-10 h-40 w-40 rounded-full bg-secondary/10 blur-2xl" aria-hidden />
              <div className="relative">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-full border border-primary/10 bg-card/80 text-primary shadow-sm">
                  <Leaf className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="font-brand text-xl font-semibold text-foreground sm:text-2xl">
                  Goodness, grounded.
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  What we believe in, in every bite.
                </p>
                <ul className="mt-5 space-y-3">
                  {brandPillars.map(({ icon: Icon, title, description }) => (
                    <li key={title} className="flex gap-3 rounded-xl border border-border/60 bg-card/65 p-3">
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-green text-brand-green-deep">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block font-body text-sm font-bold text-foreground">{title}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{description}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </article>
      </div>
    </main>

    {!embedded && <Footer />}
  </div>
);

export default AboutPage;
