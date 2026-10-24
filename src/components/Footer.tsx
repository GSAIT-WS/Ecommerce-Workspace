import { Instagram, Facebook, Twitter, Youtube, Sprout } from "lucide-react";
import Reveal from "@/components/motion/Reveal";

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com/purvita", label: "PURVITA on Instagram" },
  { icon: Facebook, href: "https://facebook.com/purvita", label: "PURVITA on Facebook" },
  { icon: Twitter, href: "https://twitter.com/purvita", label: "PURVITA on Twitter" },
  { icon: Youtube, href: "https://youtube.com/@purvita", label: "PURVITA on YouTube" },
];

const Footer = () => (
  <footer className="relative overflow-hidden bg-brand-deep text-brand-cream">
    <div
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_70%_at_0%_0%,hsl(var(--brand-purple)/0.65),transparent_62%),radial-gradient(ellipse_50%_65%_at_100%_100%,hsl(var(--brand-green)/0.1),transparent_58%)]"
      aria-hidden
    />
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/55 to-transparent"
      aria-hidden
    />

    <div className="container relative mx-auto px-4 py-14 md:px-8 md:py-16">
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.45fr_0.8fr_1fr_1fr] lg:gap-8">
        <div>
          <a href="/" className="group inline-flex items-center gap-2.5" aria-label="PURVITA home">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-cream/15 bg-brand-cream/10 text-brand-green transition-transform duration-300 ease-smooth group-hover:-rotate-6"
              aria-hidden
            >
              <Sprout className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <span className="flex flex-col">
              <span className="font-brand text-[1.65rem] font-semibold leading-none tracking-[0.07em] text-brand-cream">
                PURVITA
              </span>
              <span className="mt-1 font-brand text-[9px] font-medium uppercase leading-none tracking-[0.18em] text-brand-green">
                Goodness from the Roots
              </span>
            </span>
          </a>
          <p className="mt-5 max-w-xs font-body text-sm leading-relaxed text-brand-cream/65">
            Rooted in India&apos;s food heritage, PURVITA brings traditional chikki flavours to
            today&apos;s generation.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-body text-[11px] font-bold uppercase tracking-[0.18em] text-brand-green">
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
                  className="font-body text-sm text-brand-cream/70 transition-colors duration-200 hover:text-brand-gold"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-body text-[11px] font-bold uppercase tracking-[0.18em] text-brand-green">
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
                  className="font-body text-sm text-brand-cream/70 transition-colors duration-200 hover:text-brand-gold"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-body text-[11px] font-bold uppercase tracking-[0.18em] text-brand-green">
            Follow Us
          </h4>
          <div className="flex gap-2.5">
            {socialLinks.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="group flex h-10 w-10 items-center justify-center rounded-xl border border-brand-cream/15 bg-brand-cream/5 text-brand-cream transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-brand-gold hover:bg-brand-gold hover:text-brand-deep"
              >
                <social.icon className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:scale-110" />
              </a>
            ))}
          </div>
          <a
            href="mailto:contact@purvita.in"
            className="mt-5 inline-block font-body text-sm font-medium text-brand-cream/75 underline decoration-brand-cream/20 underline-offset-4 transition-colors duration-200 hover:text-brand-gold hover:decoration-brand-gold/40"
          >
            contact@purvita.in
          </a>
        </div>
      </div>

      <Reveal distance={8} amount={0.15} delay={0.08}>
        <div className="mt-12 flex flex-col items-center gap-3 border-t border-brand-cream/10 pt-7 md:flex-row md:justify-between">
          <p className="text-center font-body text-xs text-brand-cream/55 md:text-left">
            © 2026 PURVITA. All rights reserved. A product of Giri Sree Agro Industries Pvt. Ltd.
          </p>
          <p className="font-brand text-sm italic text-brand-green">Goodness from the Roots</p>
        </div>
      </Reveal>
    </div>
  </footer>
);

export default Footer;
