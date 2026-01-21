"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";

export function ExploreArtistsCta() {
  const router = useRouter();
  const posthog = usePostHog();

  return (
    <section className="border-y border-border/50 bg-muted/30 py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-lg font-semibold sm:text-xl">
              Discover amazing artists
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse profiles and support your favorite creators
            </p>
          </div>
          <Button
            size="lg"
            variant="outline"
            className="h-12 rounded-full px-8 font-medium"
            onClick={() => {
              posthog.capture('explore_artists_click', { location: 'hero' });
              router.push('/explore');
            }}
          >
            Explore artists
          </Button>
        </div>
      </div>
    </section>
  );
}
