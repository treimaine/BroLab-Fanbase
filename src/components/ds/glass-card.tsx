import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

export const glassCardVariants = cva(
  "relative border border-border bg-card/50 backdrop-blur-xl transition-all duration-300",
  {
    variants: {
      radius: {
        md: "rounded-2xl",
        lg: "rounded-card",
        xl: "rounded-hub",
      },
      padding: {
        none: "",
        sm: "p-6",
        md: "p-8",
        lg: "p-8 md:p-10",
        xl: "p-8 md:p-12",
      },
      interactive: {
        true: "hover:border-primary/20 hover:bg-card hover:shadow-xl hover:shadow-primary/5",
        false: "",
      },
    },
    defaultVariants: {
      radius: "lg",
      padding: "lg",
      interactive: true,
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

/**
 * Frosted-glass surface — the recurring
 * `rounded-[2rem] border border-border bg-card/50 backdrop-blur …` card.
 * Use `interactive={false}` for static panels, and `radius`/`padding` to tune.
 * For animated grid items, wrap with `<Reveal variants={cardReveal}>` or use
 * `motion.create(GlassCard)`.
 */
export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, radius, padding, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        glassCardVariants({ radius, padding, interactive }),
        className
      )}
      {...props}
    />
  )
);
GlassCard.displayName = "GlassCard";
