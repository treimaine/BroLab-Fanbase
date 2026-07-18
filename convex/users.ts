/**
 * Users Functions
 * Requirements: 15.2 - Sync Clerk → Convex on sign-in
 * 
 * Handles user synchronization between Clerk and Convex:
 * - upsertFromClerk: Create or update user from Clerk data
 * - getByClerkId: Retrieve user by Clerk user ID
 */

import { v } from "convex/values";
import Stripe from "stripe";
import { internal } from "./_generated/api";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";

/**
 * Upsert user from Clerk data
 * Requirements: 15.2 - Create/update Convex user record when user signs up via Clerk
 * 
 * This function is called after Clerk authentication to sync user data to Convex.
 * If user exists (by clerkUserId), updates their data.
 * If user doesn't exist, creates a new record.
 *
 * Slug policy:
 * - The slug is derived (slugified + uniquified) from the explicit Clerk
 *   username when one exists, otherwise from the display name
 *   ("Steve LEMBA" → "steve-lemba"). The raw Clerk user id is only a last
 *   resort when both are empty.
 * - Existing users keep their slug stable across webhooks, EXCEPT when it is
 *   the legacy clerkUserId fallback (healed to a proper slug) or when an
 *   explicit Clerk username was set/changed (deliberate rename).
 *
 * @param clerkUserId - Clerk's unique user identifier
 * @param role - User role ("artist" or "fan")
 * @param displayName - User's display name
 * @param username - Optional explicit Clerk username (raw, not slugified)
 * @param avatarUrl - Optional avatar image URL
 * @param email - User email (for Stripe customer creation)
 * @returns The user's Convex document ID
 */

/** Lowercase, strip accents, non-alphanumerics → "-", collapse, trim. */
function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replaceAll(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
}

/** Find a slug not used by another user (appends -2, -3… when taken). */
async function generateUniqueUsernameSlug(
  ctx: { db: any },
  baseSlug: string,
  excludeUserId?: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const taken = await ctx.db
      .query("users")
      .withIndex("by_username", (q: any) => q.eq("usernameSlug", slug))
      .unique();

    if (!taken || taken._id === excludeUserId) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export const upsertFromClerk = mutation({
  args: {
    clerkUserId: v.string(),
    role: v.union(v.literal("artist"), v.literal("fan")),
    displayName: v.string(),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { clerkUserId, role, displayName, username, avatarUrl } = args;

    // Preferred slug base: explicit Clerk username > display name > clerk id
    const desiredBase =
      slugify(username ?? "") ||
      slugify(displayName) ||
      clerkUserId.toLowerCase();

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (existingUser) {
      // Check if role is changing
      const roleChanged = existingUser.role !== role;
      const oldRole = existingUser.role;

      // Keep the slug stable, except:
      // - legacy fallback (slug === clerkUserId) → heal it, or
      // - an explicit Clerk username was set/changed → deliberate rename.
      const isLegacyIdSlug =
        existingUser.usernameSlug === clerkUserId ||
        existingUser.usernameSlug === clerkUserId.toLowerCase();
      const explicitRename =
        !!slugify(username ?? "") &&
        slugify(username ?? "") !== existingUser.usernameSlug;

      const usernameSlug =
        isLegacyIdSlug || explicitRename
          ? await generateUniqueUsernameSlug(ctx, desiredBase, existingUser._id)
          : existingUser.usernameSlug;

      // Update existing user
      await ctx.db.patch(existingUser._id, {
        role,
        displayName,
        usernameSlug,
        avatarUrl,
      });

      // Log role change if it occurred
      if (roleChanged) {
        await ctx.runMutation(internal.security.logRoleChange, {
          userId: existingUser._id,
          clerkUserId,
          oldRole,
          newRole: role,
          changedBy: "system", // Could be enhanced to track who made the change
        });
      }

      return existingUser._id;
    }

    // Create new user with a unique, human-readable slug
    const usernameSlug = await generateUniqueUsernameSlug(ctx, desiredBase);

    const userId = await ctx.db.insert("users", {
      clerkUserId,
      role,
      displayName,
      usernameSlug,
      avatarUrl,
      createdAt: Date.now(),
    });

    return userId;
  },
});

/**
 * One-shot backfill: heal users whose usernameSlug is the legacy clerkUserId
 * fallback, deriving a proper unique slug from their display name.
 *
 * Run manually: `npx convex run users:backfillUsernameSlugs`
 */
export const backfillUsernameSlugs = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const healed: { clerkUserId: string; from: string; to: string }[] = [];

    for (const user of users) {
      const isLegacyIdSlug =
        user.usernameSlug === user.clerkUserId ||
        user.usernameSlug === user.clerkUserId.toLowerCase();
      if (!isLegacyIdSlug) continue;

      const base =
        slugify(user.displayName) || user.clerkUserId.toLowerCase();
      const slug = await generateUniqueUsernameSlug(ctx, base, user._id);

      await ctx.db.patch(user._id, { usernameSlug: slug });
      healed.push({
        clerkUserId: user.clerkUserId,
        from: user.usernameSlug,
        to: slug,
      });
    }

    return { healedCount: healed.length, healed };
  },
});

/**
 * Get user by Clerk user ID (internal query)
 * Requirements: 15.2 - Retrieve Convex user record by Clerk ID
 * 
 * Used internally by actions to fetch the Convex user record associated with a Clerk user.
 * Returns null if no user found.
 * 
 * @param clerkUserId - Clerk's unique user identifier
 * @returns User document or null if not found
 */
export const getByClerkId = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();

    return user;
  },
});

/**
 * Internal query: Get user by Clerk user ID
 * Used by internal actions only
 */
export const getByClerkIdInternal = internalQuery({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();

    return user;
  },
});

/**
 * Get current authenticated user
 * Convenience query that uses the authenticated user's identity
 * 
 * @returns User document or null if not authenticated/not found
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return null;
    }

    // Clerk's subject is the user ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    return user;
  },
});

/**
 * Get user by username slug
 * Used for public profile lookups
 * 
 * @param usernameSlug - URL-friendly username
 * @returns User document or null if not found
 */
export const getByUsername = query({
  args: {
    usernameSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("usernameSlug", args.usernameSlug))
      .unique();

    return user;
  },
});

/**
 * Get Stripe client instance
 * Lazy initialization to avoid errors during Convex deployment analysis
 */
function getStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "Stripe is not configured. Please set STRIPE_SECRET_KEY in your Convex environment variables."
    );
  }
  
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-12-15.clover",
  });
}

/**
 * Create Stripe customer for user (called from webhook)
 * Requirements: R-FAN-PM-1.2, R-FAN-PM-1.3 - Stripe customer binding
 * 
 * This action creates a Stripe customer when a new user is created via Clerk webhook.
 * It's idempotent - if the user already has a stripeCustomerId, it returns early.
 * 
 * @param clerkUserId - Clerk user ID
 * @param email - User email
 * @returns Object with stripeCustomerId
 */
export const createStripeCustomer = action({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args): Promise<{ stripeCustomerId: string }> => {
    // Get user from Convex using internal query
    const user = await ctx.runQuery(internal.users.getByClerkIdInternal, {
      clerkUserId: args.clerkUserId,
    });

    if (!user) {
      throw new Error(`User not found for Clerk ID: ${args.clerkUserId}`);
    }

    // If user already has a Stripe customer ID, return it (idempotent)
    if (user.stripeCustomerId) {
      console.log(`User ${args.clerkUserId} already has Stripe customer: ${user.stripeCustomerId}`);
      return { stripeCustomerId: user.stripeCustomerId };
    }

    // Create Stripe customer with email and metadata
    console.log(`Creating Stripe customer for user ${args.clerkUserId} with email ${args.email}`);
    const stripe = getStripeClient();
    const customer = await stripe.customers.create({
      email: args.email,
      metadata: {
        convexUserId: user._id,
        clerkUserId: args.clerkUserId,
      },
    });

    console.log(`Stripe customer created: ${customer.id}`);

    // Store stripeCustomerId in Convex
    await ctx.runMutation(internal.users.updateStripeCustomerId, {
      userId: user._id,
      stripeCustomerId: customer.id,
    });

    console.log(`Stripe customer ID saved to Convex for user ${args.clerkUserId}`);

    return { stripeCustomerId: customer.id };
  },
});

/**
 * Internal mutation: Update user's Stripe customer ID
 * Requirements: R-FAN-PM-1.2 - Store stripeCustomerId in Convex
 */
export const updateStripeCustomerId = internalMutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      stripeCustomerId: args.stripeCustomerId,
    });
  },
});

/**
 * Helper: Delete all records from a table by index
 */
async function deleteRecordsByIndex<T extends string>(
  ctx: any,
  table: T,
  indexName: string,
  indexValue: any
) {
  const records = await ctx.db
    .query(table)
    .withIndex(indexName, (q: any) => q.eq(indexName.replace("by_", ""), indexValue))
    .collect();
  
  for (const record of records) {
    await ctx.db.delete(record._id);
  }
}

/**
 * Helper: Delete artist-related data
 */
async function deleteArtistData(ctx: any, artistId: any) {
  // Delete links, events, products, follows, balance snapshots, and payouts
  await Promise.all([
    deleteRecordsByIndex(ctx, "links", "by_artist", artistId),
    deleteRecordsByIndex(ctx, "events", "by_artist", artistId),
    deleteRecordsByIndex(ctx, "products", "by_artist", artistId),
    deleteRecordsByIndex(ctx, "follows", "by_artist", artistId),
    deleteRecordsByIndex(ctx, "artistBalanceSnapshots", "by_artist", artistId),
    deleteRecordsByIndex(ctx, "artistPayouts", "by_artist", artistId),
  ]);
  
  // Delete artist profile
  await ctx.db.delete(artistId);
}

/**
 * Helper: Delete fan-related data
 */
async function deleteFanData(ctx: any, userId: any) {
  // Delete follows, downloads, and payment methods
  await Promise.all([
    deleteRecordsByIndex(ctx, "follows", "by_fan", userId),
    deleteRecordsByIndex(ctx, "downloads", "by_fan", userId),
    deleteRecordsByIndex(ctx, "paymentMethods", "by_userId", userId),
  ]);
  
  // Delete orders and their items
  const orders = await ctx.db
    .query("orders")
    .withIndex("by_fan", (q: any) => q.eq("fanUserId", userId))
    .collect();
  
  for (const order of orders) {
    await deleteRecordsByIndex(ctx, "orderItems", "by_order", order._id);
    await ctx.db.delete(order._id);
  }
}

/**
 * Delete user and all associated data
 * Requirements: User deletion cleanup
 * 
 * Handles cascading deletion of all user-related data:
 * - For artists: profile, links, events, products, follows
 * - For fans: follows, orders, orderItems, downloads, payment methods
 * - Finally deletes the user record
 * 
 * @param clerkUserId - Clerk's unique user identifier
 */
export const deleteByClerkId = mutation({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();

    if (!user) {
      console.log(`User ${args.clerkUserId} not found in Convex`);
      return;
    }

    // Delete based on role
    if (user.role === "artist") {
      const artist = await ctx.db
        .query("artists")
        .withIndex("by_owner", (q) => q.eq("ownerUserId", user._id))
        .unique();

      if (artist) {
        await deleteArtistData(ctx, artist._id);
      }
    } else if (user.role === "fan") {
      await deleteFanData(ctx, user._id);
    }

    // Finally, delete the user
    await ctx.db.delete(user._id);

    console.log(`✅ User ${args.clerkUserId} and all associated data deleted from Convex`);
  },
});
