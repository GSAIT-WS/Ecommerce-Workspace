import { motion, useReducedMotion } from "framer-motion";
import { useSyncExternalStore, type ReactNode } from "react";
import { DUR, EASE, viewportOnce } from "@/lib/motion";

const COMPACT_QUERY = "(max-width: 767px)";

let compactMql: MediaQueryList | null = null;
const getCompactMql = () => (compactMql ??= window.matchMedia(COMPACT_QUERY));

const subscribeCompact = (onChange: () => void) => {
  const mql = getCompactMql();
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
};

/**
 * Read synchronously on first render (via `useSyncExternalStore`) so the reveal
 * never flashes in the wrong size on mount, then stay in sync on resize.
 */
const useCompactViewport = () =>
  useSyncExternalStore(subscribeCompact, () => getCompactMql().matches, () => false);

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Upward travel in px. Defaults are trimmed on narrow viewports. */
  distance?: number;
  duration?: number;
  delay?: number;
  /** Fraction of the element that must be visible before it reveals. */
  amount?: number;
  /** Play again every time the element re-enters the viewport. */
  repeat?: boolean;
};

/**
 * Fades a block of content in and lets it settle as it enters the viewport.
 *
 * Only `opacity` and `transform` are animated, so this never triggers layout or
 * paint — it runs entirely on the compositor. Under `prefers-reduced-motion` it
 * renders plain markup with no motion at all.
 *
 * IMPORTANT: wrap whole *sections*, never individual grid items. A wrapper `<div>`
 * around a grid child becomes the grid item instead of the card, which breaks
 * `align-items: stretch` and makes cards in a row different heights. To stagger
 * tiles, convert the existing grid-item elements to `motion.div` in place and
 * drive them with `staggerContainer` + `revealTile` from `@/lib/motion`.
 */
export function Reveal({
  children,
  className,
  distance,
  duration,
  delay = 0,
  amount = 0.15,
  repeat = false,
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const compact = useCompactViewport();

  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance ?? (compact ? 14 : 20) }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce(amount)}
      transition={{
        duration: duration ?? (compact ? 0.5 : DUR.reveal),
        delay,
        /* `settle` — a ~4% overshoot so the block eases up, kisses past its
           resting place and drifts back. This is what makes the reveal read as
           "settling" rather than "sliding to a stop". */
        ease: EASE.settle,
      }}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
