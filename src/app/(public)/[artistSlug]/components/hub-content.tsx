"use client";

/**
 * Hub Content Component
 * 
 * Extracted from PublicHubPage to reduce cognitive complexity.
 * Handles tabs and content rendering (drops + events).
 * 
 * Cognitive Complexity Target: < 10
 */

import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { DropsList, EventsList } from "@/components/hub";
import type { Drop } from "@/components/hub/drops-list";
import type { Event } from "@/components/hub/events-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Track } from "@/types/player";
import { ConvexHttpClient } from "convex/browser";
import { useQuery } from "convex/react";
import { Calendar, Music } from "lucide-react";
import { useCallback } from "react";

interface HubContentProps {
  artistId: Id<"artists">;
  artistName: string;
  artistSlug: string;
}

export function HubContent({ artistId, artistName, artistSlug }: HubContentProps) {
  const products = useQuery(api.products.getPublicByArtist, { artistId });
  const events = useQuery(api.events.getByArtist, { artistId });

  const handleRequestUrl = useCallback(async (track: Track): Promise<string | null> => {
    if (!track.fileStorageId) return null;

    try {
      const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
      const url = await convexClient.query(api.files.getPlayableUrl, {
        storageId: track.fileStorageId as Id<"_storage">,
        productId: track.productId as Id<"products"> | undefined,
      });
      return url;
    } catch (error) {
      console.error("Error fetching playable URL:", error);
      return null;
    }
  }, []);

  // Convert products to drops
  const drops: Drop[] = (products ?? []).map((product: any) => ({
    id: product._id,
    title: product.title,
    type: product.type,
    coverImageUrl: product.coverImageUrl,
    priceUSD: product.priceUSD,
    visibility: product.visibility,
    fileStorageId: product.fileStorageId,
    artistName,
    artistSlug,
  }));

  // Convert events
  const eventsList: Event[] = (events ?? []).map((event: any) => ({
    id: event._id,
    title: event.title,
    date: event.date,
    venue: event.venue,
    city: event.city,
    ticketUrl: event.ticketUrl,
    imageUrl: event.imageUrl,
    status: event.status,
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Tabs defaultValue="drops" className="w-full">
        <TabsList
          className={cn("mx-auto grid w-full max-w-md grid-cols-2", "bg-muted/50 p-1 rounded-xl")}
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
            artistName={artistName}
            artistSlug={artistSlug}
            onRequestUrl={handleRequestUrl}
            isLoading={products === undefined}
          />
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <EventsList events={eventsList} isLoading={events === undefined} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
