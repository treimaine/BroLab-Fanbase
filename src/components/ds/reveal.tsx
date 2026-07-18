"use client";

import { fadeInUp, VIEWPORT_ONCE } from "@/lib/motion";
import { motion, type Variants } from "framer-motion";
import * as React from "react";

type MotionTag = "div" | "section" | "h1" | "h2" | "h3" | "p" | "span" | "li" | "ul";

interface RevealProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
  /** Underlying element/tag to render (default `div`). */
  as?: MotionTag;
  /** Animation variants. Defaults to `fadeInUp`. */
  variants?: Variants;
  /** Convenience delay (seconds) applied on top of the variants transition. */
  delay?: number;
  /** Animate on scroll-into-view (default) or immediately on mount. */
  trigger?: "in-view" | "mount";
}

/**
 * Standard scroll-reveal wrapper. Replaces the ad-hoc
 * `motion.div initial="hidden" whileInView="visible"` blocks duplicated across
 * the landing page. Use `<Reveal>` for headings/paragraphs and pass
 * `variants={staggerContainer}` on a parent to orchestrate children.
 */
export const Reveal = React.forwardRef<HTMLElement, RevealProps>(
  (
    {
      as = "div",
      variants = fadeInUp,
      delay,
      trigger = "in-view",
      transition,
      ...props
    },
    ref
  ) => {
    const MotionTag = motion[as] as typeof motion.div;

    const animationProps =
      trigger === "mount"
        ? { initial: "hidden" as const, animate: "visible" as const }
        : {
            initial: "hidden" as const,
            whileInView: "visible" as const,
            viewport: VIEWPORT_ONCE,
          };

    return (
      <MotionTag
        ref={ref as React.Ref<HTMLDivElement>}
        variants={variants}
        transition={delay !== undefined ? { delay, ...transition } : transition}
        {...animationProps}
        {...props}
      />
    );
  }
);
Reveal.displayName = "Reveal";
