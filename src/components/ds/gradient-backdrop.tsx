import { cn } from "@/lib/utils";
import * as React from "react";

interface GradientBackdropProps {
  /** Visual density of the blurred orbs. */
  variant?: "section" | "hero";
  className?: string;
  children?: React.ReactNode;
}

/**
 * Decorative blurred gradient orbs used behind sections. Pass as the `backdrop`
 * prop of `<Section>` (or render standalone inside `relative` containers).
 * Purely decorative — hidden from assistive tech.
 */
export function GradientBackdrop({
  variant = "section",
  className,
  children,
}: GradientBackdropProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden",
        className
      )}
    >
      {variant === "section" ? (
        <>
          <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-accent/5 blur-[100px]" />
        </>
      ) : (
        <>
          <div className="absolute -left-[10%] -top-[10%] h-[60%] w-[60%] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute -right-[10%] bottom-[10%] h-[50%] w-[50%] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />
        </>
      )}
      {children}
    </div>
  );
}
