import { cn } from "@/lib/utils";
import Link from "next/link";

interface LogoProps {
  /**
   * Where the logo links to. Pass `null` to render a non-interactive logo
   * (e.g. inside a dialog title where a nested link is undesirable).
   */
  readonly href?: string | null;
  readonly className?: string;
  readonly iconClassName?: string;
  readonly textClassName?: string;
}

/**
 * Logo - Shared BroLab brand mark.
 *
 * Single source of truth for the logo so the dashboard, marketing site,
 * and drawers all stay visually consistent (purple "B" badge + wordmark).
 */
export function Logo({ href = "/", className, iconClassName, textClassName }: LogoProps) {
  const content = (
    <>
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground",
          iconClassName
        )}
      >
        B
      </span>
      <span
        className={cn(
          "font-serif text-xl font-bold tracking-tight text-foreground",
          textClassName
        )}
      >
        BroLab Fanbase
      </span>
    </>
  );

  if (href === null) {
    return <span className={cn("flex items-center gap-2", className)}>{content}</span>;
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80",
        className
      )}
    >
      {content}
    </Link>
  );
}
