"use client";

import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import * as React from "react";

interface CtaPillProps {
  /** Leading muted text, e.g. "Still have questions?". */
  label: React.ReactNode;
  /** The emphasised action text, e.g. "Get in touch". */
  action: React.ReactNode;
  /** Navigate to a route… */
  href?: string;
  /** …or run a handler (e.g. scroll to hero). One of href/onClick is required. */
  onClick?: () => void;
  className?: string;
}

/**
 * Inline "prompt + action" pill used at the end of sections
 * ("Ready to take control? → Claim your link"). Consolidates the two
 * near-identical implementations in how-it-works and faq.
 */
export function CtaPill({ label, action, href, onClick, className }: CtaPillProps) {
  const actionContent = (
    <>
      {action}
      <ArrowRight className="h-4 w-4" />
    </>
  );

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-6 py-3 text-muted-foreground",
        className
      )}
    >
      <span>{label}</span>
      {href ? (
        <Link
          href={href}
          className="flex items-center gap-1 font-bold text-foreground transition-colors hover:text-primary"
        >
          {actionContent}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className="flex items-center gap-1 font-bold text-foreground transition-colors hover:text-primary"
        >
          {actionContent}
        </button>
      )}
    </div>
  );
}
