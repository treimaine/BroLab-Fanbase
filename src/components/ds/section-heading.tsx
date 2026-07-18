"use client";

import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import * as React from "react";
import { Eyebrow, type EyebrowProps } from "./eyebrow";
import { Reveal } from "./reveal";

/**
 * Inline highlight for headings — the recurring italic-primary emphasis
 * (`<span className="italic text-primary">`). Compose it inside `title`:
 * `title={<>Artists <Highlight>love it.</Highlight></>}`.
 */
export function Highlight({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("italic text-primary", className)} {...props} />
  );
}

interface SectionHeadingProps {
  /** Optional pill above the title. */
  eyebrow?: React.ReactNode;
  eyebrowProps?: EyebrowProps;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "left";
  /** Extra classes on the wrapper. */
  className?: string;
  /** Bottom margin (defaults to the standard header gap). */
  spacing?: "default" | "tight" | "none";
}

const spacingMap = {
  default: "mb-16 md:mb-20",
  tight: "mb-10",
  none: "",
} as const;

/**
 * Standard section header: optional eyebrow, serif title (with `<Highlight>`
 * support) and muted subtitle — animated with the shared stagger/fade presets.
 * Replaces the copy-pasted `<h2 className="font-serif text-4xl …">` blocks.
 */
export function SectionHeading({
  eyebrow,
  eyebrowProps,
  title,
  subtitle,
  align = "center",
  className,
  spacing = "default",
}: SectionHeadingProps) {
  return (
    <Reveal
      variants={staggerContainer}
      className={cn(
        spacingMap[spacing],
        align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      {eyebrow && (
        <Reveal variants={fadeInUp} className="mb-6">
          <Eyebrow {...eyebrowProps}>{eyebrow}</Eyebrow>
        </Reveal>
      )}

      <Reveal
        as="h2"
        variants={fadeInUp}
        className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
      >
        {title}
      </Reveal>

      {subtitle && (
        <Reveal
          as="p"
          variants={fadeInUp}
          className={cn(
            "mt-6 text-lg text-muted-foreground",
            align === "center" ? "mx-auto max-w-xl" : "max-w-lg"
          )}
        >
          {subtitle}
        </Reveal>
      )}
    </Reveal>
  );
}
