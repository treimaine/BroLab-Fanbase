/**
 * Links Functions
 * Requirements: 6.1-6.5, R-CL-1..5
 *
 * Handles artist custom links management:
 * - create: Add a new custom link (merch, booking, press kit, etc.)
 * - update: Update an existing link
 * - delete: Remove a link
 * - getByArtist: Get all links for an artist
 * - reorder: Reorder links by updating their order values
 * 
 * NOTE: Social/streaming platform URLs are blocked (R-CL-2)
 * Those should be managed via Profile & Bio → Social Links
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { canCreateLink, enforceLimit } from "./subscriptions";

/**
 * Blocked social/streaming platform domains
 * These platforms should be managed via Profile & Bio → Social Links
 * Requirements: R-CL-2
 */
const BLOCKED_SOCIAL_DOMAINS = [
  "instagram.com",
  "x.com",
  "twitter.com",
  "youtube.com",
  "youtu.be",
  "spotify.com",
  "open.spotify.com",
  "tiktok.com",
  "soundcloud.com",
  "music.apple.com",
  "facebook.com",
  "twitch.tv",
];

/**
 * Check if a URL points to a blocked social/streaming platform
 * Requirements: R-CL-2
 */
function isSocialPlatformUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase().replace(/^www\./, "");
    
    return BLOCKED_SOCIAL_DOMAINS.some((domain) => {
      return hostname === domain || hostname.endsWith(`.${domain}`);
    });
  } catch {
    return false;
  }
}

/**
 * Error message for blocked social platform URLs
 * Requirements: R-CL-3
 */
const SOCIAL_PLATFORM_ERROR = "Manage social links in Profile & Bio → Social Links.";

/**
 * Get all links for an artist
 * Requirements: 6.1 - Display a list of existing links
 *
 * Returns all links for the specified artist, ordered by their order field.
 * Used for the artist dashboard (links management).
 *
 * @param artistId - ID of the artist
 * @returns Array of link documents ordered by order field
 */
export const getByArtist = query({
  args: {
    artistId: v.id("artists"),
  },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("links")
      .withIndex("by_artist", (q) => q.eq("artistId", args.artistId))
      .collect();

    // Sort by order field (ascending)
    return links.sort((a, b) => a.order - b.order);
  },
});

/**
 * Get active links for an artist
 * Requirements: R-CL-4
 *
 * Returns only active links for the specified artist, ordered by their order field.
 * NOTE: Currently not displayed on Public Hub (removed per UX decision).
 * Kept for future use (e.g., "More" modal, dedicated section).
 *
 * - Filters: active === true
 * - Orders: by order field ascending
 *
 * @param artistId - ID of the artist
 * @returns Array of active link documents ordered by order field
 */
export const getActiveByArtist = query({
  args: {
    artistId: v.id("artists"),
  },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("links")
      .withIndex("by_artist", (q) => q.eq("artistId", args.artistId))
      .collect();

    // Filter only active links and sort by order field (ascending)
    return links
      .filter((link) => link.active === true)
      .sort((a, b) => a.order - b.order);
  },
});

/**
 * Get links for the current authenticated artist
 * Convenience query that uses the authenticated user's identity
 *
 * @returns Array of link documents or empty array if not authenticated/not an artist
 */
export const getCurrentArtistLinks = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (user?.role !== "artist") {
      return [];
    }

    // Get the artist profile for this user
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", user._id))
      .unique();

    if (!artist) {
      return [];
    }

    // Get all links for this artist
    const links = await ctx.db
      .query("links")
      .withIndex("by_artist", (q) => q.eq("artistId", artist._id))
      .collect();

    // Sort by order field (ascending)
    return links.sort((a, b) => a.order - b.order);
  },
});

/**
 * Create a new custom link
 * Requirements: 6.3 - Store title, URL, and type when artist adds a link
 * Requirements: R-CL-2, R-CL-3 - Reject social/streaming platform URLs
 *
 * Creates a new custom link for the authenticated artist.
 * Validates:
 * - User is authenticated
 * - User has "artist" role
 * - User owns an artist profile
 * - URL is not a blocked social/streaming platform
 *
 * @param title - Display title for the link
 * @param url - Destination URL
 * @param type - Link type (merch, booking, press-kit, etc.)
 * @returns The new link's Convex document ID
 * @throws Error if validation fails
 */
export const create = mutation({
  args: {
    title: v.string(),
    url: v.string(),
    type: v.string(),
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

    // Verify user has artist role
    if (user.role !== "artist") {
      throw new Error("Only artists can create links");
    }

    // Get the artist profile
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", user._id))
      .unique();

    if (!artist) {
      throw new Error("Artist profile not found. Please create your profile first.");
    }

    // Validate URL format
    try {
      new URL(args.url);
    } catch {
      throw new Error("Invalid URL format");
    }

    // Validate URL is not a blocked social/streaming platform (R-CL-2, R-CL-3)
    if (isSocialPlatformUrl(args.url)) {
      throw new Error(SOCIAL_PLATFORM_ERROR);
    }

    // Get the current highest order value for this artist's links
    const existingLinks = await ctx.db
      .query("links")
      .withIndex("by_artist", (q) => q.eq("artistId", artist._id))
      .collect();

    // Check subscription limits (R-ART-SUB-5.4, R-ART-SUB-7.1, R-ART-SUB-7.2)
    const canCreate = await canCreateLink(ctx, existingLinks.length);
    enforceLimit(
      canCreate,
      "links",
      "You've reached the limit for links on your current plan. Upgrade to create more."
    );

    const maxOrder = existingLinks.reduce(
      (max, link) => Math.max(max, link.order),
      -1
    );

    // Create the link with the next order value
    const linkId = await ctx.db.insert("links", {
      artistId: artist._id,
      title: args.title.trim(),
      url: args.url.trim(),
      type: args.type,
      active: true, // New links are active by default
      order: maxOrder + 1,
      createdAt: Date.now(),
    });

    return linkId;
  },
});

/**
 * Update an existing link
 * Requirements: 6.4 - Update link visibility (active status)
 * Requirements: R-CL-2, R-CL-3 - Reject social/streaming platform URLs
 *
 * Updates an existing link. Can update title, URL, type, and active status.
 * Validates:
 * - User is authenticated
 * - User owns the artist profile that owns the link
 * - URL (if provided) is not a blocked social/streaming platform
 *
 * @param linkId - ID of the link to update
 * @param title - Optional new title
 * @param url - Optional new URL
 * @param type - Optional new type
 * @param active - Optional new active status
 * @returns The updated link's Convex document ID
 * @throws Error if validation fails
 */
export const update = mutation({
  args: {
    linkId: v.id("links"),
    title: v.optional(v.string()),
    url: v.optional(v.string()),
    type: v.optional(v.string()),
    active: v.optional(v.boolean()),
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

    // Get the link
    const link = await ctx.db.get(args.linkId);
    if (!link) {
      throw new Error("Link not found");
    }

    // Get the artist profile
    const artist = await ctx.db.get(link.artistId);
    if (!artist) {
      throw new Error("Artist profile not found");
    }

    // Verify ownership
    if (artist.ownerUserId !== user._id) {
      throw new Error("Not authorized to modify this link");
    }

    // Build update object
    const updates: Record<string, unknown> = {};

    if (args.title !== undefined) {
      updates.title = args.title.trim();
    }

    if (args.url !== undefined) {
      // Validate URL format
      try {
        new URL(args.url);
      } catch {
        throw new Error("Invalid URL format");
      }
      
      // Validate URL is not a blocked social/streaming platform (R-CL-2, R-CL-3)
      if (isSocialPlatformUrl(args.url)) {
        throw new Error(SOCIAL_PLATFORM_ERROR);
      }
      
      updates.url = args.url.trim();
    }

    if (args.type !== undefined) {
      updates.type = args.type;
    }

    if (args.active !== undefined) {
      updates.active = args.active;
    }

    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.linkId, updates);
    }

    return args.linkId;
  },
});

/**
 * Delete a link
 * Requirements: 6.1-6.5 - Links management (implicit delete capability)
 *
 * Deletes a link from the artist's hub.
 * Validates:
 * - User is authenticated
 * - User owns the artist profile that owns the link
 *
 * @param linkId - ID of the link to delete
 * @returns The deleted link's ID
 * @throws Error if validation fails
 */
export const remove = mutation({
  args: {
    linkId: v.id("links"),
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

    // Get the link
    const link = await ctx.db.get(args.linkId);
    if (!link) {
      throw new Error("Link not found");
    }

    // Get the artist profile
    const artist = await ctx.db.get(link.artistId);
    if (!artist) {
      throw new Error("Artist profile not found");
    }

    // Verify ownership
    if (artist.ownerUserId !== user._id) {
      throw new Error("Not authorized to delete this link");
    }

    // Delete the link
    await ctx.db.delete(args.linkId);

    return args.linkId;
  },
});

/**
 * Reorder links
 * Requirements: 6.1-6.5 - Links management (implicit reorder capability)
 *
 * Updates the order of multiple links at once.
 * Validates:
 * - User is authenticated
 * - User owns the artist profile that owns all the links
 *
 * @param linkOrders - Array of { linkId, order } objects
 * @returns Success boolean
 * @throws Error if validation fails
 */
export const reorder = mutation({
  args: {
    linkOrders: v.array(
      v.object({
        linkId: v.id("links"),
        order: v.number(),
      })
    ),
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

    // Get the artist profile for this user
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", user._id))
      .unique();

    if (!artist) {
      throw new Error("Artist profile not found");
    }

    // Verify all links belong to this artist and update their order
    for (const { linkId, order } of args.linkOrders) {
      const link = await ctx.db.get(linkId);
      
      if (!link) {
        throw new Error(`Link ${linkId} not found`);
      }

      if (link.artistId !== artist._id) {
        throw new Error("Not authorized to reorder this link");
      }

      await ctx.db.patch(linkId, { order });
    }

    return true;
  },
});

/**
 * Toggle link active status
 * Requirements: 6.4 - Toggle link visibility
 *
 * Convenience mutation to toggle a link's active status.
 *
 * @param linkId - ID of the link to toggle
 * @returns Object with new active status
 * @throws Error if validation fails
 */
export const toggleActive = mutation({
  args: {
    linkId: v.id("links"),
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

    // Get the link
    const link = await ctx.db.get(args.linkId);
    if (!link) {
      throw new Error("Link not found");
    }

    // Get the artist profile
    const artist = await ctx.db.get(link.artistId);
    if (!artist) {
      throw new Error("Artist profile not found");
    }

    // Verify ownership
    if (artist.ownerUserId !== user._id) {
      throw new Error("Not authorized to modify this link");
    }

    // Toggle the active status
    const newActive = !link.active;
    await ctx.db.patch(args.linkId, { active: newActive });

    return { active: newActive };
  },
});
