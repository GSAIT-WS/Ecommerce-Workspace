import { motion, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { EASE } from "@/lib/motion";
import { useScrollRubberBand } from "@/hooks/useScrollRubberBand";

/**
 * Wraps every route in two things:
 *
 * 1. A gentle 180ms fade on route change. Opacity only — no transform, no
 *    height, no scale — so sticky headers, sticky filter bars and scroll
 *    position are unaffected. Keyed on `pathname` so in-page changes that only
 *    touch search params (filtering, sorting, searching) don't replay it.
 *
 * 2. The scroll rubber band (`useScrollRubberBand`), which attaches here because
 *    this is the single wrapper every page already sits inside.
 */
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const reduceMotion = useReducedMotion();
  const rubberBandRef = useScrollRubberBand<HTMLDivElement>();

  return (
    <motion.div
      key={pathname}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: EASE.smooth }}
    >
      <div ref={rubberBandRef} id="scroll-rubber-band">
        {children}
      </div>
    </motion.div>
  );
};

export default PageTransition;
