/**
 * Convex Files Functions
 * Requirements: 19.2 - Track Sources & URLs (Convex Storage)
 * 
 * Provides playable URLs for audio/video files stored in Convex File Storage.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get a playable URL for a file stored in Convex File Storage.
 * Returns an ephemeral URL usable by <audio>/<video> elements.
 * 
 * Requirements: 19.2 - Audio/video files SHALL be stored in Convex File Storage.
 * The app SHALL obtain playable URLs using Convex storage URL resolution.
 */
export const getPlayableUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
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
 */
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
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
