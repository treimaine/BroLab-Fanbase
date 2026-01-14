"use client";

/**
 * Fan Feed Page
 * Requirements: 9.1-9.6 - Fan Dashboard with personalized feed
 * 
 * Desktop: Feed + sidebar widgets (CommunityWidget, SuggestedArtistsWidget, FeaturedTrackCard)
 * Mobile: Single column feed
 * Connected to Convex (followed artists feed)
 * 
 * Displays posts from followed artists including:
 * - New releases (products)
 * - Upcoming events
 * - Action buttons (like, comment, share)
 * - CTA buttons (Listen, Get Tickets, Shop Now)
 */

import { api } from "@/../convex/_generated/api";
import { CommunityWidget, FeedCard, SuggestedArtistsWidget } from "@/components/feed";
import type { FeedPost } from "@/components/feed/feed-card";
import { FeaturedTrackCard } from "@/components/player";
import { Skeleton } from "@/components/ui/skeleton";
import type { Track } from "@/types/player";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useMemo } from "react";

/**
 * Generate feed posts from followed artists' products and events
 * 
 * Note: For MVP, we generate mock feed posts from followed artists.
 * In production, this would be replaced with a dedicated Convex query
 * that efficiently fetches and aggregates products and events from followed artists.
 * 
 * Future enhancement: Create `convex/feed.ts` with:
 * - getFollowedArtistsFeed: Aggregate products + events from followed artists
 * - Pagination support
 * - Real-time updates via Convex subscriptions
 */

export default function FanFeedPage() {
  // Fetch data
  const followedArtists = useQuery(api.follows.getFollowedArtists);
  const followingCount = useQuery(api.follows.getFollowingCount);
  const upcomingEventsCount = useQuery(api.follows.getFollowedArtistsUpcomingEventsCount);
  const suggestedArtists = useQuery(api.artists.getSuggestedArtists, { limit: 5 });

  // Mutations
  const toggleFollow = useMutation(api.follows.toggle);

  // Loading state
  const isLoading = 
    followedArtists === undefined || 
    followingCount === undefined || 
    upcomingEventsCount === undefined ||
    suggestedArtists === undefined;

  // Generate feed posts (MVP: mock data)
  const feedPosts = useMemo<FeedPost[]>(() => {
    if (!followedArtists || followedArtists.length === 0) {
      return [];
    }

    // MVP: Generate mock feed posts from followed artists
    const posts: FeedPost[] = [];
    
    followedArtists.forEach((artist: any, index: number) => {
      // Skip null artists
      if (!artist) return;
      
      // Mock release post
      if (index % 2 === 0) {
        posts.push({
          id: `release-${artist._id}`,
          artist: {
            name: artist.displayName,
            avatarUrl: artist.avatarUrl,
            slug: artist.artistSlug,
          },
          content: `Just dropped my latest track! 🎵 Check it out and let me know what you think!`,
          imageUrl: artist.coverUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
          type: "release",
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          likes: Math.floor(Math.random() * 500) + 50,
          comments: Math.floor(Math.random() * 50) + 5,
          track: {
            id: `track-${artist._id}`,
            title: "New Single",
            artistName: artist.displayName,
            coverImageUrl: artist.coverUrl,
            fileStorageId: "mock-storage-id",
            type: "music",
            duration: 180,
          },
        });
      }

      // Mock event post
      if (index % 3 === 0) {
        posts.push({
          id: `event-${artist._id}`,
          artist: {
            name: artist.displayName,
            avatarUrl: artist.avatarUrl,
            slug: artist.artistSlug,
          },
          content: `Excited to announce my upcoming show! Get your tickets before they sell out! 🎤`,
          imageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80",
          type: "event",
          createdAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
          likes: Math.floor(Math.random() * 300) + 30,
          comments: Math.floor(Math.random() * 30) + 3,
        });
      }

      // Mock update post
      if (index % 4 === 0) {
        posts.push({
          id: `update-${artist._id}`,
          artist: {
            name: artist.displayName,
            avatarUrl: artist.avatarUrl,
            slug: artist.artistSlug,
          },
          content: `Working on something special for you all... Stay tuned! 👀✨`,
          type: "update",
          createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
          likes: Math.floor(Math.random() * 200) + 20,
          comments: Math.floor(Math.random() * 20) + 2,
        });
      }
    });

    // Sort by date descending (newest first)
    return posts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [followedArtists]);

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

  // Handle playable URL request
  const handleRequestUrl = useCallback(async (track: Track): Promise<string | null> => {
    try {
      // Note: In production, this would use the downloads.getDownloadUrl action
      // which verifies ownership and returns a secure download URL.
      // For MVP with mock data, we return null and rely on the track's playableUrl
      console.log("Request URL for track:", track.id);
      return null;
    } catch (error) {
      console.error("Failed to get download URL:", error);
      return null;
    }
  }, []);

  // Loading skeleton
  if (isLoading) {
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
  if (!followedArtists || followedArtists.length === 0) {
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
              feedPosts.map((post) => (
                <FeedCard
                  key={post.id}
                  post={post}
                  onRequestUrl={handleRequestUrl}
                />
              ))
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
