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
    <header className="fixed top-0 z-[100] w-full border-b border-border bg-background/60 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">B</div>
          <span className="font-serif text-xl font-bold tracking-tight text-foreground">
            BroLab
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
                className="text-muted-foreground hover:bg-accent/10 hover:text-foreground min-h-[44px] px-4"
              >
                Login
              </Button>
            </Link>
            <Button 
              size="sm" 
              className="group relative overflow-hidden rounded-full bg-primary px-6 font-bold text-primary-foreground transition-all hover:bg-primary/90 min-h-[44px]"
              onClick={() => {
                posthog.capture('start_as_artist_click', { location: 'navbar' });
                router.push('/sign-up');
              }}
            >
              <span className="relative z-10 hidden sm:inline">Get Started</span>
              <span className="relative z-10 sm:hidden">Join</span>
            </Button>
          </SignedOut>

          <SignedIn>
            <UserButton appearance={{ elements: { userButtonAvatarBox: "h-10 w-10 border border-border" } }} />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
