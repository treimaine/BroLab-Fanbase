/**
 * Convex Files Functions
 * Requirements: 19.2 - Track Sources & URLs (Convex Storage)
 * 
 * Provides playable URLs for audio/video files stored in Convex File Storage.
 */

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalQuery, mutation, query } from "./_generated/server";

/**
 * Internal helper: Check if user owns a product
 * Requirements: R-STRIPE-OT-1.3 - Server-side ownership verification
 */
export const checkProductOwnership = internalQuery({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    // Get all paid orders for this user
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_fan", (q) => q.eq("fanUserId", args.userId))
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
        return true;
      }
    }

    return false;
  },
});

/**
 * Get a playable URL for a file stored in Convex File Storage.
 * Returns an ephemeral URL usable by <audio>/<video> elements.
 * 
 * Requirements: 19.2 - Audio/video files SHALL be stored in Convex File Storage.
 * The app SHALL obtain playable URLs using Convex storage URL resolution.
 * 
 * Requirements: R-STRIPE-OT-1.3 - Server-side gating for private products
 * 
 * Access Control:
 * - Public products: Anyone can stream/preview (no ownership check)
 * - Private products: Only owners can access (requires paid order)
 * 
 * Note: For downloads (not streaming), use downloads.getDownloadUrl which
 * always requires ownership verification regardless of visibility.
 */
export const getPlayableUrl = query({
  args: {
    storageId: v.id("_storage"),
    productId: v.optional(v.id("products")), // Optional for backward compatibility
  },
  handler: async (ctx, args) => {
    // If productId is provided, check visibility and ownership
    if (args.productId) {
      const product = await ctx.db.get(args.productId);
      
      if (!product) {
        throw new Error("Product not found");
      }
      
      // If product is private, verify ownership
      if (product.visibility === "private") {
        const identity = await ctx.auth.getUserIdentity();
        
        if (!identity) {
          throw new Error("Authentication required for private content");
        }
        
        // Get user by Clerk ID
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
          .unique();
        
        if (!user) {
          throw new Error("User not found");
        }
        
        // Check ownership using internal helper
        const hasAccess = await ctx.runQuery(internal.files.checkProductOwnership, {
          userId: user._id,
          productId: args.productId,
        });
        
        if (!hasAccess) {
          throw new Error("Access denied: You do not own this product");
        }
      }
      
      // Public products or owned private products can proceed
    }
    
    // Get the URL for the stored file
    const url = await ctx.storage.getUrl(args.storageId);
    
    if (!url) {
      return null;
    }
    
    return url;
  },
});

/**
 * Generate an upload URL for file uploads.
 * Used by artists to upload audio/video files.
 * 
 * Requirements: 16.4 - Use Convex File Storage upload flow with upload URLs
 * Requirements: R-ART-SUB-5.5 - Video uploads require Premium
 * Requirements: R-ART-SUB-7.3, R-ART-SUB-7.4 - File size limits by plan
 * 
 * Subscription-based validation:
 * - Free plan: Audio only, max 50MB
 * - Premium plan: Audio + Video, max 500MB
 */
export const generateUploadUrl = mutation({
  args: {
    fileType: v.optional(v.union(v.literal("audio"), v.literal("video"))),
    fileSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // Import subscription helpers
    const { canUploadVideo, getMaxFileSize } = await import("./subscriptions");
    
    // Check video upload permission (requires Premium)
    if (args.fileType === "video") {
      const canUpload = await canUploadVideo(ctx);
      if (!canUpload) {
        throw new Error("Video uploads require Premium. Upgrade to unlock.");
      }
    }
    
    // Check file size limit
    if (args.fileSize !== undefined) {
      const maxSize = await getMaxFileSize(ctx);
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      
      if (args.fileSize > maxSize) {
        throw new Error(`File size exceeds your plan limit (${maxSizeMB}MB). Upgrade to upload larger files.`);
      }
    }
    
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Delete a file from storage.
 * Used when deleting products.
 * 
 * Requirements: 16.6 - Delete associated file from Convex storage
 */
export const deleteFile = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    await ctx.storage.delete(args.storageId);
  },
});

/**
 * Generate an upload URL for avatar/cover images.
 * Used by artists to upload profile images directly.
 * 
 * Max file size: 5MB for images
 */
export const generateImageUploadUrl = mutation({
  args: {
    fileSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // Check file size limit (5MB for images)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (args.fileSize !== undefined && args.fileSize > maxSize) {
      throw new Error("Image size exceeds limit (5MB max)");
    }
    
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get a public URL for an image stored in Convex File Storage.
 * Used for avatar and cover images.
 */
export const getImageUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
