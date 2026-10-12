import type { Variants } from "framer-motion";

/** framer-motion's `BezierDefinition` shape (a mutable 4-point tuple). */
type Bezier = [number, number, number, number];

/**
 * Shared easing curves for every JS-driven animation in the app.
 *
 * - `smooth` is the existing house curve — the same value as the `ease-smooth`
 *   Tailwind token, so JS and CSS motion feel identical.
 * - `settle` is `smooth` plus a barely-there ~4% overshoot. Reserved for the
 *   moments where something "lands" (a section settling into place, a tile
 *   finishing its rise) — deliberately not used for hovers or anything frequent.
 * - `exit` is a short deceleration curve for things leaving the screen.
 */
export const EASE: { smooth: Bezier; settle: Bezier; exit: Bezier } = {
  smooth: [0.22, 1, 0.36, 1],
  settle: [0.34, 1.22, 0.64, 1],
  exit: [0.4, 0, 1, 1],
};

/** Durations in seconds (framer-motion's convention). */
export const DUR = {
  quick: 0.22,
  base: 0.4,
  reveal: 0.72,
  slow: 0.9,
} as const;

/**
 * Shared `whileInView` preset.
 *
 * `once` disconnects the IntersectionObserver after it fires, so reveals cost
 * nothing once they've played. The small negative bottom margin holds the
 * reveal back until the block is genuinely inside the viewport, which stops
 * sections from animating while they are still off the bottom edge.
 */
export const viewportOnce = (amount = 0.15, margin = "0px 0px -10% 0px") =>
  ({ once: true as const, amount, margin });

/** Fade + rise for a full section-sized block. */
export const revealItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.reveal, ease: EASE.settle },
  },
};

/**
 * Fade + slightly shorter rise for small tiles inside a section.
 * `settle` adds a whisper of overshoot so a row of cards finishes its rise with
 * a soft settle instead of simply stopping.
 */
export const revealTile: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.base + 0.18, ease: EASE.settle },
  },
};

/**
 * Parent variants that hand `hidden` → `show` down to staggered children.
 * Only use with children that are already motion components — see the note in
 * `components/motion/Reveal.tsx` about not wrapping grid items.
 */
export const staggerContainer =
  (staggerChildren = 0.08, delayChildren = 0.04): Variants => ({
    hidden: {},
    show: { transition: { staggerChildren, delayChildren } },
  });
