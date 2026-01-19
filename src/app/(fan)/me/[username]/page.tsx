"use client";

/**
 * Fan Feed Page
 * Requirements: 9.1-9.6 - Fan Dashboard with personalized feed
 * Requirements: R-FEED-1 - Feed powered by real Convex data
 * Requirements: R-FEED-1.4 - Pagination (cursor/limit)
 * 
 * Desktop: Feed + sidebar widgets (CommunityWidget, SuggestedArtistsWidget, FeaturedTrackCard)
 * Mobile: Single column feed
 * Connected to Convex (followed artists feed)
 * 
 * Displays posts from followed artists including:
 * - New releases (products from followed artists)
 * - Action buttons (like, comment, share) - Future
 * - CTA buttons (Listen, Get Tickets, Shop Now)
 * - Pagination with "Load more" button
 * 
 * Data source: convex/feed.ts - getForCurrentUser query (paginated)
 * Fetches public products from all followed artists, sorted by creation date descending
 */

import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { CommunityWidget, FeedCard, SuggestedArtistsWidget } from "@/components/feed";
import type { FeedPost } from "@/components/feed/feed-card";
import { FeaturedTrackCard } from "@/components/player";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Track } from "@/types/player";
import { ConvexHttpClient } from "convex/browser";
import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

export default function FanFeedPage() {
  // Pagination state
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [allFeedItems, setAllFeedItems] = useState<any[]>([]);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  // Fetch data with pagination
  const feedResult = useQuery(api.feed.getForCurrentUser, { 
    limit: 10,
    cursor: cursor 
  });
  const followingCount = useQuery(api.follows.getFollowingCount);
  const upcomingEventsCount = useQuery(api.follows.getFollowedArtistsUpcomingEventsCount);
  const suggestedArtists = useQuery(api.artists.getSuggestedArtists, { limit: 5 });

  // Mutations
  const toggleFollow = useMutation(api.follows.toggle);

  // Accumulate feed items as we paginate
  useMemo(() => {
    if (feedResult?.items) {
      if (!hasLoadedInitial) {
        // First load - replace all items
        setAllFeedItems(feedResult.items);
        setHasLoadedInitial(true);
      } else if (cursor !== undefined) {
        // Subsequent loads - append items
        setAllFeedItems((prev: any[]) => {
          // Deduplicate by _id
          const existingIds = new Set(prev.map((item: any) => item._id));
          const newItems = feedResult.items.filter((item: any) => !existingIds.has(item._id));
          return [...prev, ...newItems];
        });
      }
    }
  }, [feedResult?.items, cursor, hasLoadedInitial]);

  // Loading states
  const isInitialLoading = 
    feedResult === undefined || 
    followingCount === undefined || 
    upcomingEventsCount === undefined ||
    suggestedArtists === undefined;

  const isLoadingMore = cursor !== undefined && feedResult === undefined;
  const hasMore = feedResult?.nextCursor !== null && feedResult?.nextCursor !== undefined;

  // Transform feed items into feed posts
  const feedPosts = useMemo<FeedPost[]>(() => {
    if (!allFeedItems || allFeedItems.length === 0) {
      return [];
    }

    // Transform products into feed posts
    return allFeedItems.map((item: any) => ({
      id: item._id,
      artist: {
        name: item.artist.displayName,
        avatarUrl: item.artist.avatarUrl,
        slug: item.artist.artistSlug,
      },
      content: `Check out my latest ${item.type === "music" ? "track" : "video"}! ${item.description || ""}`,
      imageUrl: item.coverImageUrl || item.artist.coverUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
      type: "release" as const,
      createdAt: new Date(item.createdAt).toISOString(),
      likes: 0, // Future: implement likes
      comments: 0, // Future: implement comments
      track: item.fileStorageId ? {
        id: item._id,
        title: item.title,
        artistName: item.artist.displayName,
        coverImageUrl: item.coverImageUrl || item.artist.coverUrl,
        fileStorageId: item.fileStorageId as string,
        type: item.type,
        duration: 180, // Future: store actual duration
        productId: item._id, // Include productId for ownership verification
      } : undefined,
    }));
  }, [allFeedItems]);

  // Featured track (first track from feed)
  const featuredTrack = useMemo<Track | null>(() => {
    const trackPost = feedPosts.find(post => post.track);
    return trackPost?.track || null;
  }, [feedPosts]);

  // Handle follow artist from suggested widget
  const handleFollowArtist = useCallback(async (artistId: string) => {
    try {
      // Use the existing follow toggle mutation from Convex
      const result = await toggleFollow({ artistId: artistId as any });
      
      // Log success (in production, would show a toast notification)
      console.log("Follow action:", result.action);
    } catch (error) {
      console.error("Failed to follow artist:", error);
    }
  }, [toggleFollow]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (feedResult?.nextCursor) {
      setCursor(feedResult.nextCursor);
    }
  }, [feedResult?.nextCursor]);

  // Handle playable URL request
  // Requirements: R-STRIPE-OT-1.3 - Server-side gating for private products
  const handleRequestUrl = useCallback(async (track: Track): Promise<string | null> => {
    if (!track.fileStorageId) {
      return null;
    }

    try {
      // Create a Convex HTTP client for imperative queries
      const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
      
      // Fetch playable URL from Convex storage using the files.getPlayableUrl query
      // Pass productId for ownership verification (required for private products)
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

  // Loading skeleton
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Feed skeleton */}
            <div className="lg:col-span-8 space-y-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-96 w-full rounded-2xl" />
              ))}
            </div>

            {/* Sidebar skeleton (desktop only) */}
            <aside className="hidden lg:block lg:col-span-4 space-y-6">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </aside>
          </div>
        </div>
      </div>
    );
  }

  // Empty state - no followed artists
  if (!allFeedItems || allFeedItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Empty feed */}
            <div className="lg:col-span-8">
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                  <svg
                    className="w-12 h-12 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold mb-2">Your feed is empty</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Start following artists to see their latest releases, events, and updates in your feed.
                </p>
              </div>
            </div>

            {/* Sidebar with suggested artists */}
            <aside className="lg:col-span-4 space-y-6">
              <CommunityWidget
                followingCount={followingCount || 0}
                upcomingEventsCount={upcomingEventsCount || 0}
              />
              {suggestedArtists && suggestedArtists.length > 0 && (
                <SuggestedArtistsWidget
                  artists={suggestedArtists}
                  onFollowArtist={handleFollowArtist}
                />
              )}
            </aside>
          </div>
        </div>
      </div>
    );
  }

  // Feed with posts
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Feed */}
          <main className="lg:col-span-8 space-y-6">
            {feedPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <p className="text-muted-foreground">
                  No posts yet. Check back soon for updates from your followed artists!
                </p>
              </div>
            ) : (
              <>
                {feedPosts.map((post) => (
                  <FeedCard
                    key={post.id}
                    post={post}
                    onRequestUrl={handleRequestUrl}
                  />
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="rounded-full gap-2"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Load more"
                      )}
                    </Button>
                  </div>
                )}

                {/* End of feed message */}
                {!hasMore && feedPosts.length > 0 && (
                  <div className="flex justify-center pt-4">
                    <p className="text-sm text-muted-foreground">
                      You&apos;ve reached the end of your feed
                    </p>
                  </div>
                )}
              </>
            )}
          </main>

          {/* Sidebar Widgets (Desktop only) */}
          <aside className="hidden lg:block lg:col-span-4 space-y-6 sticky top-6 self-start">
            {/* Community Stats */}
            <CommunityWidget
              followingCount={followingCount || 0}
              upcomingEventsCount={upcomingEventsCount || 0}
            />

            {/* Featured Track */}
            {featuredTrack && (
              <FeaturedTrackCard
                track={featuredTrack}
                onRequestUrl={handleRequestUrl}
              />
            )}

            {/* Suggested Artists */}
            {suggestedArtists && suggestedArtists.length > 0 && (
              <SuggestedArtistsWidget
                artists={suggestedArtists}
                onFollowArtist={handleFollowArtist}
              />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
