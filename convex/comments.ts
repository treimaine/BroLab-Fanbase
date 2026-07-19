/**
 * Comments Functions
 * Requirements: R-FAN-COMMENT-1 - Public comments on feed items (products/events)
 *
 * Comments are public: anyone can read them; an authenticated user can add a
 * comment and delete only their own. Ownership is re-checked from ctx.auth on
 * every mutation — never trust a client-supplied author id.
 *
 * - list: Public list of comments for a target (with author info + isMine flag)
 * - add: Add a comment (authenticated)
 * - remove: Delete own comment (authenticated + ownership check)
 * - getCount: Total comment count for a target (public)
 */

import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";

const targetTypeValidator = v.union(v.literal("product"), v.literal("event"));

const MAX_COMMENT_LENGTH = 500;

async function getUserFromIdentity(ctx: QueryCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
    .unique();
}

/**
 * List comments for a target, newest first, enriched with author info.
 * Requirements: R-FAN-COMMENT-1.2 - Public read model with author + ownership flag.
 */
export const list = query({
  args: {
    targetType: targetTypeValidator,
    targetId: v.string(),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_target", (q) =>
        q.eq("targetType", args.targetType).eq("targetId", args.targetId)
      )
      .collect();

    // Newest first
    comments.sort((a, b) => b.createdAt - a.createdAt);

    const currentUser = await getUserFromIdentity(ctx);

    // Batch author lookups
    const authorIds = [...new Set(comments.map((c) => c.fanUserId))];
    const authors = await Promise.all(authorIds.map((id) => ctx.db.get(id)));
    const authorMap = new Map(
      authors.filter((a): a is Doc<"users"> => a !== null).map((a) => [a._id, a])
    );

    return comments.map((comment) => {
      const author = authorMap.get(comment.fanUserId);
      return {
        _id: comment._id,
        body: comment.body,
        createdAt: comment.createdAt,
        author: {
          displayName: author?.displayName ?? "Fan",
          avatarUrl: author?.avatarUrl,
          usernameSlug: author?.usernameSlug,
        },
        isMine: currentUser?._id === comment.fanUserId,
      };
    });
  },
});

/**
 * Add a comment to a target.
 * Requirements: R-FAN-COMMENT-1.1 - Authenticated create with validation.
 *
 * @throws Error if not authenticated or body is empty/too long
 */
export const add = mutation({
  args: {
    targetType: targetTypeValidator,
    targetId: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserFromIdentity(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const body = args.body.trim();
    if (body.length === 0) {
      throw new Error("Comment cannot be empty");
    }
    if (body.length > MAX_COMMENT_LENGTH) {
      throw new Error(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`);
    }

    const commentId = await ctx.db.insert("comments", {
      fanUserId: user._id,
      targetType: args.targetType,
      targetId: args.targetId,
      body,
      createdAt: Date.now(),
    });

    return { commentId };
  },
});

/**
 * Delete a comment. Only the author may delete their own comment.
 * Requirements: R-FAN-COMMENT-1.3 - Ownership-checked delete.
 *
 * @throws Error if not authenticated, comment missing, or not the author
 */
export const remove = mutation({
  args: {
    commentId: v.id("comments"),
  },
  handler: async (ctx, args) => {
    const user = await getUserFromIdentity(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.fanUserId !== user._id) {
      throw new Error("Not authorized to delete this comment");
    }

    await ctx.db.delete(args.commentId);
    return { success: true };
  },
});

/**
 * Get total comment count for a target (public).
 */
export const getCount = query({
  args: {
    targetType: targetTypeValidator,
    targetId: v.string(),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_target", (q) =>
        q.eq("targetType", args.targetType).eq("targetId", args.targetId)
      )
      .collect();
    return comments.length;
  },
});
