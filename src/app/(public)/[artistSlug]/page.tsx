"use client";

/**
 * Public Artist Hub Page (Refactored with Suspense)
 * Requirements: 3.1-3.7
 *
 * Displays the artist's public hub page with improved UX:
 * - Suspense boundaries for better loading states
 * - Error boundaries for graceful error handling
 * - Reduced cognitive complexity via component extraction
 */

import { api } from "@/../convex/_generated/api";
import { HubHeader } from "@/components/hub";
import { HubSkeleton, SuspenseWrapper } from "@/components/ui/skeleton";
import { useQuery } from "convex/react";
import { Music } from "lucide-react";
import { HubContent } from "./components/hub-content";

interface PublicHubPageProps {
  readonly params: {
    readonly artistSlug: string;
  };
}

/**
 * 404 Not Found component
 */
function NotFoundState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <Music className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="font-serif text-3xl font-bold">Artist Not Found</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        We couldn&apos;t find an artist with this URL. They may have changed their username or the
        page doesn&apos;t exist.
      </p>
    </div>
  );
}

/**
 * Public Hub Page Component
 */
export default function PublicHubPage({ params }: PublicHubPageProps) {
  const { artistSlug } = params;
  const artist = useQuery(api.artists.getBySlug, { slug: artistSlug });

  // Loading state
  if (artist === undefined) {
    return <HubSkeleton />;
  }

  // 404 if artist not found
  if (artist === null) {
    return <NotFoundState />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hub Header */}
      <HubHeader
        artistId={artist._id}
        displayName={artist.displayName}
        bio={artist.bio}
        avatarUrl={artist.avatarUrl}
        coverUrl={artist.coverUrl}
        socials={artist.socials}
      />

      {/* Tabs Section with Suspense */}
      <SuspenseWrapper
        fallback={
          <div className="mx-auto max-w-4xl px-4 py-6">
            <div className="h-10 w-64 mx-auto mb-6 animate-pulse bg-primary/10 rounded-lg" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="aspect-square animate-pulse bg-primary/10 rounded-2xl" />
              ))}
            </div>
          </div>
        }
      >
        <HubContent
          artistId={artist._id}
          artistName={artist.displayName}
          artistSlug={artist.artistSlug}
        />
      </SuspenseWrapper>
    </div>
  );
}
