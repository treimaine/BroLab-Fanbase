/**
 * Artists Functions
 * Requirements: 3.1, 5.4, 5.5, 15.7
 *
 * Handles artist profile management:
 * - getBySlug: Retrieve artist by public slug (for Public Hub)
 * - create: Create new artist profile with unique slug validation
 * - update: Update artist profile with slug uniqueness check
 */

import { v } from "convex/values";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";

/**
 * Reserved slugs that cannot be used as artist slugs
 * Requirements: 15.7 - Reject reserved keywords
 * Duplicated from src/lib/constants.ts for server-side validation
 */
const RESERVED_SLUGS = [
  "me",
  "dashboard",
  "sign-in",
  "sign-up",
  "api",
  "admin",
  "settings",
  "help",
  "support",
  "about",
  "terms",
  "privacy",
  "contact",
] as const;

/**
 * Check if a slug is reserved
 */
function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(
    slug.toLowerCase() as (typeof RESERVED_SLUGS)[number]
  );
}

/**
 * Validate slug format
 * - Must be lowercase
 * - Only alphanumeric characters and hyphens
 * - No consecutive hyphens
 * - No leading/trailing hyphens
 * - Minimum 3 characters, maximum 30
 */
function isValidSlugFormat(slug: string): boolean {
  if (slug.length < 3 || slug.length > 30) {
    return false;
  }
  // Must be lowercase alphanumeric with hyphens, no consecutive hyphens, no leading/trailing hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Validate slug format and reserved status (sync validation)
 * @throws Error if slug format is invalid or slug is reserved
 */
function validateSlugFormatAndReserved(slug: string): void {
  if (!isValidSlugFormat(slug)) {
    throw new Error(
      "Invalid slug format. Use only lowercase letters, numbers, and hyphens (3-30 characters)"
    );
  }

  if (isReservedSlug(slug)) {
    throw new Error(
      `The slug "${slug}" is reserved and cannot be used`
    );
  }
}

/**
 * Check if slug is already taken in database
 * @returns The existing artist if slug is taken, null otherwise
 */
async function findArtistBySlug(
  ctx: QueryCtx | MutationCtx,
  slug: string
) {
  return await ctx.db
    .query("artists")
    .withIndex("by_slug", (q) => q.eq("artistSlug", slug))
    .unique();
}

/**
 * Get artist by slug
 * Requirements: 3.1 - Display artist's public hub page via /[artistSlug]
 *
 * Used for the Public Artist Hub page to fetch artist data by their unique slug.
 * Returns null if no artist found with the given slug.
 *
 * @param slug - Artist's unique URL slug
 * @returns Artist document or null if not found
 */
export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_slug", (q) => q.eq("artistSlug", args.slug.toLowerCase()))
      .unique();

    return artist;
  },
});

/**
 * Get artist by owner user ID
 * Used to fetch the artist profile for the currently authenticated user
 *
 * @param ownerUserId - Convex user ID of the artist owner
 * @returns Artist document or null if not found
 */
export const getByOwner = query({
  args: {
    ownerUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", args.ownerUserId))
      .unique();

    return artist;
  },
});

/**
 * Get current user's artist profile
 * Convenience query that uses the authenticated user's identity
 *
 * @returns Artist document or null if not authenticated/not found
 */
export const getCurrentArtist = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    // Get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    // Get the artist profile for this user
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", user._id))
      .unique();

    return artist;
  },
});

/**
 * Create new artist profile
 * Requirements: 5.4, 5.5, 15.7 - Create artist with unique slug, reject reserved slugs
 *
 * Creates a new artist profile for the authenticated user.
 * Validates:
 * - User is authenticated
 * - User has "artist" role
 * - User doesn't already have an artist profile
 * - Slug is not reserved
 * - Slug is unique (not already taken)
 * - Slug format is valid
 *
 * @param artistSlug - Unique URL slug for the artist
 * @param displayName - Artist's display name
 * @param bio - Optional artist biography
 * @param avatarUrl - Optional avatar image URL
 * @param coverUrl - Optional cover image URL
 * @param socials - Array of social media links
 * @returns The new artist's Convex document ID
 * @throws Error if validation fails
 */
export const create = mutation({
  args: {
    artistSlug: v.string(),
    displayName: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    socials: v.optional(
      v.array(
        v.object({
          platform: v.string(),
          url: v.string(),
          active: v.boolean(),
        })
      )
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

    // Verify user has artist role
    if (user.role !== "artist") {
      throw new Error("Only artists can create an artist profile");
    }

    // Check if user already has an artist profile
    const existingArtist = await ctx.db
      .query("artists")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", user._id))
      .unique();

    if (existingArtist) {
      throw new Error("You already have an artist profile");
    }

    // Normalize slug to lowercase
    const normalizedSlug = args.artistSlug.toLowerCase().trim();

    // Validate slug format and reserved status
    validateSlugFormatAndReserved(normalizedSlug);

    // Check if slug is already taken
    const existingSlug = await findArtistBySlug(ctx, normalizedSlug);
    if (existingSlug) {
      throw new Error(`The slug "${normalizedSlug}" is already taken`);
    }

    // Create the artist profile
    const now = Date.now();
    const artistId = await ctx.db.insert("artists", {
      ownerUserId: user._id,
      artistSlug: normalizedSlug,
      displayName: args.displayName.trim(),
      bio: args.bio?.trim(),
      avatarUrl: args.avatarUrl,
      coverUrl: args.coverUrl,
      socials: args.socials ?? [],
      createdAt: now,
      updatedAt: now,
    });

    return artistId;
  },
});

/**
 * Apply optional field updates to the updates object
 */
function applyOptionalUpdates(
  updates: Record<string, unknown>,
  args: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    coverUrl?: string;
    socials?: Array<{ platform: string; url: string; active: boolean }>;
  }
): void {
  if (args.displayName !== undefined) {
    updates.displayName = args.displayName.trim();
  }
  if (args.bio !== undefined) {
    updates.bio = args.bio.trim();
  }
  if (args.avatarUrl !== undefined) {
    updates.avatarUrl = args.avatarUrl;
  }
  if (args.coverUrl !== undefined) {
    updates.coverUrl = args.coverUrl;
  }
  if (args.socials !== undefined) {
    updates.socials = args.socials;
  }
}

/**
 * Update artist profile
 * Requirements: 5.4, 5.5, 15.7 - Update profile with slug uniqueness check
 *
 * Updates an existing artist profile.
 * Validates:
 * - User is authenticated
 * - User owns the artist profile
 * - If slug is changed: not reserved and not already taken
 *
 * @param artistId - ID of the artist to update
 * @param artistSlug - Optional new slug (if changing)
 * @param displayName - Optional new display name
 * @param bio - Optional new biography
 * @param avatarUrl - Optional new avatar URL
 * @param coverUrl - Optional new cover URL
 * @param socials - Optional new social links array
 * @returns The updated artist's Convex document ID
 * @throws Error if validation fails
 */
export const update = mutation({
  args: {
    artistId: v.id("artists"),
    artistSlug: v.optional(v.string()),
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    socials: v.optional(
      v.array(
        v.object({
          platform: v.string(),
          url: v.string(),
          active: v.boolean(),
        })
      )
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

    // Get the artist profile
    const artist = await ctx.db.get(args.artistId);
    if (!artist) {
      throw new Error("Artist profile not found");
    }

    // Verify ownership
    if (artist.ownerUserId !== user._id) {
      throw new Error("Not authorized to modify this profile");
    }

    // Build update object
    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    // Handle slug update if provided
    if (args.artistSlug !== undefined) {
      const normalizedSlug = args.artistSlug.toLowerCase().trim();

      // Only validate if slug is actually changing
      if (normalizedSlug !== artist.artistSlug) {
        // Validate slug format and reserved status
        validateSlugFormatAndReserved(normalizedSlug);

        // Check if slug is already taken by another artist
        const existingSlug = await findArtistBySlug(ctx, normalizedSlug);
        if (existingSlug && existingSlug._id !== args.artistId) {
          throw new Error(`The slug "${normalizedSlug}" is already taken`);
        }

        updates.artistSlug = normalizedSlug;
      }
    }

    // Apply optional field updates
    applyOptionalUpdates(updates, args);

    // Apply updates
    await ctx.db.patch(args.artistId, updates);

    return args.artistId;
  },
});

/**
 * Check if a slug is available
 * Utility query to check slug availability before form submission
 *
 * @param slug - Slug to check
 * @param excludeArtistId - Optional artist ID to exclude (for updates)
 * @returns Object with available boolean and reason if not available
 */
export const checkSlugAvailability = query({
  args: {
    slug: v.string(),
    excludeArtistId: v.optional(v.id("artists")),
  },
  handler: async (ctx, args) => {
    const normalizedSlug = args.slug.toLowerCase().trim();

    // Check format
    if (!isValidSlugFormat(normalizedSlug)) {
      return {
        available: false,
        reason: "Invalid format",
      };
    }

    // Check if reserved
    if (isReservedSlug(normalizedSlug)) {
      return {
        available: false,
        reason: "Reserved slug",
      };
    }

    // Check if taken
    const existingSlug = await findArtistBySlug(ctx, normalizedSlug);

    if (existingSlug) {
      // If we're excluding an artist (for updates), check if it's the same one
      if (args.excludeArtistId && existingSlug._id === args.excludeArtistId) {
        return {
          available: true,
          reason: null,
        };
      }

      return {
        available: false,
        reason: "Slug already taken",
      };
    }

    return {
      available: true,
      reason: null,
    };
  },
});

/**
 * Get suggested artists for the current user
 * Requirements: 9.5 - Display "Suggested Artists" in fan dashboard sidebar
 *
 * Returns a list of artists that the current user is not following.
 * For MVP, returns up to 5 random artists.
 * Future enhancement: implement recommendation algorithm based on genres, popularity, etc.
 *
 * @param limit - Maximum number of artists to return (default: 5)
 * @returns Array of artist documents that the user is not following
 */
export const getSuggestedArtists = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;

    // Get authentication identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Not authenticated, return empty array
      return [];
    }

    // Get the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    // Get all artists the user is following
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_fan", (q) => q.eq("fanUserId", user._id))
      .collect();

    const followedArtistIds = new Set(follows.map((f) => f.artistId));

    // Get all artists
    const allArtists = await ctx.db.query("artists").collect();

    // Filter out followed artists and the user's own artist profile (if they have one)
    const unfollowedArtists = allArtists.filter(
      (artist) =>
        !followedArtistIds.has(artist._id) && artist.ownerUserId !== user._id
    );

    // For MVP, return a simple slice of unfollowed artists
    // Future: implement recommendation algorithm (genre matching, popularity, etc.)
    return unfollowedArtists.slice(0, limit);
  },
});
