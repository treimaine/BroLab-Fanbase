/**
 * Seed Data Functions
 * Requirements: Dev setup
 *
 * Provides seed data for development and testing:
 * - seedTestArtist: Creates a test artist with sample data for Public Hub testing
 * - clearSeedData: Removes seed data (for cleanup)
 */

import { mutation, query } from "./_generated/server";

/**
 * Test user data for seeding
 */
const TEST_USER = {
  clerkUserId: "seed_test_user_001",
  role: "artist" as const,
  displayName: "DJ Nova",
  usernameSlug: "djnova",
  avatarUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
};

/**
 * Test artist data for seeding
 */
const TEST_ARTIST = {
  artistSlug: "djnova",
  displayName: "DJ Nova",
  bio: "Electronic music producer and DJ based in Los Angeles. Creating beats that move your soul since 2015. 🎧✨",
  avatarUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
  coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=400&fit=crop",
  socials: [
    { platform: "instagram", url: "https://instagram.com/djnova", active: true },
    { platform: "twitter", url: "https://twitter.com/djnova", active: true },
    { platform: "spotify", url: "https://open.spotify.com/artist/djnova", active: true },
    { platform: "youtube", url: "https://youtube.com/@djnova", active: true },
    { platform: "soundcloud", url: "https://soundcloud.com/djnova", active: false },
  ],
};

/**
 * Test links data for seeding
 */
const TEST_LINKS = [
  {
    title: "New Album - Neon Dreams",
    url: "https://open.spotify.com/album/example",
    type: "latest-release",
    active: true,
    order: 0,
  },
  {
    title: "Follow on Instagram",
    url: "https://instagram.com/djnova",
    type: "instagram",
    active: true,
    order: 1,
  },
  {
    title: "Subscribe on YouTube",
    url: "https://youtube.com/@djnova",
    type: "youtube",
    active: true,
    order: 2,
  },
  {
    title: "Listen on Spotify",
    url: "https://open.spotify.com/artist/djnova",
    type: "spotify",
    active: true,
    order: 3,
  },
];

/**
 * Test events data for seeding
 */
const TEST_EVENTS = [
  {
    title: "Neon Dreams Tour - LA",
    date: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    venue: "The Wiltern",
    city: "Los Angeles, CA",
    ticketUrl: "https://ticketmaster.com/example",
    imageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop",
    ticketsSold: 1250,
    revenue: 62500,
    status: "upcoming" as const,
  },
  {
    title: "Neon Dreams Tour - NYC",
    date: Date.now() + 45 * 24 * 60 * 60 * 1000, // 45 days from now
    venue: "Terminal 5",
    city: "New York, NY",
    ticketUrl: "https://ticketmaster.com/example2",
    imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop",
    ticketsSold: 2800,
    revenue: 140000,
    status: "sold-out" as const,
  },
  {
    title: "Summer Festival Set",
    date: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days from now
    venue: "Coachella Valley",
    city: "Indio, CA",
    ticketUrl: "https://coachella.com",
    imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=400&fit=crop",
    ticketsSold: 0,
    revenue: 0,
    status: "upcoming" as const,
  },
];

/**
 * Test products data for seeding
 */
const TEST_PRODUCTS = [
  {
    title: "Neon Dreams (Full Album)",
    description: "12 tracks of pure electronic bliss. Includes bonus remixes.",
    type: "music" as const,
    priceUSD: 9.99,
    coverImageUrl: "https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400&h=400&fit=crop",
    visibility: "public" as const,
  },
  {
    title: "Midnight Sessions EP",
    description: "4-track EP featuring late night vibes and deep house beats.",
    type: "music" as const,
    priceUSD: 4.99,
    coverImageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    visibility: "public" as const,
  },
  {
    title: "Live at The Wiltern (Video)",
    description: "Full concert recording from the LA show. 2 hours of non-stop energy.",
    type: "video" as const,
    priceUSD: 14.99,
    coverImageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=400&fit=crop",
    visibility: "public" as const,
  },
];

/**
 * Seed test artist with all related data
 * Creates a complete test artist profile for Public Hub testing
 *
 * @returns Object with created IDs and status
 */
export const seedTestArtist = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Check if test user already exists
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", TEST_USER.clerkUserId))
      .unique();

    if (!user) {
      // Create test user
      const userId = await ctx.db.insert("users", {
        ...TEST_USER,
        createdAt: now,
      });
      user = await ctx.db.get(userId);
    }

    if (!user) {
      throw new Error("Failed to create or retrieve test user");
    }

    // Check if test artist already exists
    let artist = await ctx.db
      .query("artists")
      .withIndex("by_slug", (q) => q.eq("artistSlug", TEST_ARTIST.artistSlug))
      .unique();

    if (!artist) {
      // Create test artist
      const artistId = await ctx.db.insert("artists", {
        ownerUserId: user._id,
        ...TEST_ARTIST,
        createdAt: now,
        updatedAt: now,
      });
      artist = await ctx.db.get(artistId);
    }

    if (!artist) {
      throw new Error("Failed to create or retrieve test artist");
    }

    // Store artist ID for use in subsequent queries
    const artistId = artist._id;
    const artistSlug = artist.artistSlug;
    const artistDisplayName = artist.displayName;

    // Check if links already exist for this artist
    const existingLinks = await ctx.db
      .query("links")
      .withIndex("by_artist", (q) => q.eq("artistId", artistId))
      .collect();

    if (existingLinks.length === 0) {
      // Create test links
      for (const link of TEST_LINKS) {
        await ctx.db.insert("links", {
          artistId: artistId,
          ...link,
          createdAt: now,
        });
      }
    }

    // Check if events already exist for this artist
    const existingEvents = await ctx.db
      .query("events")
      .withIndex("by_artist", (q) => q.eq("artistId", artistId))
      .collect();

    if (existingEvents.length === 0) {
      // Create test events
      for (const event of TEST_EVENTS) {
        await ctx.db.insert("events", {
          artistId: artistId,
          ...event,
          createdAt: now,
        });
      }
    }

    // Check if products already exist for this artist
    const existingProducts = await ctx.db
      .query("products")
      .withIndex("by_artist", (q) => q.eq("artistId", artistId))
      .collect();

    if (existingProducts.length === 0) {
      // Create test products
      for (const product of TEST_PRODUCTS) {
        await ctx.db.insert("products", {
          artistId: artistId,
          ...product,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return {
      success: true,
      userId: user._id,
      artistId: artistId,
      artistSlug: artistSlug,
      message: `Test artist "${artistDisplayName}" seeded successfully. Visit /djnova to view the Public Hub.`,
    };
  },
});

/**
 * Check if seed data exists
 * Utility query to check if test data has been seeded
 *
 * @returns Object with existence status
 */
export const checkSeedData = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", TEST_USER.clerkUserId))
      .unique();

    const artist = await ctx.db
      .query("artists")
      .withIndex("by_slug", (q) => q.eq("artistSlug", TEST_ARTIST.artistSlug))
      .unique();

    return {
      userExists: !!user,
      artistExists: !!artist,
      artistSlug: artist?.artistSlug ?? null,
    };
  },
});

/**
 * Clear seed data
 * Removes all test data created by seedTestArtist
 * Use with caution - this deletes data!
 *
 * @returns Object with deletion status
 */
export const clearSeedData = mutation({
  args: {},
  handler: async (ctx) => {
    // Find test user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", TEST_USER.clerkUserId))
      .unique();

    if (!user) {
      return {
        success: true,
        message: "No seed data found to clear",
      };
    }

    // Find test artist
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", user._id))
      .unique();

    if (artist) {
      // Delete products
      const products = await ctx.db
        .query("products")
        .withIndex("by_artist", (q) => q.eq("artistId", artist._id))
        .collect();
      for (const product of products) {
        await ctx.db.delete(product._id);
      }

      // Delete events
      const events = await ctx.db
        .query("events")
        .withIndex("by_artist", (q) => q.eq("artistId", artist._id))
        .collect();
      for (const event of events) {
        await ctx.db.delete(event._id);
      }

      // Delete links
      const links = await ctx.db
        .query("links")
        .withIndex("by_artist", (q) => q.eq("artistId", artist._id))
        .collect();
      for (const link of links) {
        await ctx.db.delete(link._id);
      }

      // Delete follows
      const follows = await ctx.db
        .query("follows")
        .withIndex("by_artist", (q) => q.eq("artistId", artist._id))
        .collect();
      for (const follow of follows) {
        await ctx.db.delete(follow._id);
      }

      // Delete artist
      await ctx.db.delete(artist._id);
    }

    // Delete user
    await ctx.db.delete(user._id);

    return {
      success: true,
      message: "Seed data cleared successfully",
    };
  },
});
