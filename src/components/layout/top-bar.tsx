"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { Menu } from "lucide-react";
import Link from "next/link";
import { Logo } from "./logo";

interface TopBarProps {
  title?: string;
  showBurger?: boolean;
  onBurgerClick?: () => void;
  actions?: React.ReactNode;
  /** When provided, renders a tappable avatar linking to `profileHref`. */
  user?: { name: string; avatar?: string };
  profileHref?: string;
}

export function TopBar({
  title,
  showBurger = true,
  onBurgerClick,
  actions,
  user,
  profileHref,
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
          {title ? (
            <Link href="/" className="flex items-center">
              <span className="font-serif text-base font-semibold text-foreground">
                {title}
              </span>
            </Link>
          ) : (
            <Logo href="/" />
          )}
        </div>

        {/* Right: Actions slot (e.g., ThemeToggle) + optional profile avatar */}
        {(actions || user) && (
          <div className="flex items-center gap-2">
            {actions}
            {user && profileHref && (
              <Link
                href={profileHref}
                aria-label="Open your profile"
                className="rounded-full ring-offset-background transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
