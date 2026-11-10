import { motion, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { EASE } from "@/lib/motion";

/**
 * Wraps every route in a gentle 180ms fade on route change.
 *
 * The fade uses opacity only — no transform, no height, no scale — so sticky
 * headers, sticky filter bars and scroll position are unaffected. Keyed on
 * `pathname` so in-page changes that only touch search params don't replay it.
 */
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: EASE.smooth }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
