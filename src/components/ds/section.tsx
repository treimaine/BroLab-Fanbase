import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const sectionVariants = cva(
  "relative bg-background transition-colors duration-300",
  {
    variants: {
      spacing: {
        /* Full landing rhythm (py-32). */
        default: "px-4 py-section md:px-6",
        /* Compact CTA band. */
        compact: "px-4 py-20 md:px-6",
        /* No vertical padding — caller controls it. */
        none: "px-4 md:px-6",
      },
      overflow: {
        clip: "overflow-hidden",
        visible: "",
      },
    },
    defaultVariants: {
      spacing: "default",
      overflow: "clip",
    },
  }
);

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  /** Wrap children in the centered `max-w-7xl` container (default true). */
  container?: boolean;
  /** Constrain the inner container width. */
  size?: "default" | "narrow" | "prose";
  /** Optional decorative/background layer rendered behind the content. */
  backdrop?: React.ReactNode;
}

const containerSizes = {
  default: "max-w-7xl",
  narrow: "max-w-3xl",
  prose: "max-w-2xl",
} as const;

/**
 * Standard page section: consistent background, vertical rhythm and centered
 * container. Replaces the repeated
 * `<section className="relative bg-background px-4 py-32 …">` wrapper.
 */
export function Section({
  className,
  spacing,
  overflow,
  container = true,
  size = "default",
  backdrop,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(sectionVariants({ spacing, overflow }), className)}
      {...props}
    >
      {backdrop}
      {container ? (
        <div
          className={cn(
            "relative z-10 mx-auto w-full",
            containerSizes[size]
          )}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}
