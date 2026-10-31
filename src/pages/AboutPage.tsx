import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AboutPage = ({ embedded = false }: { embedded?: boolean }) => (
  <div className="min-h-screen bg-background">
    {!embedded && <Navbar />}

    <main
      id={embedded ? "about" : undefined}
      className={`relative isolate overflow-hidden px-4 py-10 md:py-16 ${
        embedded ? "scroll-mt-28" : ""
      }`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(ellipse_65%_75%_at_50%_0%,hsl(var(--primary)/0.08),transparent_68%)]"
        aria-hidden
      />
      <div className="mx-auto max-w-4xl">
        {!embedded && (
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        )}

        <article className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-border/70 bg-card/80 px-6 py-9 shadow-card sm:px-10 sm:py-12 md:mt-14 md:px-16 md:py-16">
          <header className="mb-8 border-b border-border/70 pb-7 sm:mb-10 sm:pb-9">
            <p className="mb-3 font-brand text-xs font-bold uppercase tracking-[0.2em] text-primary/75">
              PURVITA
            </p>
            <h1 className="font-brand text-4xl font-semibold leading-tight tracking-[-0.035em] text-foreground sm:text-5xl md:text-6xl">
              Our Story
            </h1>
          </header>

          <div className="space-y-6 font-brand text-base leading-[1.9] text-foreground/80 sm:space-y-7 sm:text-lg sm:leading-[1.95]">
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

          <p className="mt-9 font-brand text-xl font-semibold italic leading-snug text-primary sm:mt-11 sm:text-2xl">
            PURVITA — Goodness from the Roots.
          </p>
        </article>
      </div>
    </main>

    {!embedded && <Footer />}
  </div>
);

export default AboutPage;
