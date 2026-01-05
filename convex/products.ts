/**
 * Products Functions
 * Requirements: 16.1-16.7 - Digital Products Upload & Management
 *
 * Handles digital product management:
 * - getByArtist: Retrieve products for an artist (for Public Hub)
 * - getPublicByArtist: Retrieve only public products for an artist
 */

import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Get all products for an artist
 * Used for artist dashboard to manage products
 *
 * @param artistId - Artist's Convex document ID
 * @returns Array of product documents
 */
export const getByArtist = query({
  args: {
    artistId: v.id("artists"),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_artist", (q) => q.eq("artistId", args.artistId))
      .collect();

    // Sort by createdAt descending (newest first)
    return products.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get public products for an artist
 * Requirements: 3.4 - Display "Latest Drops" tab on Public Hub
 *
 * Used for Public Hub to display only public products.
 * Filters out private products.
 *
 * @param artistId - Artist's Convex document ID
 * @returns Array of public product documents
 */
export const getPublicByArtist = query({
  args: {
    artistId: v.id("artists"),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_artist", (q) => q.eq("artistId", args.artistId))
      .collect();

    // Filter to only public products and sort by createdAt descending
    return products
      .filter((product) => product.visibility === "public")
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});
