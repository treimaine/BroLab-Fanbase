"use client";

/**
 * Feed Sidebar Component
 * 
 * Extracted from FanFeedPage to reduce cognitive complexity.
 * Handles sidebar widgets (Community, Featured Track, Suggested Artists).
 * 
 * Cognitive Complexity Target: < 10
 */

import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { CommunityWidget, SuggestedArtistsWidget } from "@/components/feed";
import { FeaturedTrackCard } from "@/components/player";
import type { Track } from "@/types/player";
import { ConvexHttpClient } from "convex/browser";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useMemo } from "react";

export function FeedSidebar() {
  const followingCount = useQuery(api.follows.getFollowingCount);
  const upcomingEventsCount = useQuery(api.follows.getFollowedArtistsUpcomingEventsCount);
  const suggestedArtists = useQuery(api.artists.getSuggestedArtists, { limit: 5 });
  const feedResult = useQuery(api.feed.getForCurrentUser, { limit: 10 });

  const toggleFollow = useMutation(api.follows.toggle);

  // Featured track (first track from feed)
  const featuredTrack = useMemo<Track | null>(() => {
    if (!feedResult?.items) return null;

    const trackItem = feedResult.items.find((item: any) => item.fileStorageId);
    if (!trackItem) return null;

    return {
      id: trackItem._id,
      title: trackItem.title,
      artistName: trackItem.artist.displayName,
      coverImageUrl: trackItem.coverImageUrl || trackItem.artist.coverUrl,
      fileStorageId: trackItem.fileStorageId as string,
      type: trackItem.type,
      duration: 180,
      productId: trackItem._id,
    };
  }, [feedResult?.items]);

  const handleFollowArtist = useCallback(
    async (artistId: string) => {
      try {
        await toggleFollow({ artistId: artistId as any });
      } catch (error) {
        console.error("Failed to follow artist:", error);
      }
    },
    [toggleFollow]
  );

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

  return (
    <aside className="hidden lg:block lg:col-span-4 space-y-6 sticky top-6 self-start">
      <CommunityWidget
        followingCount={followingCount || 0}
        upcomingEventsCount={upcomingEventsCount || 0}
      />

      {featuredTrack && <FeaturedTrackCard track={featuredTrack} onRequestUrl={handleRequestUrl} />}

      {suggestedArtists && suggestedArtists.length > 0 && (
        <SuggestedArtistsWidget artists={suggestedArtists} onFollowArtist={handleFollowArtist} />
      )}
    </aside>
  );
}
