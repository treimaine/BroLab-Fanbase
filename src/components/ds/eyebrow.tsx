import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const eyebrowVariants = cva(
  "inline-flex items-center gap-2 rounded-full text-xs font-medium uppercase tracking-widest transition-colors",
  {
    variants: {
      variant: {
        /* Bordered muted pill — used in the hero badge. */
        outline:
          "border border-border bg-muted/50 px-4 py-1.5 text-muted-foreground backdrop-blur-md",
        /* Solid tinted pill — used in CTA sections. */
        solid: "bg-primary/10 px-4 py-1.5 font-bold text-primary",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  }
);

export interface EyebrowProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof eyebrowVariants> {
  /** Show a pulsing status dot before the label. */
  dot?: boolean;
}

/**
 * Small pill/eyebrow label ("BETA ACCESS NOW OPEN", "JOIN THE REVOLUTION"…).
 * Centralises the pill styling that was copy-pasted across landing sections.
 */
export function Eyebrow({
  className,
  variant,
  dot = false,
  children,
  ...props
}: EyebrowProps) {
  return (
    <span className={cn(eyebrowVariants({ variant }), className)} {...props}>
      {dot && (
        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
      )}
      {children}
    </span>
  );
}
