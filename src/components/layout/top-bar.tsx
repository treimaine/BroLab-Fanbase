"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import Link from "next/link";

interface TopBarProps {
  title?: string;
  showBurger?: boolean;
  onBurgerClick?: () => void;
  actions?: React.ReactNode;
}

export function TopBar({
  title,
  showBurger = true,
  onBurgerClick,
  actions,
}: Readonly<TopBarProps>) {
  return (
    <header className="lg:hidden sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left: Brand or Title */}
        <div className="flex items-center gap-3">
          {showBurger && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onBurgerClick}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link href="/" className="flex items-center">
            <span
              className={cn(
                "font-serif font-semibold text-foreground",
                title ? "text-base" : "text-lg"
              )}
            >
              {title ?? "BroLab Fanbase"}
            </span>
          </Link>
        </div>

        {/* Right: Actions slot (e.g., ThemeToggle) */}
        {actions && (
          <div className="flex items-center gap-2">{actions}</div>
        )}
      </div>
    </header>
  );
}
