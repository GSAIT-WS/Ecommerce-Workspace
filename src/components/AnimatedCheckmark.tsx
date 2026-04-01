import { motion } from "framer-motion";

const AnimatedCheckmark = () => (
  <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
    {/* Ripple */}
    <motion.div
      initial={{ scale: 0.6, opacity: 0.6 }}
      animate={{ scale: 1.6, opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="absolute inset-0 rounded-full bg-secondary/20"
    />
    {/* Circle */}
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.15, type: "spring", stiffness: 180, damping: 14 }}
      className="relative flex h-20 w-20 items-center justify-center rounded-full bg-secondary"
    >
      {/* SVG checkmark */}
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <motion.path
          d="M10 20L17 27L30 13"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
        />
      </svg>
    </motion.div>
  </div>
);

export default AnimatedCheckmark;
