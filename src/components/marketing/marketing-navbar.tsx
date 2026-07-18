"use client";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { LayoutDashboard, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/explore", label: "Explore" },
] as const;

/** Role-aware home for signed-in users: artist → dashboard, fan → their space. */
function useUserHome() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role as "artist" | "fan" | undefined;
  if (role === "fan") return { href: "/me", label: "My Space" };
  // Default to the artist dashboard; middleware corrects mismatches anyway.
  return { href: "/dashboard", label: "Dashboard" };
}

export function MarketingNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const userHome = useUserHome();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-[100] w-full transition-all duration-300 ease-signature",
        scrolled
          ? "border-b border-border bg-background/70 shadow-sm backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 ease-signature md:px-6",
          scrolled ? "h-16" : "h-20"
        )}
      >
        {/* Brand */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
            B
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-foreground">
            BroLab
          </span>
        </Link>

        {/* Center: Nav (desktop) */}
        <nav
          aria-label="Main"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex"
        >
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute inset-x-4 -bottom-px h-px bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />

          <SignedOut>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden min-h-[44px] px-4 text-muted-foreground hover:bg-accent/10 hover:text-foreground sm:inline-flex"
            >
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </SignedOut>

          <SignedIn>
            <Button
              asChild
              size="sm"
              className="min-h-[44px] rounded-full bg-primary px-5 font-bold text-primary-foreground transition-all hover:bg-primary/90"
            >
              <Link href={userHome.href}>
                <LayoutDashboard className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">{userHome.label}</span>
              </Link>
            </Button>
          </SignedIn>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="min-h-[44px] min-w-[44px] text-foreground"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <nav aria-label="Mobile" className="mt-8 flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "rounded-xl px-4 py-3 text-base font-medium transition-colors",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6">
                  <SignedOut>
                    <Button asChild variant="outline" className="w-full rounded-full">
                      <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                        Sign in
                      </Link>
                    </Button>
                  </SignedOut>
                  <SignedIn>
                    <Button asChild className="w-full rounded-full font-bold">
                      <Link
                        href={userHome.href}
                        onClick={() => setMobileOpen(false)}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        {userHome.label}
                      </Link>
                    </Button>
                  </SignedIn>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
