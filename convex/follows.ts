/**
 * Follows Functions
 * Requirements: 3.5 - Follow toggle
 *
 * Handles fan → artist follow relationships:
 * - toggle: Toggle follow status (follow/unfollow)
 * - isFollowing: Check if a fan is following an artist
 * - getFollowedArtists: Get list of artists a fan is following
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Toggle follow status for an artist
 * Requirements: 3.5 - WHEN a visitor clicks "Follow" while authenticated, THE System SHALL toggle the follow status
 *
 * If the fan is currently following the artist, unfollow them.
 * If the fan is not following the artist, follow them.
 *
 * @param artistId - ID of the artist to follow/unfollow
 * @returns Object with new follow status and action taken
 * @throws Error if not authenticated or user not found
 */
export const toggle = mutation({
  args: {
    artistId: v.id("artists"),
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify the artist exists
    const artist = await ctx.db.get(args.artistId);
    if (!artist) {
      throw new Error("Artist not found");
    }

    // Check if already following
    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_fan_artist", (q) =>
        q.eq("fanUserId", user._id).eq("artistId", args.artistId)
      )
      .unique();

    if (existingFollow) {
      // Unfollow: delete the follow record
      await ctx.db.delete(existingFollow._id);
      return {
        isFollowing: false,
        action: "unfollowed" as const,
      };
    } else {
      // Follow: create a new follow record
      await ctx.db.insert("follows", {
        fanUserId: user._id,
        artistId: args.artistId,
        createdAt: Date.now(),
      });
      return {
        isFollowing: true,
        action: "followed" as const,
      };
    }
  },
});

/**
 * Check if the current user is following an artist
 * Requirements: 3.5 - Support follow toggle state
 *
 * Used to display the correct follow button state in the UI.
 * Returns false if not authenticated (visitor).
 *
 * @param artistId - ID of the artist to check
 * @returns Boolean indicating if the user is following the artist
 */
export const isFollowing = query({
  args: {
    artistId: v.id("artists"),
  },
  handler: async (ctx, args) => {
    // Get authentication identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Not authenticated, so not following
      return false;
    }

    // Get the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user) {
      return false;
    }

    // Check if follow record exists
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_fan_artist", (q) =>
        q.eq("fanUserId", user._id).eq("artistId", args.artistId)
      )
      .unique();

    return follow !== null;
  },
});

/**
 * Get list of artists the current user is following
 * Requirements: 3.5 - Support follow relationships for fan feed
 *
 * Returns the full artist documents for all artists the current user follows.
 * Used for the fan dashboard feed and "Following" section.
 *
 * @returns Array of artist documents the user is following, or empty array if not authenticated
 */
export const getFollowedArtists = query({
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

    // Fetch the artist documents for each follow
    const artists = await Promise.all(
      follows.map(async (follow) => {
        const artist = await ctx.db.get(follow.artistId);
        return artist;
      })
    );

    // Filter out any null values (in case an artist was deleted)
    return artists.filter((artist) => artist !== null);
  },
});

/**
 * Get follower count for an artist
 * Utility query to display follower count on artist hub
 *
 * @param artistId - ID of the artist
 * @returns Number of followers
 */
export const getFollowerCount = query({
  args: {
    artistId: v.id("artists"),
  },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_artist", (q) => q.eq("artistId", args.artistId))
      .collect();

    return follows.length;
  },
});

/**
 * Get following count for the current user
 * Utility query to display following count on fan dashboard
 *
 * @returns Number of artists the user is following
 */
export const getFollowingCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user) {
      return 0;
    }

    const follows = await ctx.db
      .query("follows")
      .withIndex("by_fan", (q) => q.eq("fanUserId", user._id))
      .collect();

    return follows.length;
  },
});

/**
 * Get upcoming events count for followed artists
 * Requirements: 9.5 - Display events count in CommunityWidget
 *
 * Returns the total count of upcoming events from all artists the current user follows.
 * Used for the fan dashboard CommunityWidget.
 *
 * @returns Number of upcoming events from followed artists
 */
export const getFollowedArtistsUpcomingEventsCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user) {
      return 0;
    }

    // Get all follow records for this user
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_fan", (q) => q.eq("fanUserId", user._id))
      .collect();

    // Get all upcoming events for each followed artist
    let totalUpcomingEvents = 0;

    for (const follow of follows) {
      const events = await ctx.db
        .query("events")
        .withIndex("by_artist", (q) => q.eq("artistId", follow.artistId))
        .collect();

      // Count only upcoming events
      const upcomingCount = events.filter(
        (event) => event.status === "upcoming"
      ).length;

      totalUpcomingEvents += upcomingCount;
    }

    return totalUpcomingEvents;
  },
});

/**
 * Count followers for an artist
 * Requirements: R-ART-DASH-STAT-1 - Followers count for dashboard stats
 *
 * Returns the total number of fans following a specific artist.
 * Used for the artist dashboard stats card.
 *
 * @param artistId - ID of the artist
 * @returns Number of followers
 */
export const countByArtist = query({
  args: {
    artistId: v.id("artists"),
  },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_artist", (q) => q.eq("artistId", args.artistId))
      .collect();
    return follows.length;
  },
});
