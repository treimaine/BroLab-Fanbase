/**
 * Users Functions
 * Requirements: 15.2 - Sync Clerk → Convex on sign-in
 * 
 * Handles user synchronization between Clerk and Convex:
 * - upsertFromClerk: Create or update user from Clerk data
 * - getByClerkId: Retrieve user by Clerk user ID
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Upsert user from Clerk data
 * Requirements: 15.2 - Create/update Convex user record when user signs up via Clerk
 * 
 * This function is called after Clerk authentication to sync user data to Convex.
 * If user exists (by clerkUserId), updates their data.
 * If user doesn't exist, creates a new record.
 * 
 * @param clerkUserId - Clerk's unique user identifier
 * @param role - User role ("artist" or "fan")
 * @param displayName - User's display name
 * @param usernameSlug - URL-friendly username slug
 * @param avatarUrl - Optional avatar image URL
 * @returns The user's Convex document ID
 */
export const upsertFromClerk = mutation({
  args: {
    clerkUserId: v.string(),
    role: v.union(v.literal("artist"), v.literal("fan")),
    displayName: v.string(),
    usernameSlug: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { clerkUserId, role, displayName, usernameSlug, avatarUrl } = args;

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        role,
        displayName,
        usernameSlug,
        avatarUrl,
      });

      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkUserId,
      role,
      displayName,
      usernameSlug,
      avatarUrl,
      createdAt: Date.now(),
    });

    return userId;
  },
});

/**
 * Get user by Clerk user ID
 * Requirements: 15.2 - Retrieve Convex user record by Clerk ID
 * 
 * Used to fetch the Convex user record associated with a Clerk user.
 * Returns null if no user found.
 * 
 * @param clerkUserId - Clerk's unique user identifier
 * @returns User document or null if not found
 */
export const getByClerkId = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();

    return user;
  },
});

/**
 * Get current authenticated user
 * Convenience query that uses the authenticated user's identity
 * 
 * @returns User document or null if not authenticated/not found
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return null;
    }

    // Clerk's subject is the user ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    return user;
  },
});

/**
 * Get user by username slug
 * Used for public profile lookups
 * 
 * @param usernameSlug - URL-friendly username
 * @returns User document or null if not found
 */
export const getByUsername = query({
  args: {
    usernameSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("usernameSlug", args.usernameSlug))
      .unique();

    return user;
  },
});

/**
 * Helper: Delete all records from a table by index
 */
async function deleteRecordsByIndex<T extends string>(
  ctx: any,
  table: T,
  indexName: string,
  indexValue: any
) {
  const records = await ctx.db
    .query(table)
    .withIndex(indexName, (q: any) => q.eq(indexName.replace("by_", ""), indexValue))
    .collect();
  
  for (const record of records) {
    await ctx.db.delete(record._id);
  }
}

/**
 * Helper: Delete artist-related data
 */
async function deleteArtistData(ctx: any, artistId: any) {
  // Delete links, events, products, follows, balance snapshots, and payouts
  await Promise.all([
    deleteRecordsByIndex(ctx, "links", "by_artist", artistId),
    deleteRecordsByIndex(ctx, "events", "by_artist", artistId),
    deleteRecordsByIndex(ctx, "products", "by_artist", artistId),
    deleteRecordsByIndex(ctx, "follows", "by_artist", artistId),
    deleteRecordsByIndex(ctx, "artistBalanceSnapshots", "by_artist", artistId),
    deleteRecordsByIndex(ctx, "artistPayouts", "by_artist", artistId),
  ]);
  
  // Delete artist profile
  await ctx.db.delete(artistId);
}

/**
 * Helper: Delete fan-related data
 */
async function deleteFanData(ctx: any, userId: any) {
  // Delete follows, downloads, and payment methods
  await Promise.all([
    deleteRecordsByIndex(ctx, "follows", "by_fan", userId),
    deleteRecordsByIndex(ctx, "downloads", "by_fan", userId),
    deleteRecordsByIndex(ctx, "paymentMethods", "by_userId", userId),
  ]);
  
  // Delete orders and their items
  const orders = await ctx.db
    .query("orders")
    .withIndex("by_fan", (q: any) => q.eq("fanUserId", userId))
    .collect();
  
  for (const order of orders) {
    await deleteRecordsByIndex(ctx, "orderItems", "by_order", order._id);
    await ctx.db.delete(order._id);
  }
}

/**
 * Delete user and all associated data
 * Requirements: User deletion cleanup
 * 
 * Handles cascading deletion of all user-related data:
 * - For artists: profile, links, events, products, follows
 * - For fans: follows, orders, orderItems, downloads, payment methods
 * - Finally deletes the user record
 * 
 * @param clerkUserId - Clerk's unique user identifier
 */
export const deleteByClerkId = mutation({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();

    if (!user) {
      console.log(`User ${args.clerkUserId} not found in Convex`);
      return;
    }

    // Delete based on role
    if (user.role === "artist") {
      const artist = await ctx.db
        .query("artists")
        .withIndex("by_owner", (q) => q.eq("ownerUserId", user._id))
        .unique();

      if (artist) {
        await deleteArtistData(ctx, artist._id);
      }
    } else if (user.role === "fan") {
      await deleteFanData(ctx, user._id);
    }

    // Finally, delete the user
    await ctx.db.delete(user._id);

    console.log(`✅ User ${args.clerkUserId} and all associated data deleted from Convex`);
  },
});
