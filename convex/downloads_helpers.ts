/**
 * Downloads Helper Functions
 * Internal helper queries and mutations for downloads.ts
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Helper query: Get user by Clerk ID
 */
export const getUserByClerkId = query({
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
export const checkOwnership = query({
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
export const getProductById = query({
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
export const getStorageUrl = query({
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
export const logDownloadAttempt = mutation({
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
