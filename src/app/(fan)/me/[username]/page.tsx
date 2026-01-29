"use client";

/**
 * Fan Feed Page (Refactored with Suspense)
 * 
 * Requirements: 9.1-9.6 - Fan Dashboard with personalized feed
 * Requirements: R-FEED-1 - Feed powered by real Convex data
 * Cognitive Complexity: < 10 (extracted components)
 * 
 * Desktop: Feed + sidebar widgets
 * Mobile: Single column feed
 * 
 * UX Improvements:
 * - Suspense boundaries for better loading states
 * - Error boundaries for graceful error handling
 * - Reduced cognitive complexity via component extraction
 */

import { api } from "@/../convex/_generated/api";
import { CommunityWidget, SuggestedArtistsWidget } from "@/components/feed";
import { FeedSkeleton, Skeleton, SuspenseWrapper } from "@/components/ui/skeleton";
import { useMutation, useQuery } from "convex/react";
import { useCallback } from "react";
import { FeedContent } from "./components/feed-content";
import { FeedSidebar } from "./components/feed-sidebar";

/**
 * Empty State Component
 */
function EmptyFeedState() {
  const followingCount = useQuery(api.follows.getFollowingCount);
  const upcomingEventsCount = useQuery(api.follows.getFollowedArtistsUpcomingEventsCount);
  const suggestedArtists = useQuery(api.artists.getSuggestedArtists, { limit: 5 });
  const toggleFollow = useMutation(api.follows.toggle);

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
              <SuggestedArtistsWidget artists={suggestedArtists} onFollowArtist={handleFollowArtist} />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

/**
 * Sidebar Skeleton
 */
function SidebarSkeleton() {
  return (
    <aside className="hidden lg:block lg:col-span-4 space-y-6">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </aside>
  );
}

/**
 * Fan Feed Page Component
 */
export default function FanFeedPage() {
  // Check if user has followed artists (for empty state)
  const feedResult = useQuery(api.feed.getForCurrentUser, { limit: 1 });

  // Show empty state if no followed artists
  if (feedResult?.items?.length === 0) {
    return <EmptyFeedState />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Feed with Suspense */}
          <main className="lg:col-span-8 space-y-6">
            <SuspenseWrapper fallback={<FeedSkeleton count={3} />}>
              <FeedContent />
            </SuspenseWrapper>
          </main>

          {/* Sidebar with Suspense */}
          <SuspenseWrapper fallback={<SidebarSkeleton />}>
            <FeedSidebar />
          </SuspenseWrapper>
        </div>
      </div>
    </div>
  );
}
