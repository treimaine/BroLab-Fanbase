"use client";

/**
 * Feed Content Component
 * 
 * Extracted from FanFeedPage to reduce cognitive complexity.
 * Handles the main feed rendering with pagination.
 * 
 * Requirements: R-FEED-1 - Feed powered by real Convex data
 * Cognitive Complexity Target: < 10
 */

import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { FeedCard } from "@/components/feed";
import type { FeedPost } from "@/components/feed/feed-card";
import { Button } from "@/components/ui/button";
import type { Track } from "@/types/player";
import { ConvexHttpClient } from "convex/browser";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export function FeedContent() {
  // Pagination state
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [allFeedItems, setAllFeedItems] = useState<any[]>([]);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  // Fetch data with pagination
  const feedResult = useQuery(api.feed.getForCurrentUser, {
    limit: 10,
    cursor: cursor,
  });

  // Accumulate feed items as we paginate
  useEffect(() => {
    if (!feedResult?.items) return;

    if (!hasLoadedInitial) {
      setAllFeedItems(feedResult.items);
      setHasLoadedInitial(true);
    } else if (cursor !== undefined) {
      setAllFeedItems((prev) => {
        const existingIds = new Set(prev.map((item) => item._id));
        const newItems = feedResult.items.filter((item) => !existingIds.has(item._id));
        return [...prev, ...newItems];
      });
    }
  }, [feedResult?.items, cursor, hasLoadedInitial]);

  const isLoadingMore = cursor !== undefined && feedResult === undefined;
  const hasMore = feedResult?.nextCursor !== null && feedResult?.nextCursor !== undefined;

  // Transform feed items into feed posts (releases + events) using real data
  const feedPosts = useMemo<FeedPost[]>(() => {
    if (!allFeedItems || allFeedItems.length === 0) return [];

    return allFeedItems.map((item: any) => {
      const base = {
        id: item._id,
        artist: {
          name: item.artist.displayName,
          avatarUrl: item.artist.avatarUrl,
          slug: item.artist.artistSlug,
        },
        createdAt: new Date(item.createdAt).toISOString(),
        targetType: item.targetType,
        targetId: item.targetId,
        isLiked: item.isLikedByMe ?? false,
        likes: item.likeCount ?? 0,
        comments: item.commentCount ?? 0,
      };

      // Event feed item
      if (item.feedType === "event") {
        const eventDate = new Date(item.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        return {
          ...base,
          content: item.title,
          imageUrl: item.imageUrl || item.artist.coverUrl,
          type: "event" as const,
          ticketUrl: item.ticketUrl,
          eventLocation: `${item.venue} · ${item.city} · ${eventDate}`,
        };
      }

      // Release (product) feed item
      const description = item.description?.trim();
      return {
        ...base,
        content: description
          ? description
          : `New ${item.type === "music" ? "track" : "video"}: ${item.title}`,
        imageUrl: item.coverImageUrl || item.artist.coverUrl,
        type: "release" as const,
        track: item.fileStorageId
          ? {
              id: item._id,
              title: item.title,
              artistName: item.artist.displayName,
              coverImageUrl: item.coverImageUrl || item.artist.coverUrl,
              fileStorageId: item.fileStorageId as string,
              type: item.type,
              duration: 180,
              productId: item._id,
            }
          : undefined,
      };
    });
  }, [allFeedItems]);

  const handleLoadMore = useCallback(() => {
    if (feedResult?.nextCursor) {
      setCursor(feedResult.nextCursor);
    }
  }, [feedResult?.nextCursor]);

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
      
      return null;
    }
  }, []);

  // Empty state
  if (feedPosts.length === 0 && !isLoadingMore) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <p className="text-muted-foreground">
          No posts yet. Check back soon for updates from your followed artists!
        </p>
      </div>
    );
  }

  return (
    <>
      {feedPosts.map((post) => (
        <FeedCard key={post.id} post={post} onRequestUrl={handleRequestUrl} />
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
          <p className="text-sm text-muted-foreground">You&apos;ve reached the end of your feed</p>
        </div>
      )}
    </>
  );
}
