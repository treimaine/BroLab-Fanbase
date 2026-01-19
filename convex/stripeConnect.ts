/**
 * Stripe Connect Integration (Convex Actions)
 * Requirements: R-ART-CONNECT-1 - Stripe Connect Express onboarding
 * 
 * Handles Stripe Connect operations for artist payouts:
 * - createAccount: Create Stripe Connect Express account
 * - createAccountLink: Generate onboarding/refresh URL
 * - createLoginLink: Generate Express dashboard URL for "Manage Payouts"
 * - Store stripeConnectAccountId in artists table
 * 
 * Business Model:
 * - Fans pay artists directly (no platform commission)
 * - Platform revenue = artist subscriptions (Clerk Billing)
 * - Payouts are automatic (Stripe managed schedule)
 */

import { v } from "convex/values";
import Stripe from "stripe";
import { internal } from "./_generated/api";
import { action, internalMutation, internalQuery } from "./_generated/server";

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
 * Internal query: Get artist by owner user ID
 * Used by actions to fetch artist data
 */
export const getArtistByOwner = internalQuery({
  args: { ownerUserId: v.id("users") },
  handler: async (ctx, args) => {
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", args.ownerUserId))
      .unique();
    
    return artist;
  },
});

/**
 * Internal query: Get user by Clerk ID
 * Used by actions to fetch user data
 */
export const getUserByClerkId = internalQuery({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();
    
    return user;
  },
});

/**
 * Internal mutation: Update artist's Stripe Connect account ID
 * Requirements: R-ART-CONNECT-1 - Store stripeConnectAccountId in artists table
 * 
 * Called by createAccount after creating a Stripe Connect account.
 * 
 * @param artistId - Convex artist ID
 * @param stripeConnectAccountId - Stripe Connect account ID
 */
export const updateArtistStripeConnectAccountId = internalMutation({
  args: {
    artistId: v.id("artists"),
    stripeConnectAccountId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.artistId, {
      stripeConnectAccountId: args.stripeConnectAccountId,
      connectStatus: "pending", // Initial status after account creation
      connectUpdatedAt: Date.now(),
    });
  },
});

/**
 * Internal mutation: Update artist's Stripe Connect account status
 * Requirements: R-ART-CONNECT-3 - Update connect status from account.updated webhook
 * 
 * Called by webhook handler when account.updated event is received.
 * Updates the artist's Connect status, capabilities, and requirements.
 * 
 * Flow:
 * 1. Find artist by stripeConnectAccountId
 * 2. Determine connectStatus based on charges_enabled and payouts_enabled
 * 3. Update artist record with new status and requirements
 * 
 * Status logic:
 * - "connected": charges_enabled AND payouts_enabled
 * - "pending": account exists but not fully enabled
 * - "not_connected": should not happen (account exists)
 * 
 * @param stripeConnectAccountId - Stripe Connect account ID
 * @param chargesEnabled - Whether charges are enabled
 * @param payoutsEnabled - Whether payouts are enabled
 * @param requirementsDue - Array of requirements that need to be completed
 */
export const updateAccountStatus = internalMutation({
  args: {
    stripeConnectAccountId: v.string(),
    chargesEnabled: v.boolean(),
    payoutsEnabled: v.boolean(),
    requirementsDue: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Find artist by stripeConnectAccountId
    const artist = await ctx.db
      .query("artists")
      .filter((q) => q.eq(q.field("stripeConnectAccountId"), args.stripeConnectAccountId))
      .unique();

    if (!artist) {
      console.error("Artist not found for Stripe Connect account:", args.stripeConnectAccountId);
      throw new Error(`Artist not found for Connect account: ${args.stripeConnectAccountId}`);
    }

    // Determine connectStatus based on capabilities
    // Requirements: R-ART-CONNECT-2 - connectStatus enum
    let connectStatus: "not_connected" | "pending" | "connected";
    if (args.chargesEnabled && args.payoutsEnabled) {
      connectStatus = "connected";
    } else {
      connectStatus = "pending";
    }

    console.log(
      "Updating artist Connect status:",
      artist._id,
      "Status:",
      connectStatus,
      "Charges:",
      args.chargesEnabled,
      "Payouts:",
      args.payoutsEnabled,
      "Requirements:",
      args.requirementsDue
    );

    // Update artist record
    await ctx.db.patch(artist._id, {
      connectStatus,
      chargesEnabled: args.chargesEnabled,
      payoutsEnabled: args.payoutsEnabled,
      requirementsDue: args.requirementsDue,
      connectUpdatedAt: Date.now(),
    });

    console.log("Artist Connect status updated successfully");
  },
});

/**
 * Internal mutation: Upsert artist balance snapshot
 * Requirements: R-ART-BAL-2 - Balance data from deterministic read-model
 * 
 * Called by webhook handler when balance.available event is received (optional Palier B).
 * Creates or updates the latest balance snapshot for an artist.
 * 
 * Flow:
 * 1. Find artist by stripeConnectAccountId
 * 2. Create new balance snapshot record
 * 
 * Note: This is optional for MVP (Palier B). Can be implemented later for real-time balance tracking.
 * For MVP (Palier A), balance can be calculated from orders/orderItems.
 * 
 * @param stripeConnectAccountId - Stripe Connect account ID
 * @param availableUSD - Available balance in USD cents
 * @param pendingUSD - Pending balance in USD cents
 * @param currency - Currency code (e.g., "usd")
 */
export const upsertBalanceSnapshot = internalMutation({
  args: {
    stripeConnectAccountId: v.string(),
    availableUSD: v.number(),
    pendingUSD: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    // Find artist by stripeConnectAccountId
    const artist = await ctx.db
      .query("artists")
      .filter((q) => q.eq(q.field("stripeConnectAccountId"), args.stripeConnectAccountId))
      .unique();

    if (!artist) {
      console.error("Artist not found for Stripe Connect account:", args.stripeConnectAccountId);
      throw new Error(`Artist not found for Connect account: ${args.stripeConnectAccountId}`);
    }

    console.log(
      "Creating balance snapshot for artist:",
      artist._id,
      "Available:",
      args.availableUSD,
      "Pending:",
      args.pendingUSD,
      "Currency:",
      args.currency
    );

    // Create new balance snapshot
    // Note: We create a new record for each snapshot to maintain history
    await ctx.db.insert("artistBalanceSnapshots", {
      artistId: artist._id,
      stripeConnectAccountId: args.stripeConnectAccountId,
      availableUSD: args.availableUSD,
      pendingUSD: args.pendingUSD,
      currency: args.currency,
      snapshotAt: Date.now(),
    });

    console.log("Balance snapshot created successfully");
  },
});

/**
 * Internal mutation: Upsert artist payout history
 * Requirements: R-ART-BAL-3 - Payout history tracking
 * 
 * Called by webhook handler when payout.* events are received (optional Palier B).
 * Creates or updates payout records for tracking payout history.
 * 
 * Flow:
 * 1. Find artist by stripeConnectAccountId
 * 2. Check if payout record already exists (by stripePayoutId)
 * 3. Create new record or update existing record
 * 
 * Note: This is optional for MVP (Palier B). Can be implemented later for payout history tracking.
 * 
 * Supported events:
 * - payout.paid: Payout successfully sent to bank
 * - payout.failed: Payout failed
 * - payout.canceled: Payout was canceled
 * - payout.created: Payout initiated (status: pending)
 * - payout.updated: Payout status changed
 * 
 * @param stripeConnectAccountId - Stripe Connect account ID
 * @param stripePayoutId - Stripe payout ID
 * @param amount - Payout amount in cents
 * @param currency - Currency code (e.g., "usd")
 * @param status - Payout status
 * @param arrivalDate - Expected arrival date (timestamp)
 */
export const upsertPayoutHistory = internalMutation({
  args: {
    stripeConnectAccountId: v.string(),
    stripePayoutId: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("paid"),
      v.literal("pending"),
      v.literal("in_transit"),
      v.literal("canceled"),
      v.literal("failed")
    ),
    arrivalDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Find artist by stripeConnectAccountId
    const artist = await ctx.db
      .query("artists")
      .filter((q) => q.eq(q.field("stripeConnectAccountId"), args.stripeConnectAccountId))
      .unique();

    if (!artist) {
      console.error("Artist not found for Stripe Connect account:", args.stripeConnectAccountId);
      throw new Error(`Artist not found for Connect account: ${args.stripeConnectAccountId}`);
    }

    console.log(
      "Upserting payout history for artist:",
      artist._id,
      "Payout ID:",
      args.stripePayoutId,
      "Amount:",
      args.amount,
      "Status:",
      args.status
    );

    // Check if payout record already exists
    const existingPayout = await ctx.db
      .query("artistPayouts")
      .withIndex("by_stripe_payout", (q) => q.eq("stripePayoutId", args.stripePayoutId))
      .unique();

    if (existingPayout) {
      // Update existing payout record
      console.log("Updating existing payout record:", existingPayout._id);
      await ctx.db.patch(existingPayout._id, {
        amount: args.amount,
        currency: args.currency,
        status: args.status,
        arrivalDate: args.arrivalDate,
      });
    } else {
      // Create new payout record
      console.log("Creating new payout record");
      await ctx.db.insert("artistPayouts", {
        artistId: artist._id,
        stripePayoutId: args.stripePayoutId,
        amount: args.amount,
        currency: args.currency,
        status: args.status,
        arrivalDate: args.arrivalDate,
        createdAt: Date.now(),
      });
    }

    console.log("Payout history upserted successfully");
  },
});

/**
 * Create Stripe Connect Express account for artist
 * Requirements: R-ART-CONNECT-1 - Create Stripe Connect Express account
 * 
 * Creates a Stripe Connect Express account for the authenticated artist.
 * Express accounts are recommended for platforms because:
 * - Stripe handles onboarding UI
 * - Stripe handles compliance and verification
 * - Artists can manage payouts via Express dashboard
 * 
 * Flow:
 * 1. Get authenticated user and their artist profile
 * 2. Check if artist already has a Connect account (idempotent)
 * 3. Create Stripe Connect Express account with metadata
 * 4. Store stripeConnectAccountId in artists table
 * 5. Return account ID for next step (createAccountLink)
 * 
 * Metadata includes:
 * - convexArtistId: For traceability
 * - clerkUserId: For cross-reference with Clerk
 * 
 * @returns Object with stripeConnectAccountId
 */
export const createAccount = action({
  args: {},
  handler: async (ctx): Promise<{ stripeConnectAccountId: string }> => {
    // Get authenticated user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from Convex
    const user = await ctx.runQuery(internal.stripeConnect.getUserByClerkId, {
      clerkUserId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify user is an artist
    if (user.role !== "artist") {
      throw new Error("Only artists can create Connect accounts");
    }

    // Get artist profile
    const artist = await ctx.runQuery(internal.stripeConnect.getArtistByOwner, {
      ownerUserId: user._id,
    });

    if (!artist) {
      throw new Error("Artist profile not found");
    }

    console.log("Artist found:", artist._id, "Existing Connect account:", artist.stripeConnectAccountId);

    // If artist already has a Connect account, return it (idempotent)
    if (artist.stripeConnectAccountId) {
      console.log("Returning existing Stripe Connect account:", artist.stripeConnectAccountId);
      return { stripeConnectAccountId: artist.stripeConnectAccountId };
    }

    // Create Stripe Connect Express account
    // Requirements: R-ART-CONNECT-1 - Use Express account type
    console.log("Creating new Stripe Connect Express account for artist:", artist._id);
    const stripe = getStripeClient();
    const account = await stripe.accounts.create({
      type: "express",
      email: identity.email,
      metadata: {
        convexArtistId: artist._id,
        clerkUserId: identity.subject,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    console.log("Stripe Connect account created:", account.id);

    // Store stripeConnectAccountId in Convex
    // Requirements: R-ART-CONNECT-1 - Store account ID in artists table
    await ctx.runMutation(internal.stripeConnect.updateArtistStripeConnectAccountId, {
      artistId: artist._id,
      stripeConnectAccountId: account.id,
    });

    console.log("Stripe Connect account ID saved to Convex");

    return { stripeConnectAccountId: account.id };
  },
});

/**
 * Create Stripe Connect account link for onboarding/refresh
 * Requirements: R-ART-CONNECT-1 - Generate onboarding/refresh URL
 * 
 * Creates an account link that redirects the artist to Stripe's onboarding flow.
 * The link expires after a short time, so it should be generated on-demand.
 * 
 * Use cases:
 * - Initial onboarding: Artist completes KYC, bank details, etc.
 * - Refresh: Artist needs to update information or complete missing requirements
 * 
 * Flow:
 * 1. Get authenticated user and their artist profile
 * 2. Verify artist has a Connect account
 * 3. Create account link with return/refresh URLs
 * 4. Return URL for redirect
 * 
 * @param returnUrl - URL to redirect after successful onboarding
 * @param refreshUrl - URL to redirect if link expires
 * @returns Object with account link URL
 */
export const createAccountLink = action({
  args: {
    returnUrl: v.string(),
    refreshUrl: v.string(),
  },
  handler: async (ctx, args): Promise<{ url: string }> => {
    // Get authenticated user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from Convex
    const user = await ctx.runQuery(internal.stripeConnect.getUserByClerkId, {
      clerkUserId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify user is an artist
    if (user.role !== "artist") {
      throw new Error("Only artists can access Connect onboarding");
    }

    // Get artist profile
    const artist = await ctx.runQuery(internal.stripeConnect.getArtistByOwner, {
      ownerUserId: user._id,
    });

    if (!artist) {
      throw new Error("Artist profile not found");
    }

    if (!artist.stripeConnectAccountId) {
      throw new Error("Artist does not have a Stripe Connect account. Call createAccount first.");
    }

    console.log("Creating account link for Connect account:", artist.stripeConnectAccountId);

    // Create account link for onboarding/refresh
    // Requirements: R-ART-CONNECT-1 - Generate onboarding URL
    const stripe = getStripeClient();
    const accountLink = await stripe.accountLinks.create({
      account: artist.stripeConnectAccountId,
      refresh_url: args.refreshUrl,
      return_url: args.returnUrl,
      type: "account_onboarding",
    });

    console.log("Account link created:", accountLink.url);

    return { url: accountLink.url };
  },
});

/**
 * Create Stripe Connect login link for Express dashboard
 * Requirements: R-ART-CONNECT-1 - Generate Express dashboard URL for "Manage Payouts"
 * Requirements: R-ART-PAYOUT-3 - Provide "Manage Payouts on Stripe" link
 * 
 * Creates a login link that redirects the artist to their Stripe Express dashboard.
 * Artists can use this to:
 * - View balance and payout history
 * - Manage payout schedule
 * - Update bank account details
 * - View transaction history
 * 
 * The link is single-use and expires after a short time.
 * 
 * Flow:
 * 1. Get authenticated user and their artist profile
 * 2. Verify artist has a Connect account
 * 3. Verify account is connected (not pending)
 * 4. Create login link
 * 5. Return URL for redirect (open in new tab)
 * 
 * @returns Object with login link URL
 */
export const createLoginLink = action({
  args: {},
  handler: async (ctx): Promise<{ url: string }> => {
    // Get authenticated user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from Convex
    const user = await ctx.runQuery(internal.stripeConnect.getUserByClerkId, {
      clerkUserId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify user is an artist
    if (user.role !== "artist") {
      throw new Error("Only artists can access Connect dashboard");
    }

    // Get artist profile
    const artist = await ctx.runQuery(internal.stripeConnect.getArtistByOwner, {
      ownerUserId: user._id,
    });

    if (!artist) {
      throw new Error("Artist profile not found");
    }

    if (!artist.stripeConnectAccountId) {
      throw new Error("Artist does not have a Stripe Connect account");
    }

    // Verify account is connected (not pending)
    // Requirements: R-ART-PAYOUT-3 - Only allow dashboard access for connected accounts
    if (artist.connectStatus !== "connected") {
      throw new Error(
        "Stripe Connect account is not fully connected. Complete onboarding first."
      );
    }

    console.log("Creating login link for Connect account:", artist.stripeConnectAccountId);

    // Create login link for Express dashboard
    // Requirements: R-ART-CONNECT-1, R-ART-PAYOUT-3 - Generate Express dashboard URL
    const stripe = getStripeClient();
    const loginLink = await stripe.accounts.createLoginLink(
      artist.stripeConnectAccountId
    );

    console.log("Login link created:", loginLink.url);

    return { url: loginLink.url };
  },
});
