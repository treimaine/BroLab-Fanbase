/**
 * Shared Framer Motion presets — the single source of truth for landing/marketing
 * (and any app) motion. Import these instead of re-declaring `fadeInUp` variants
 * inline in every component. Tweak here to restyle every animation at once.
 */
import type { Transition, Variants } from "framer-motion";

/** Signature easing curve used across the whole design system. */
export const EASE_SIGNATURE = [0.21, 0.47, 0.32, 0.98] as const;

/** Standard viewport config for scroll-triggered reveals. */
export const VIEWPORT_ONCE = { once: true, margin: "-100px" } as const;

/** Fade + rise. The default reveal for headings, paragraphs and blocks. */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_SIGNATURE },
  },
};

/** Plain opacity fade (no movement). */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: EASE_SIGNATURE },
  },
};

/** Card reveal — slightly larger rise, used for grid items. */
export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_SIGNATURE },
  },
};

/** Scale-in for hero visuals / mockups. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE_SIGNATURE },
  },
};

/** Parent container that staggers its children's `visible` state. */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

/** Gentle infinite float for decorative elements. */
export const floatTransition = (duration = 6, delay = 0): Transition => ({
  duration,
  delay,
  repeat: Infinity,
  ease: "easeInOut",
});
