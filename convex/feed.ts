/**
 * Feed Functions
 * Requirements: R-FEED-1 - Fan Feed powered by real Convex data
 *
 * Handles fan feed generation from followed artists:
 * - getFollowedArtistsFeed: Aggregate products from followed artists (legacy)
 * - getForCurrentUser: Paginated feed with cursor support
 * - Future: Add real-time updates via Convex subscriptions
 */

import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Get feed items from followed artists
 * Requirements: R-FEED-1.2 - Source: followed artists → latest publications (products)
 * Requirements: R-FEED-1.3 - Sort desc by createdAt/publishedAt
 *
 * Returns public products from all artists the current user follows.
 * Products are sorted by creation date descending (newest first).
 *
 * @returns Array of products with artist information, or empty array if not authenticated
 */
export const getFollowedArtistsFeed = query({
  args: {},
  handler: async (ctx) => {
    // Get authentication identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    // Get all follow records for this user
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_fan", (q) => q.eq("fanUserId", user._id))
      .collect();

    if (follows.length === 0) {
      return [];
    }

    // Fetch public products for each followed artist
    const feedItems = [];

    for (const follow of follows) {
      // Get the artist
      const artist = await ctx.db.get(follow.artistId);
      if (!artist) continue;

      // Get public products for this artist
      const products = await ctx.db
        .query("products")
        .withIndex("by_artist", (q) => q.eq("artistId", follow.artistId))
        .collect();

      // Filter to only public products
      const publicProducts = products.filter(
        (product) => product.visibility === "public"
      );

      // Add artist info to each product
      for (const product of publicProducts) {
        feedItems.push({
          ...product,
          artist: {
            _id: artist._id,
            displayName: artist.displayName,
            artistSlug: artist.artistSlug,
            avatarUrl: artist.avatarUrl,
            coverUrl: artist.coverUrl,
          },
        });
      }
    }

    // Sort by createdAt descending (newest first)
    feedItems.sort((a, b) => b.createdAt - a.createdAt);

    return feedItems;
  },
});

/**
 * Get paginated feed for current user
 * Requirements: R-FEED-1.2 - Source: followed artists → latest publications (products)
 * Requirements: R-FEED-1.3 - Sort desc by createdAt/publishedAt
 * Requirements: R-FEED-1.4 - Pagination (cursor/limit)
 *
 * OPTIMIZED: Eliminates N+1 pattern by batching artist fetches and using parallel queries.
 * Performance: O(N + M) instead of O(N × M) where N = followed artists, M = total products
 *
 * Returns paginated public products from all artists the current user follows.
 * Products are sorted by creation date descending (newest first).
 *
 * @param limit - Maximum number of items to return (default: 20)
 * @param cursor - Timestamp cursor for pagination (optional)
 * @returns Object with items array and nextCursor for pagination
 */
export const getForCurrentUser = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const cursor = args.cursor;

    // Get authentication identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { items: [], nextCursor: null };
    }

    // Get the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user) {
      return { items: [], nextCursor: null };
    }

    // Get all follow records for this user
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_fan", (q) => q.eq("fanUserId", user._id))
      .collect();

    if (follows.length === 0) {
      return { items: [], nextCursor: null };
    }

    // OPTIMIZATION 1: Batch fetch all artists in parallel (eliminates N sequential gets)
    const artistIds = follows.map((f) => f.artistId);
    const artistsPromises = artistIds.map((id) => ctx.db.get(id));
    const artistsResults = await Promise.all(artistsPromises);
    
    // Create artist lookup map for O(1) access
    const artistsMap = new Map();
    artistsResults.forEach((artist) => {
      if (artist) {
        artistsMap.set(artist._id, artist);
      }
    });

    // OPTIMIZATION 2: Fetch products for all artists in parallel (eliminates N sequential queries)
    const productsPromises = artistIds.map((artistId) =>
      ctx.db
        .query("products")
        .withIndex("by_artist", (q) => q.eq("artistId", artistId))
        .collect()
    );
    const productsResults = await Promise.all(productsPromises);

    // OPTIMIZATION 3: Flatten and filter products, then enrich with artist data
    const feedItems = [];
    
    for (let i = 0; i < productsResults.length; i++) {
      const products = productsResults[i];
      const artistId = artistIds[i];
      const artist = artistsMap.get(artistId);
      
      if (!artist) continue;

      // Filter to only public products and add artist info
      for (const product of products) {
        if (product.visibility === "public") {
          feedItems.push({
            ...product,
            artist: {
              _id: artist._id,
              displayName: artist.displayName,
              artistSlug: artist.artistSlug,
              avatarUrl: artist.avatarUrl,
              coverUrl: artist.coverUrl,
            },
          });
        }
      }
    }

    // Sort by createdAt descending (newest first)
    feedItems.sort((a, b) => b.createdAt - a.createdAt);

    // Apply cursor filtering if provided
    let filteredItems = feedItems;
    if (cursor !== undefined) {
      filteredItems = feedItems.filter((item) => item.createdAt < cursor);
    }

    // PAGE-ONLY BEHAVIOR (R-FAN-FEED-1):
    // This query returns ONLY the current page of items (up to `limit` items).
    // It does NOT accumulate or return all items - that's the client's responsibility.
    // 
    // Pagination strategy:
    // 1. Fetch limit + 1 items to detect if there's a next page
    // 2. If we got more than `limit` items, there's more data available
    // 3. Return exactly `limit` items (trim the extra one)
    // 4. nextCursor = timestamp of the LAST item in the returned page
    //    - Client uses this cursor in the next request to fetch older items
    //    - Cursor filtering: item.createdAt < cursor (strict less-than for no duplicates)
    const paginatedItems = filteredItems.slice(0, limit + 1);
    const hasMore = paginatedItems.length > limit;
    const items = hasMore ? paginatedItems.slice(0, limit) : paginatedItems;

    // Calculate next cursor (timestamp of last item in current page)
    // nextCursor is null when we've reached the end of the feed
    const nextCursor = hasMore && items.length > 0 
      ? items.at(-1)!.createdAt 
      : null;

    return {
      items,
      nextCursor,
    };
  },
});
