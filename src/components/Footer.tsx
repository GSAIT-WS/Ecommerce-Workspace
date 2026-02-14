import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card py-12">
    <div className="container mx-auto px-4 md:px-8">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <a href="/" className="font-display text-xl font-extrabold tracking-tight text-primary">
            CRUNCH<span className="text-secondary">X</span>
          </a>
          <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">
            Premium multigrain snacks & protein bars sourced from Lambasingi farms. Farm to fork nutrition.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-body text-sm font-bold text-foreground">Quick Links</h4>
          <ul className="space-y-2">
            {[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/search" },
              { label: "Categories", href: "/categories" },
              { label: "About Us", href: "/about" },
            ].map((l) => (
              <li key={l.label}>
                <a href={l.href} className="font-body text-sm text-muted-foreground transition-colors hover:text-primary">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-body text-sm font-bold text-foreground">Policies</h4>
          <ul className="space-y-2">
            {[
              { label: "Privacy Policy", href: "/privacy-policy" },
              { label: "Terms of Service", href: "/terms-of-service" },
              { label: "Shipping Info", href: "/shipping-info" },
              { label: "Returns & Refunds", href: "/returns-refunds" },
            ].map((l) => (
              <li key={l.label}>
                <a href={l.href} className="font-body text-sm text-muted-foreground transition-colors hover:text-primary">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-body text-sm font-bold text-foreground">Follow Us</h4>
          <div className="flex gap-3">
            {[
              { icon: Instagram, href: "https://instagram.com/crunchx" },
              { icon: Facebook, href: "https://facebook.com/crunchx" },
              { icon: Twitter, href: "https://twitter.com/crunchx" },
              { icon: Youtube, href: "https://youtube.com/@crunchx" },
            ].map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <p className="mt-4 font-body text-xs text-muted-foreground">contact@crunchx.in</p>
        </div>
      </div>
      <div className="mt-10 border-t border-border pt-6 text-center">
        <p className="font-body text-xs text-muted-foreground">
          © 2026 CrunchX. All rights reserved. A product of Giri Sree Agro Industries Pvt. Ltd.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
