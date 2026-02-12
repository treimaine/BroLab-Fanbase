/**
 * Downloads Helper Functions
 * Internal helper queries and mutations for downloads.ts
 */

import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

/**
 * Helper query: Get user by Clerk ID
 */
export const getUserByClerkId = internalQuery({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();
  },
});

/**
 * Helper query: Check ownership of a product
 * Requirements: 17.3, 17.4 - Ownership verification
 */
export const checkOwnership = internalQuery({
  args: {
    fanUserId: v.id("users"),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    // Get all paid orders for this fan
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_fan", (q) => q.eq("fanUserId", args.fanUserId))
      .filter((q) => q.eq(q.field("status"), "paid"))
      .collect();

    // Check if any order contains this product
    for (const order of orders) {
      const orderItem = await ctx.db
        .query("orderItems")
        .withIndex("by_order", (q) => q.eq("orderId", order._id))
        .filter((q) => q.eq(q.field("productId"), args.productId))
        .first();

      if (orderItem) {
        return { isValid: true, orderId: order._id };
      }
    }

    return { isValid: false, orderId: null };
  },
});

/**
 * Helper query: Get product by ID
 */
export const getProductById = internalQuery({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.productId);
  },
});

/**
 * Helper query: Get storage URL
 * Requirements: 17.4 - Return file URL generated from fileStorageId
 */
export const getStorageUrl = internalQuery({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Helper mutation: Log download attempt
 * Requirements: 17.6 - Optionally log download attempts
 */
export const logDownloadAttempt = internalMutation({
  args: {
    fanUserId: v.id("users"),
    productId: v.id("products"),
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("downloads", {
      fanUserId: args.fanUserId,
      productId: args.productId,
      orderId: args.orderId,
      timestamp: Date.now(),
    });
  },
});

/**
 * Helper mutation: Log security event
 * Requirements: A01 - Log unauthorized access attempts
 * 
 * Wrapper around centralized security logging with automatic severity classification.
 * Maps download-related events to appropriate severity levels.
 */
export const logSecurityEvent = internalMutation({
  args: {
    userId: v.optional(v.id("users")),
    clerkUserId: v.optional(v.string()),
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();

    // Insert security log directly
    await ctx.db.insert("securityLogs", {
      userId: args.userId,
      clerkUserId: args.clerkUserId,
      action: args.action,
      resourceType: args.resourceType,
      resourceId: args.resourceId,
      reason: args.reason,
      timestamp,
    });

    // Determine severity based on reason for console logging
    let severity: "low" | "medium" | "high" | "critical";
    
    if (args.reason === "not_authenticated") {
      severity = "medium";
    } else if (args.reason === "not_authorized") {
      severity = "high";
    } else if (args.reason === "rate_limit_exceeded") {
      severity = "high";
    } else if (args.reason === "user_not_found") {
      severity = "critical";
    } else {
      severity = "medium";
    }

    // Log to console
    console.log(`[SECURITY ${severity.toUpperCase()}] ${args.action}`, {
      userId: args.userId,
      clerkUserId: args.clerkUserId,
      resourceType: args.resourceType,
      resourceId: args.resourceId,
      reason: args.reason,
      timestamp: new Date(timestamp).toISOString(),
    });
  },
});

/**
 * Helper query: Check rate limit for downloads
 * Requirements: A01 - Rate limiting for download attempts
 * Limit: 10 downloads per minute per user
 */
export const checkDownloadRateLimit = internalQuery({
  args: {
    fanUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const oneMinuteAgo = Date.now() - 60000;

    const recentDownloads = await ctx.db
      .query("downloads")
      .withIndex("by_fan", (q) => q.eq("fanUserId", args.fanUserId))
      .filter((q) => q.gt(q.field("timestamp"), oneMinuteAgo))
      .collect();

    const limit = 10;
    const isExceeded = recentDownloads.length >= limit;

    return {
      isExceeded,
      count: recentDownloads.length,
      limit,
      resetAt: Date.now() + 60000,
    };
  },
});

