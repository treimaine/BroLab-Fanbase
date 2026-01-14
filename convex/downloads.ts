/**
 * Downloads Convex Functions
 * Requirements: 17.1-17.6 - Fan Downloads (Ownership-gated)
 * 
 * Provides secure download URLs for purchased digital products.
 * Verifies ownership before granting access to files.
 */

import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";

/**
 * Get download URL for a purchased product
 * Requirements: 17.1-17.5 - Ownership-gated downloads
 * 
 * Verifies:
 * 1. Fan is authenticated
 * 2. OrderItem exists linking fanUserId to productId
 * 3. Order status is "paid"
 * 
 * Returns:
 * - File URL if ownership is valid
 * - Error (403) if ownership is invalid
 * 
 * Optionally logs download in downloads table
 */
export const getDownloadUrl = action({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args): Promise<{
    url: string;
    productTitle: string;
    contentType?: string;
  }> => {
    // 1. Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user by Clerk ID
    const user = await ctx.runQuery(internal.downloads_helpers.getUserByClerkId, {
      clerkUserId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // 3. Verify ownership
    const ownership = await ctx.runQuery(internal.downloads_helpers.checkOwnership, {
      fanUserId: user._id,
      productId: args.productId,
    });

    if (!ownership.isValid) {
      throw new Error("Access denied: You do not own this product");
    }

    // 4. Get product to retrieve fileStorageId
    const product: {
      _id: string;
      title: string;
      fileStorageId?: Id<"_storage">;
      contentType?: string;
    } | null = await ctx.runQuery(internal.downloads_helpers.getProductById, {
      productId: args.productId,
    });

    if (!product?.fileStorageId) {
      throw new Error("Product file not found");
    }

    // 5. Generate file URL from fileStorageId
    const fileUrl: string | null = await ctx.runQuery(internal.downloads_helpers.getStorageUrl, {
      storageId: product.fileStorageId,
    });

    if (!fileUrl) {
      throw new Error("Failed to generate download URL");
    }

    // 6. Log download (optional)
    if (ownership.orderId) {
      await ctx.runMutation(internal.downloads_helpers.logDownloadAttempt, {
        fanUserId: user._id,
        productId: args.productId,
        orderId: ownership.orderId,
      });
    }

    return {
      url: fileUrl,
      productTitle: product.title,
      contentType: product.contentType,
    };
  },
});
