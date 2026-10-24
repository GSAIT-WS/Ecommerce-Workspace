import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ShoppingCart, User, Menu, X, LogOut, Sprout } from "lucide-react";
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
        className={`group/nav sticky top-0 z-50 border-b border-border/70 transition-[box-shadow,background-color,border-color] duration-300 ease-smooth ${
          scrolled
            ? "bg-background/95 shadow-[0_12px_30px_-24px_hsl(var(--primary)/0.45)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/90"
            : "bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/88"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4 md:px-8">
          {/* Left: brand + delivery chip (wide screens) */}
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/"
              aria-label="PURVITA home"
              className="group flex min-w-0 items-center gap-2"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-secondary/30 bg-secondary/10 text-secondary transition-transform duration-300 ease-smooth group-hover:-rotate-6 group-hover:scale-105 sm:h-10 sm:w-10"
                aria-hidden
              >
                <Sprout className="h-[1.15rem] w-[1.15rem] sm:h-5 sm:w-5" strokeWidth={1.8} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="font-brand text-[1.3rem] font-semibold leading-none tracking-[0.07em] text-primary sm:text-[1.55rem]">
                  PURVITA
                </span>
                <span className="mt-1 whitespace-nowrap font-brand text-[7px] font-medium uppercase leading-none tracking-[0.16em] text-brand-green-deep dark:text-secondary sm:text-[9px] sm:tracking-[0.18em]">
                  Goodness from the Roots
                </span>
              </span>
            </Link>

            {user && (
              <div className="hidden xl:block">
                <DeliveryLocationChip />
              </div>
            )}
          </div>

          {/* Centre: desktop navigation */}
          <nav aria-label="Primary" className="hidden items-center gap-5 lg:flex xl:gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                data-active={location.pathname === link.href}
                className={`link-underline font-body text-[13px] font-semibold tracking-[0.01em] ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-foreground/70 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: actions */}
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/70 transition-all duration-300 ease-in-out hover:text-primary [&_svg]:transition-transform [&_svg]:duration-300 [&_svg]:ease-in-out hover:[&_svg]:scale-110"
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative text-foreground/70 transition-all duration-300 ease-in-out hover:text-primary [&_svg]:transition-transform [&_svg]:duration-300 [&_svg]:ease-in-out hover:[&_svg]:scale-110"
              asChild
            >
              <Link
                to="/cart"
                aria-label={`Cart${cartCount > 0 ? `, ${cartCount} item${cartCount === 1 ? "" : "s"}` : ", empty"}`}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span
                    key={cartCount}
                    className="absolute -right-0.5 -top-0.5 flex h-[1.15rem] min-w-[1.15rem] animate-badge-pop items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-accent-foreground shadow-sm ring-2 ring-background"
                    aria-hidden
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
                  <Link to="/profile" aria-label="My profile">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden text-foreground/70 transition-all duration-300 ease-in-out hover:text-destructive md:flex [&_svg]:transition-transform [&_svg]:duration-300 [&_svg]:ease-in-out hover:[&_svg]:scale-110"
                  onClick={handleLogout}
                  aria-label="Log out"
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
              className="text-foreground/70 lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Announcement strip */}
        <div className="hidden overflow-hidden border-t border-border/50 bg-surface-cream/60 md:block dark:bg-surface-cream/30">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex h-8 items-center justify-center gap-5 font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/80">
              <span className="inline-flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-secondary" aria-hidden />
                Free shipping over ₹499
              </span>
              <span className="hidden h-3 w-px bg-border lg:block" aria-hidden />
              <span className="hidden lg:inline">Farm sourced in Lambasingi, Andhra Pradesh</span>
              <span className="hidden h-3 w-px bg-border lg:block" aria-hidden />
              <span className="hidden lg:inline">100% Natural · No Preservatives</span>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence initial={false}>
          {mobileOpen && (
            <motion.nav
              id="mobile-navigation"
              key="mobile-drawer"
              aria-label="Mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.26, ease: EASE.smooth }}
              style={{ overflow: "hidden" }}
              className="border-t border-border/70 bg-background/95 px-3 py-3 backdrop-blur-xl lg:hidden"
            >
              {user && (
                <div className="mb-3 border-b border-border pb-3">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Delivery location
                  </p>
                  <DeliveryLocationChip compact onInteract={() => setMobileOpen(false)} />
                </div>
              )}

              <div className="grid gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={location.pathname === link.href ? "page" : undefined}
                    className={`rounded-xl px-3 py-2.5 font-body text-sm font-semibold transition-all duration-300 ease-smooth ${
                      location.pathname === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/75 hover:bg-muted/70 hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-3 border-t border-border pt-3">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 font-body text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                      className="block px-3 py-2 font-body text-sm font-medium text-destructive transition-colors hover:text-destructive/80"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 font-body text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
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
