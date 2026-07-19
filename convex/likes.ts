/**
 * Likes Functions
 * Requirements: R-FAN-LIKE-1 - Persistent likes on feed items (products/events)
 *
 * A like is polymorphic: it targets either a product ("release") or an event.
 * Ownership is always re-checked from ctx.auth — never trust a client owner id.
 *
 * - toggle: Like/unlike a target, returns the new state and count
 * - getStatus: Whether the current user liked a target + total count
 * - getCount: Total like count for a target (public)
 */

import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";

const targetTypeValidator = v.union(v.literal("product"), v.literal("event"));

/**
 * Resolve the current authenticated user, or null if unauthenticated / unsynced.
 */
async function getUserFromIdentity(ctx: QueryCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
    .unique();
}

/**
 * Count likes for a single target.
 */
async function countLikes(
  ctx: QueryCtx,
  targetType: "product" | "event",
  targetId: string
): Promise<number> {
  const likes = await ctx.db
    .query("likes")
    .withIndex("by_target", (q) =>
      q.eq("targetType", targetType).eq("targetId", targetId)
    )
    .collect();
  return likes.length;
}

/**
 * Toggle like status for a feed target.
 * Requirements: R-FAN-LIKE-1.1 - Persist like per fan/target; idempotent toggle.
 *
 * @returns { liked, count } — the new like state and updated total count
 * @throws Error if not authenticated
 */
export const toggle = mutation({
  args: {
    targetType: targetTypeValidator,
    targetId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserFromIdentity(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_fan_target", (q) =>
        q
          .eq("fanUserId", user._id)
          .eq("targetType", args.targetType)
          .eq("targetId", args.targetId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    } else {
      await ctx.db.insert("likes", {
        fanUserId: user._id,
        targetType: args.targetType,
        targetId: args.targetId,
        createdAt: Date.now(),
      });
    }

    const count = await countLikes(ctx, args.targetType, args.targetId);
    return { liked: !existing, count };
  },
});

/**
 * Get like status (liked + count) for a target for the current user.
 * Requirements: R-FAN-LIKE-1.2 - Read model for like button state.
 */
export const getStatus = query({
  args: {
    targetType: targetTypeValidator,
    targetId: v.string(),
  },
  handler: async (ctx, args) => {
    const count = await countLikes(ctx, args.targetType, args.targetId);

    const user = await getUserFromIdentity(ctx);
    if (!user) {
      return { liked: false, count };
    }

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_fan_target", (q) =>
        q
          .eq("fanUserId", user._id)
          .eq("targetType", args.targetType)
          .eq("targetId", args.targetId)
      )
      .unique();

    return { liked: existing !== null, count };
  },
});

/**
 * Get total like count for a target (public, no auth required).
 */
export const getCount = query({
  args: {
    targetType: targetTypeValidator,
    targetId: v.string(),
  },
  handler: async (ctx, args) => {
    return await countLikes(ctx, args.targetType, args.targetId);
  },
});
