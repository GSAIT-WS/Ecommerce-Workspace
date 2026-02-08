import { useState } from "react";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = ["Home", "Shop", "Categories", "About", "Contact"];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 md:px-8">
        {/* Logo */}
        <a href="/" className="font-display text-2xl font-extrabold tracking-tight text-primary">
          CRUNCH<span className="text-secondary">X</span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="font-body text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
            >
              {link}
            </a>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-primary">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative text-foreground/70 hover:text-primary">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              2
            </span>
          </Button>
          <Button variant="ghost" size="icon" className="hidden text-foreground/70 hover:text-primary md:flex">
            <User className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground/70 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="border-t border-border bg-card px-4 py-4 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="block py-2 font-body text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
            >
              {link}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
