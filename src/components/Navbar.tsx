import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ShoppingCart, User, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchOverlay from "@/components/SearchOverlay";
import ThemeToggle from "@/components/ThemeToggle";
import DeliveryLocationChip from "@/components/address/DeliveryLocationChip";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { EASE } from "@/lib/motion";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Shop", href: "/search" },
  { label: "Categories", href: "/categories" },
  { label: "My Orders", href: "/orders" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { items: cartItems } = useCart();
  const { user, logout } = useAuth();
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  /** Header gains a little depth once the page has moved — toggles a boolean
      rather than a scroll value, so it never re-renders mid-scroll. */
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <header
        className={`group/nav sticky top-0 z-50 border-b backdrop-blur-xl transition-[box-shadow,background-color,border-color] duration-300 ease-smooth ${
          scrolled
            ? "border-border bg-background/80 shadow-[0_1px_0_0_hsl(var(--primary)/0.08),0_12px_28px_-20px_hsl(var(--foreground)/0.5)] supports-[backdrop-filter]:bg-background/70"
            : "border-border/60 bg-background/90 shadow-[0_1px_0_0_hsl(var(--primary)/0.06),0_8px_24px_-18px_hsl(var(--foreground)/0.35)] supports-[backdrop-filter]:bg-background/75"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-3 md:px-8">

          {/* Left: Logo + Delivery chip (desktop) */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="group flex items-center gap-2.5 font-display text-2xl font-extrabold tracking-[-0.035em] text-primary"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-sm font-black text-primary-foreground shadow-md shadow-primary/30 ring-1 ring-inset ring-white/30 transition-transform duration-300 ease-smooth group-hover:scale-105 group-hover:-rotate-3"
                aria-hidden
              >
              PV
              </span>
              PURVITA
            </Link>

            {/* Delivery location chip — only on desktop */}
            {user && (
              <div className="hidden md:block">
                <DeliveryLocationChip />
              </div>
            )}
          </div>

          {/* Centre: Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                data-active={location.pathname === link.href}
                className={`link-underline font-body text-sm font-semibold tracking-[-0.01em] ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-foreground/70 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Icons */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/70 transition-all duration-300 ease-in-out hover:text-primary [&_svg]:transition-transform [&_svg]:duration-300 [&_svg]:ease-in-out hover:[&_svg]:scale-110"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative text-foreground/70 transition-all duration-300 ease-in-out hover:text-primary [&_svg]:transition-transform [&_svg]:duration-300 [&_svg]:ease-in-out hover:[&_svg]:scale-110"
              asChild
            >
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span
                    key={cartCount}
                    className="absolute -right-0.5 -top-0.5 flex h-[1.15rem] min-w-[1.15rem] animate-badge-pop items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary px-1 text-[10px] font-bold leading-none text-primary-foreground shadow-sm shadow-primary/40 ring-2 ring-background"
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </Button>

            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden text-foreground/70 transition-all duration-300 ease-in-out hover:text-primary md:flex [&_svg]:transition-transform [&_svg]:duration-300 [&_svg]:ease-in-out hover:[&_svg]:scale-110"
                  asChild
                >
                  <Link to="/profile">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden text-foreground/70 transition-all duration-300 ease-in-out hover:text-destructive md:flex [&_svg]:transition-transform [&_svg]:duration-300 [&_svg]:ease-in-out hover:[&_svg]:scale-110"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="hidden text-foreground/70 transition-all duration-300 ease-in-out hover:text-primary md:flex"
                asChild
              >
                <Link to="/login">Sign In</Link>
              </Button>
            )}

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/70 md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Announcement strip — thin gold bar reinforcing the brand promise */}
      <div className="hidden overflow-hidden border-b border-primary/15 bg-gradient-to-r from-primary/12 via-accent/10 to-secondary/12 md:block">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex h-9 items-center justify-center gap-6 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/75">
            <span className="inline-flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-primary" aria-hidden />
              Free shipping over ₹499
            </span>
            <span className="hidden h-3 w-px bg-border lg:block" aria-hidden />
            <span className="hidden lg:inline">Farm sourced in Lambasingi, Andhra Pradesh</span>
            <span className="hidden h-3 w-px bg-border lg:block" aria-hidden />
            <span className="hidden lg:inline">100% Natural · No Preservatives</span>
          </div>
        </div>
      </div>

        {/* ── Mobile Drawer ── */}
        {/* Height + opacity so it eases open and closes again, instead of
            popping into place with a bare fade. */}
        <AnimatePresence initial={false}>
          {mobileOpen && (
          <motion.nav
            key="mobile-drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: EASE.smooth }}
            style={{ overflow: "hidden" }}
            /* `will-change` only while open — a permanent hint on a full-width
               sticky header costs memory for nothing. */
            className="border-t border-border/70 bg-background/95 px-4 py-4 backdrop-blur-xl md:hidden"
          >

            {/* Delivery chip in mobile menu */}
            {user && (
              <div className="mb-3 pb-3 border-b border-border">
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Delivery location
                </p>
                <DeliveryLocationChip
                  compact
                  onInteract={() => setMobileOpen(false)}
                />
              </div>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2.5 font-body text-sm font-semibold transition-all duration-300 ease-smooth hover:bg-muted/70 hover:text-primary ${
                  location.pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/75"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-2 border-t border-border pt-2">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="block py-2 font-body text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="block py-2 font-body text-sm font-medium text-destructive transition-colors hover:text-destructive/80"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 font-body text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Navbar;
