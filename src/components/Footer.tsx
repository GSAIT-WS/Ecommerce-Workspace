import { motion } from "framer-motion";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { EASE, revealTile, staggerContainer, viewportOnce } from "@/lib/motion";

const Footer = () => (
  <footer className="relative overflow-hidden border-t border-border bg-gradient-to-b from-[hsl(33_42%_92%)] to-[hsl(28_50%_96%)] py-14 dark:from-muted/30 dark:to-background">
      {/* Warm corner glow so the footer has depth instead of a flat block */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_0%_0%,hsl(var(--primary)/0.12),transparent_60%),radial-gradient(ellipse_50%_60%_at_100%_100%,hsl(var(--secondary)/0.1),transparent_58%)]"
        aria-hidden
      />
      {/* Gold hairline that draws in from the centre as the footer arrives */}
      <motion.span
        className="pointer-events-none absolute inset-x-0 top-0 h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-primary/45 to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={viewportOnce(0.1)}
        transition={{ duration: 1, delay: 0.05, ease: EASE.smooth }}
        aria-hidden
      />
      <div className="container relative mx-auto px-4 md:px-8">
        {/* Columns are the grid items themselves — motion.div in place, no wrapper,
            so the existing equal-height row behaviour is unchanged. */}
        <motion.div
          variants={staggerContainer(0.09)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce(0.08)}
          className="grid gap-10 md:grid-cols-4 md:gap-8"
        >
          <motion.div variants={revealTile}>
            <a
              href="/"
              className="group inline-flex items-center gap-2.5 font-display text-xl font-extrabold tracking-[-0.035em] text-primary"
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-[11px] font-black text-primary-foreground shadow-md shadow-primary/25 ring-1 ring-inset ring-white/30 transition-transform duration-300 ease-smooth group-hover:-rotate-3"
                aria-hidden
              >
                PV
              </span>
              PURVITA
            </a>
            <p className="mt-4 max-w-xs font-body text-sm leading-relaxed text-muted-foreground">
              Premium multigrain snacks &amp; protein bars sourced from Lambasingi farms. Farm to fork nutrition.
            </p>
            {/* Newsletter-style value prop chip */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.07] px-3.5 py-2">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-primary" aria-hidden />
              <span className="font-body text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                100% natural ingredients
              </span>
            </div>
          </motion.div>
        <motion.div variants={revealTile}>
          <h4 className="mb-4 font-display text-xs font-bold uppercase tracking-[0.16em] text-foreground">
            Quick Links
          </h4>
          <ul className="space-y-2.5">
            {[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/search" },
              { label: "Categories", href: "/categories" },
              { label: "About Us", href: "/about" },
            ].map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="link-underline font-body text-sm text-muted-foreground hover:text-primary"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div variants={revealTile}>
          <h4 className="mb-4 font-display text-xs font-bold uppercase tracking-[0.16em] text-foreground">
            Policies
          </h4>
          <ul className="space-y-2.5">
            {[
              { label: "Privacy Policy", href: "/privacy-policy" },
              { label: "Terms of Service", href: "/terms-of-service" },
              { label: "Shipping Info", href: "/shipping-info" },
              { label: "Returns & Refunds", href: "/returns-refunds" },
            ].map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="link-underline font-body text-sm text-muted-foreground hover:text-primary"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div variants={revealTile}>
          <h4 className="mb-4 font-display text-xs font-bold uppercase tracking-[0.16em] text-foreground">
            Follow Us
          </h4>
          <div className="flex gap-2.5">
            {[
              { icon: Instagram, href: "https://instagram.com/purvita" },
              { icon: Facebook, href: "https://facebook.com/purvita" },
              { icon: Twitter, href: "https://twitter.com/purvita" },
              { icon: Youtube, href: "https://youtube.com/@purvita" },
            ].map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card/70 text-secondary shadow-sm transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary hover:text-primary-foreground hover:shadow-glow-sm"
              >
                <social.icon className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:scale-110" />
              </a>
            ))}
          </div>
          <a
            href="mailto:contact@purvita.in"
            className="link-underline mt-5 inline-block font-body text-xs font-semibold text-foreground/80 hover:text-primary"
          >
            contact@purvita.in
          </a>
        </motion.div>
        </motion.div>
        <Reveal distance={8} amount={0.15} delay={0.08}>
        <div className="mt-12 flex flex-col items-center gap-4 border-t border-border/70 pt-7 md:flex-row md:justify-between">
          <p className="font-body text-xs text-muted-foreground">
            © 2026 PURVITA. All rights reserved. A product of Giri Sree Agro Industries Pvt. Ltd.
          </p>
          <div className="flex items-center gap-4">
            {["Privacy", "Terms", "Shipping"].map((t) => (
              <span
                key={t}
                className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        </Reveal>
      </div>
    </footer>
);

export default Footer;
