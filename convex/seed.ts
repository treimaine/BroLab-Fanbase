/**
 * Seed Data Functions
 * Requirements: Dev setup
 *
 * Provides seed data for development and testing:
 * - seedTestArtist: Creates a test artist with sample data for Public Hub testing
 * - linkClerkUserToTestArtist: Links a real Clerk account to test artist
 * - clearSeedData: Removes seed data (for cleanup)
 */

import { GenericMutationCtx } from "convex/server";
import { v } from "convex/values";
import { DataModel, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

type MutationCtx = GenericMutationCtx<DataModel>;

// =============================================================================
// TEST DATA CONSTANTS
// =============================================================================

const SEED_CLERK_USER_ID = "seed_test_user_001";

const TEST_USER = {
  clerkUserId: SEED_CLERK_USER_ID,
  role: "artist" as const,
  displayName: "Treigua",
  usernameSlug: "treigua",
  avatarUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
};

const TEST_ARTIST = {
  artistSlug: "treigua",
  displayName: "Treigua",
  bio: "Independent artist passionate about music and creation. Connecting with my fans is my priority.",
  avatarUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
  coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=400&fit=crop",
  socials: [
    { platform: "instagram", url: "https://instagram.com/treigua", active: true },
    { platform: "twitter", url: "https://twitter.com/treigua", active: true },
    { platform: "spotify", url: "https://open.spotify.com/artist/treigua", active: true },
    { platform: "youtube", url: "https://youtube.com/@treigua", active: true },
    { platform: "soundcloud", url: "https://soundcloud.com/treigua", active: false },
  ],
};

const TEST_LINKS = [
  { title: "New Single - On The Road", url: "https://open.spotify.com/album/example", type: "latest-release", active: false, order: 0 },
  { title: "Official Merch Store", url: "https://treigua-merch.example.com", type: "merch", active: false, order: 1 },
  { title: "Book Me for Events", url: "https://booking.example.com/treigua", type: "booking", active: false, order: 2 },
  { title: "Press Kit & Media", url: "https://treigua.example.com/press", type: "presskit", active: false, order: 3 },
  { title: "Newsletter Signup", url: "https://newsletter.example.com/treigua", type: "newsletter", active: false, order: 4 },
];

const TEST_EVENTS = [
  { title: "Treigua Live - Los Angeles", date: Date.now() + 30 * 24 * 60 * 60 * 1000, venue: "The Wiltern", city: "Los Angeles, CA", ticketUrl: "https://ticketmaster.com/example", imageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop", ticketsSold: 850, revenue: 42500, status: "upcoming" as const },
  { title: "Treigua Live - New York", date: Date.now() + 45 * 24 * 60 * 60 * 1000, venue: "Terminal 5", city: "New York, NY", ticketUrl: "https://ticketmaster.com/example2", imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop", ticketsSold: 1200, revenue: 60000, status: "sold-out" as const },
  { title: "Summer Music Festival", date: Date.now() + 60 * 24 * 60 * 60 * 1000, venue: "Coachella Valley", city: "Indio, CA", ticketUrl: "https://coachella.com", imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=400&fit=crop", ticketsSold: 0, revenue: 0, status: "upcoming" as const },
];

const TEST_PRODUCTS = [
  { title: "On The Road (Full Album)", description: "10 original tracks. My debut studio album.", type: "music" as const, priceUSD: 9.99, coverImageUrl: "https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400&h=400&fit=crop", visibility: "public" as const },
  { title: "Night Sessions EP", description: "4 tracks recorded live. Intimate vibes.", type: "music" as const, priceUSD: 4.99, coverImageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop", visibility: "public" as const },
  { title: "Live at The Wiltern (Video)", description: "Full concert filmed in LA. 1h30 of pure energy.", type: "video" as const, priceUSD: 14.99, coverImageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=400&fit=crop", visibility: "public" as const },
];


// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function createTestLinks(ctx: MutationCtx, artistId: Id<"artists">, now: number) {
  for (const link of TEST_LINKS) {
    await ctx.db.insert("links", { artistId, ...link, createdAt: now });
  }
}

async function createTestEvents(ctx: MutationCtx, artistId: Id<"artists">, now: number) {
  for (const event of TEST_EVENTS) {
    await ctx.db.insert("events", { artistId, ...event, createdAt: now });
  }
}

async function createTestProducts(ctx: MutationCtx, artistId: Id<"artists">, now: number) {
  for (const product of TEST_PRODUCTS) {
    await ctx.db.insert("products", { artistId, ...product, createdAt: now, updatedAt: now });
  }
}

async function seedArtistRelatedData(ctx: MutationCtx, artistId: Id<"artists">, now: number) {
  const [existingLinks, existingEvents, existingProducts] = await Promise.all([
    ctx.db.query("links").withIndex("by_artist", (q) => q.eq("artistId", artistId)).collect(),
    ctx.db.query("events").withIndex("by_artist", (q) => q.eq("artistId", artistId)).collect(),
    ctx.db.query("products").withIndex("by_artist", (q) => q.eq("artistId", artistId)).collect(),
  ]);

  if (existingLinks.length === 0) await createTestLinks(ctx, artistId, now);
  if (existingEvents.length === 0) await createTestEvents(ctx, artistId, now);
  if (existingProducts.length === 0) await createTestProducts(ctx, artistId, now);
}

async function deleteArtistRelatedData(ctx: MutationCtx, artistId: Id<"artists">) {
  const [products, events, links, follows] = await Promise.all([
    ctx.db.query("products").withIndex("by_artist", (q) => q.eq("artistId", artistId)).collect(),
    ctx.db.query("events").withIndex("by_artist", (q) => q.eq("artistId", artistId)).collect(),
    ctx.db.query("links").withIndex("by_artist", (q) => q.eq("artistId", artistId)).collect(),
    ctx.db.query("follows").withIndex("by_artist", (q) => q.eq("artistId", artistId)).collect(),
  ]);

  await Promise.all([
    ...products.map((p) => ctx.db.delete(p._id)),
    ...events.map((e) => ctx.db.delete(e._id)),
    ...links.map((l) => ctx.db.delete(l._id)),
    ...follows.map((f) => ctx.db.delete(f._id)),
  ]);
}

async function findOrCreateUser(
  ctx: MutationCtx,
  clerkUserId: string,
  userData: { displayName: string; usernameSlug: string; avatarUrl?: string },
  now: number
): Promise<Id<"users">> {
  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", clerkUserId))
    .unique();

  if (existingUser) {
    await ctx.db.patch(existingUser._id, { role: "artist" });
    return existingUser._id;
  }

  return await ctx.db.insert("users", {
    clerkUserId,
    role: "artist",
    displayName: userData.displayName,
    usernameSlug: userData.usernameSlug,
    avatarUrl: userData.avatarUrl,
    createdAt: now,
  });
}

async function findOrCreateArtist(ctx: MutationCtx, userId: Id<"users">, now: number): Promise<Id<"artists">> {
  const existingArtist = await ctx.db
    .query("artists")
    .withIndex("by_owner", (q) => q.eq("ownerUserId", userId))
    .unique();

  if (existingArtist) return existingArtist._id;

  return await ctx.db.insert("artists", {
    ownerUserId: userId,
    ...TEST_ARTIST,
    createdAt: now,
    updatedAt: now,
  });
}

async function cleanupOldSeedArtist(ctx: MutationCtx, currentUserId: Id<"users">) {
  const existingArtist = await ctx.db
    .query("artists")
    .withIndex("by_slug", (q) => q.eq("artistSlug", TEST_ARTIST.artistSlug))
    .unique();

  if (!existingArtist || existingArtist.ownerUserId === currentUserId) return;

  const oldOwner = await ctx.db.get(existingArtist.ownerUserId);
  if (oldOwner?.clerkUserId !== SEED_CLERK_USER_ID) return;

  await deleteArtistRelatedData(ctx, existingArtist._id);
  await ctx.db.delete(existingArtist._id);
  await ctx.db.delete(oldOwner._id);
}


// =============================================================================
// PUBLIC MUTATIONS & QUERIES
// =============================================================================

/**
 * Seed test artist (Treigua) with all related data
 */
export const seedTestArtist = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const userId = await findOrCreateUser(ctx, TEST_USER.clerkUserId, TEST_USER, now);
    const artistId = await findOrCreateArtist(ctx, userId, now);
    await seedArtistRelatedData(ctx, artistId, now);

    const artist = await ctx.db.get(artistId);
    return {
      success: true,
      userId,
      artistId,
      artistSlug: artist?.artistSlug ?? TEST_ARTIST.artistSlug,
      message: `Test artist "${artist?.displayName ?? TEST_ARTIST.displayName}" seeded. Visit /treigua to view.`,
    };
  },
});

/**
 * Check if seed data exists
 */
export const checkSeedData = query({
  args: {},
  handler: async (ctx) => {
    const [user, artist] = await Promise.all([
      ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkUserId", TEST_USER.clerkUserId)).unique(),
      ctx.db.query("artists").withIndex("by_slug", (q) => q.eq("artistSlug", TEST_ARTIST.artistSlug)).unique(),
    ]);
    return { userExists: !!user, artistExists: !!artist, artistSlug: artist?.artistSlug ?? null };
  },
});

/**
 * Clear seed data
 */
export const clearSeedData = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkUserId", TEST_USER.clerkUserId)).unique();
    if (!user) return { success: true, message: "No seed data found" };

    const artist = await ctx.db.query("artists").withIndex("by_owner", (q) => q.eq("ownerUserId", user._id)).unique();
    if (artist) {
      await deleteArtistRelatedData(ctx, artist._id);
      await ctx.db.delete(artist._id);
    }
    await ctx.db.delete(user._id);
    return { success: true, message: "Seed data cleared" };
  },
});

/**
 * Link an existing Clerk user to the test artist (Treigua)
 */
export const linkClerkUserToTestArtist = mutation({
  args: {
    clerkUserId: v.string(),
    displayName: v.optional(v.string()),
    usernameSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const userData = {
      displayName: args.displayName ?? TEST_ARTIST.displayName,
      usernameSlug: args.usernameSlug ?? TEST_ARTIST.artistSlug,
      avatarUrl: TEST_ARTIST.avatarUrl,
    };

    const userId = await findOrCreateUser(ctx, args.clerkUserId, userData, now);
    await cleanupOldSeedArtist(ctx, userId);
    const artistId = await findOrCreateArtist(ctx, userId, now);
    await seedArtistRelatedData(ctx, artistId, now);

    const artist = await ctx.db.get(artistId);
    return {
      success: true,
      userId,
      artistId,
      artistSlug: artist?.artistSlug ?? TEST_ARTIST.artistSlug,
      message: `Clerk account linked to "${artist?.displayName ?? TEST_ARTIST.displayName}". Visit /treigua or /dashboard.`,
    };
  },
});

/**
 * Seed test fan user with follows and feed data for pagination testing
 * Requirements: R-FAN-FEED-1..5 - Pagination testing
 * 
 * Creates:
 * - 1 fan user
 * - 3 test artists (each with 8 products = 24 total feed items)
 * - Follow relationships between fan and all artists
 */
export const seedFanFeedTestData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Create fan user
    const fanUserId = await ctx.db.insert("users", {
      clerkUserId: "seed_test_fan_001",
      role: "fan",
      displayName: "Test Fan",
      usernameSlug: "testfan",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop",
      createdAt: now,
    });

    // Create 3 test artists
    const artistData = [
      {
        slug: "djnova",
        name: "DJ Nova",
        bio: "Electronic music producer and DJ",
        avatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
        cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=400&fit=crop",
      },
      {
        slug: "soulvibes",
        name: "Soul Vibes",
        bio: "R&B and soul artist",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
        cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=400&fit=crop",
      },
      {
        slug: "rocklegend",
        name: "Rock Legend",
        bio: "Classic rock and modern alternative",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
        cover: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=1200&h=400&fit=crop",
      },
    ];

    const artistIds: Id<"artists">[] = [];

    for (const data of artistData) {
      // Create artist owner user
      const artistUserId = await ctx.db.insert("users", {
        clerkUserId: `seed_artist_${data.slug}`,
        role: "artist",
        displayName: data.name,
        usernameSlug: data.slug,
        avatarUrl: data.avatar,
        createdAt: now,
      });

      // Create artist profile
      const artistId = await ctx.db.insert("artists", {
        ownerUserId: artistUserId,
        artistSlug: data.slug,
        displayName: data.name,
        bio: data.bio,
        avatarUrl: data.avatar,
        coverUrl: data.cover,
        socials: [],
        createdAt: now,
        updatedAt: now,
      });

      artistIds.push(artistId);

      // Create 8 products per artist (24 total = enough for pagination testing)
      for (let i = 1; i <= 8; i++) {
        await ctx.db.insert("products", {
          artistId,
          title: `${data.name} - Track ${i}`,
          description: `Amazing track number ${i} from ${data.name}`,
          type: i % 2 === 0 ? "video" : "music",
          priceUSD: 4.99 + i,
          coverImageUrl: `https://images.unsplash.com/photo-${1614149162883 + i}?w=400&h=400&fit=crop`,
          visibility: "public",
          createdAt: now - (i * 60 * 60 * 1000), // Stagger creation times
          updatedAt: now - (i * 60 * 60 * 1000),
        });
      }

      // Create follow relationship
      await ctx.db.insert("follows", {
        fanUserId,
        artistId,
        createdAt: now,
      });
    }

    return {
      success: true,
      fanUserId,
      artistIds,
      totalProducts: 24,
      message: "Fan feed test data seeded. Fan user: testfan, 3 artists with 8 products each (24 total items)",
    };
  },
});

/**
 * Clear fan feed test data
 */
export const clearFanFeedTestData = mutation({
  args: {},
  handler: async (ctx) => {
    // Find and delete fan user
    const fanUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", "seed_test_fan_001"))
      .unique();

    if (fanUser) {
      // Delete follows
      const follows = await ctx.db
        .query("follows")
        .withIndex("by_fan", (q) => q.eq("fanUserId", fanUser._id))
        .collect();
      await Promise.all(follows.map((f) => ctx.db.delete(f._id)));

      // Delete fan user
      await ctx.db.delete(fanUser._id);
    }

    // Find and delete test artists
    const artistSlugs = ["djnova", "soulvibes", "rocklegend"];
    for (const slug of artistSlugs) {
      const artist = await ctx.db
        .query("artists")
        .withIndex("by_slug", (q) => q.eq("artistSlug", slug))
        .unique();

      if (artist) {
        // Delete products
        const products = await ctx.db
          .query("products")
          .withIndex("by_artist", (q) => q.eq("artistId", artist._id))
          .collect();
        await Promise.all(products.map((p) => ctx.db.delete(p._id)));

        // Delete artist
        await ctx.db.delete(artist._id);

        // Delete artist owner user
        const artistUser = await ctx.db.get(artist.ownerUserId);
        if (artistUser) {
          await ctx.db.delete(artistUser._id);
        }
      }
    }

    return {
      success: true,
      message: "Fan feed test data cleared",
    };
  },
});

/**
 * Clear ALL QA test data (production cleanup)
 * Removes all test artists, products, and follows created during QA testing
 */
export const clearAllQATestData = mutation({
  args: {},
  handler: async (ctx) => {
    const testArtistSlugs = ["djnova-test", "soulvibes-test", "rocklegend-test"];
    let deletedArtists = 0;
    let deletedProducts = 0;
    let deletedFollows = 0;
    let deletedUsers = 0;

    // Delete test artists and their data
    for (const slug of testArtistSlugs) {
      const artist = await ctx.db
        .query("artists")
        .withIndex("by_slug", (q) => q.eq("artistSlug", slug))
        .unique();

      if (artist) {
        // Delete products
        const products = await ctx.db
          .query("products")
          .withIndex("by_artist", (q) => q.eq("artistId", artist._id))
          .collect();
        await Promise.all(products.map((p) => ctx.db.delete(p._id)));
        deletedProducts += products.length;

        // Delete follows
        const follows = await ctx.db
          .query("follows")
          .withIndex("by_artist", (q) => q.eq("artistId", artist._id))
          .collect();
        await Promise.all(follows.map((f) => ctx.db.delete(f._id)));
        deletedFollows += follows.length;

        // Delete artist
        await ctx.db.delete(artist._id);
        deletedArtists++;

        // Delete artist owner user
        const artistUser = await ctx.db.get(artist.ownerUserId);
        if (artistUser?.clerkUserId.startsWith("seed_artist_")) {
          await ctx.db.delete(artistUser._id);
          deletedUsers++;
        }
      }
    }

    return {
      success: true,
      deletedArtists,
      deletedProducts,
      deletedFollows,
      deletedUsers,
      message: `QA test data cleared: ${deletedArtists} artists, ${deletedProducts} products, ${deletedFollows} follows, ${deletedUsers} users`,
    };
  },
});
