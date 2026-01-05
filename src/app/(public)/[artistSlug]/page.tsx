"use client";

/**
 * Public Artist Hub Page
 * Requirements: 3.1-3.7
 *
 * Displays the artist's public hub page:
 * - Cover image with gradient overlay, centered avatar
 * - Artist name (serif typography) and bio
 * - Follow button (toggle) connected to Convex
 * - Social icons pills
 * - Tabs: "Latest Drops" / "Tour Dates"
 * - 404 if slug invalid
 */

import { api } from "@/../convex/_generated/api";
import { DropsList, EventsList, HubHeader } from "@/components/hub";
import type { Drop } from "@/components/hub/drops-list";
import type { Event } from "@/components/hub/events-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Track } from "@/types/player";
import { useQuery } from "convex/react";
import { Calendar, Music } from "lucide-react";

interface PublicHubPageProps {
  readonly params: {
    readonly artistSlug: string;
  };
}

/**
 * Loading skeleton for the hub page
 */
function HubSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Cover skeleton */}
      <Skeleton className="h-48 w-full sm:h-56 md:h-64 lg:h-72" />

      {/* Content skeleton */}
      <div className="relative -mt-16 flex flex-col items-center px-4 pb-6 sm:-mt-20">
        <Skeleton className="h-28 w-28 rounded-full sm:h-32 sm:w-32" />
        <Skeleton className="mt-4 h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
        <Skeleton className="mt-4 h-10 w-28 rounded-full" />
        <div className="mt-4 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`social-skeleton-${String(i)}`} className="h-9 w-9 rounded-full" />
          ))}
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        <Skeleton className="mx-auto h-10 w-64 rounded-lg" />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`drop-skeleton-${String(i)}`} className="aspect-square rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
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
        We couldn&apos;t find an artist with this URL. They may have changed their
        username or the page doesn&apos;t exist.
      </p>
    </div>
  );
}

/**
 * Convert Convex product to Drop interface
 */
function productToDrop(
  product: {
    _id: string;
    title: string;
    type: "music" | "video";
    coverImageUrl?: string;
    priceUSD: number;
    visibility: "public" | "private";
    fileStorageId?: string;
  },
  artistName: string,
  artistSlug: string
): Drop {
  return {
    id: product._id,
    title: product.title,
    type: product.type,
    coverImageUrl: product.coverImageUrl,
    priceUSD: product.priceUSD,
    visibility: product.visibility,
    fileStorageId: product.fileStorageId,
    artistName,
    artistSlug,
  };
}

/**
 * Convert Convex event to Event interface
 */
function convexEventToEvent(event: {
  _id: string;
  title: string;
  date: number;
  venue: string;
  city: string;
  ticketUrl?: string;
  imageUrl?: string;
  status: "upcoming" | "sold-out" | "past";
}): Event {
  return {
    id: event._id,
    title: event.title,
    date: event.date,
    venue: event.venue,
    city: event.city,
    ticketUrl: event.ticketUrl,
    imageUrl: event.imageUrl,
    status: event.status,
  };
}

/**
 * Public Hub Page Component
 */
export default function PublicHubPage({ params }: PublicHubPageProps) {
  // Get artistSlug from params (Next.js 14 style)
  const { artistSlug } = params;

  // Fetch artist data by slug
  const artist = useQuery(api.artists.getBySlug, { slug: artistSlug });

  // Fetch products and events only if artist exists
  const products = useQuery(
    api.products.getPublicByArtist,
    artist ? { artistId: artist._id } : "skip"
  );

  const events = useQuery(
    api.events.getByArtist,
    artist ? { artistId: artist._id } : "skip"
  );

  // Loading state
  if (artist === undefined) {
    return <HubSkeleton />;
  }

  // 404 if artist not found
  if (artist === null) {
    return <NotFoundState />;
  }

  // Convert products to drops
  const drops: Drop[] = (products ?? []).map((product) =>
    productToDrop(
      {
        _id: product._id,
        title: product.title,
        type: product.type,
        coverImageUrl: product.coverImageUrl,
        priceUSD: product.priceUSD,
        visibility: product.visibility,
        fileStorageId: product.fileStorageId,
      },
      artist.displayName,
      artist.artistSlug
    )
  );

  // Convert events
  const eventsList: Event[] = (events ?? []).map((event) =>
    convexEventToEvent({
      _id: event._id,
      title: event.title,
      date: event.date,
      venue: event.venue,
      city: event.city,
      ticketUrl: event.ticketUrl,
      imageUrl: event.imageUrl,
      status: event.status,
    })
  );

  /**
   * Request playable URL for a track
   * Used by MediaCardOverlay for audio/video playback
   * Note: This is a placeholder - actual implementation would use Convex action
   */
  const handleRequestUrl = async (_track: Track): Promise<string | null> => {
    // TODO: Implement actual URL fetching via Convex action
    // For now, return null as we'd need to set up a proper action
    // The MediaCardOverlay will handle this gracefully
    return null;
  };

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

      {/* Tabs Section */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        <Tabs defaultValue="drops" className="w-full">
          <TabsList
            className={cn(
              "mx-auto grid w-full max-w-md grid-cols-2",
              "bg-muted/50 p-1 rounded-xl"
            )}
          >
            <TabsTrigger
              value="drops"
              className={cn(
                "rounded-lg gap-2 data-[state=active]:bg-background",
                "data-[state=active]:shadow-sm"
              )}
            >
              <Music className="h-4 w-4" />
              Latest Drops
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className={cn(
                "rounded-lg gap-2 data-[state=active]:bg-background",
                "data-[state=active]:shadow-sm"
              )}
            >
              <Calendar className="h-4 w-4" />
              Tour Dates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="drops" className="mt-6">
            <DropsList
              drops={drops}
              artistName={artist.displayName}
              artistSlug={artist.artistSlug}
              onRequestUrl={handleRequestUrl}
              isLoading={products === undefined}
            />
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <EventsList
              events={eventsList}
              isLoading={events === undefined}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
