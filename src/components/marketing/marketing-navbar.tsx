"use client";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

export function MarketingNavbar() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
          <span className="font-serif text-xl font-semibold text-foreground">
            BroLab Fanbase
          </span>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          
          <SignedOut>
            <Link href="/sign-in">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px]"
              >
                Sign In
              </Button>
            </Link>
            <Button 
              size="sm" 
              className="rounded-full px-5 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white shadow-md hover:shadow-lg transition-all min-h-[44px]"
              onClick={() => {
                posthog.capture('start_as_artist_click', { location: 'hero' });
                router.push('/sign-up');
              }}
            >
              <span className="hidden sm:inline">Start free as an Artist</span>
              <span className="sm:hidden">Start free</span>
            </Button>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
