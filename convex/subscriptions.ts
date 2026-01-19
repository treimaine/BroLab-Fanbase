/**
 * Subscription Helpers
 * Requirements: R-CLERK-SUB-1.1, R-CLERK-SUB-1.2
 * 
 * Handles subscription status checks for premium features.
 * Clerk Billing is the source of truth for subscription status.
 * 
 * Premium features are gated server-side (backend) to prevent bypass.
 * 
 * ## How It Works
 * 
 * 1. Subscription data is stored in Clerk's publicMetadata.subscription
 * 2. The subscription object contains: { plan, status, currentPeriodEnd }
 * 3. Plans: "free", "pro", "premium"
 * 4. Status: "active", "canceled", "past_due", "trialing", "none"
 * 
 * ## Feature Limits by Plan
 * 
 * ### Free Plan
 * - Max 3 products
 * - Max 5 events
 * - Max 5 custom links
 * - No video uploads (audio only)
 * - Max file size: 10MB
 * 
 * ### Pro Plan
 * - Max 20 products
 * - Max 20 events
 * - Max 15 custom links
 * - Video uploads enabled
 * - Max file size: 50MB
 * 
 * ### Premium Plan
 * - Unlimited products
 * - Unlimited events
 * - Unlimited custom links
 * - Video uploads enabled
 * - Max file size: 200MB
 * 
 * ## Usage in Mutations
 * 
 * ```typescript
 * import { canCreateProduct, enforceLimit } from "./subscriptions";
 * 
 * export const create = mutation({
 *   handler: async (ctx, args) => {
 *     // ... auth checks ...
 *     
 *     // Check subscription limits
 *     const existingProducts = await ctx.db.query("products")...
 *     const canCreate = await canCreateProduct(ctx, existingProducts.length);
 *     enforceLimit(canCreate, "products");
 *     
 *     // ... create product ...
 *   }
 * });
 * ```
 * 
 * ## Frontend Integration
 * 
 * Use the `getCurrentSubscription` and `getCurrentUsage` queries to display
 * current plan, limits, and usage counts in the UI.
 */

import { MutationCtx, QueryCtx, query } from "./_generated/server";

/**
 * Subscription plans
 */
export type SubscriptionPlan = "free" | "pro" | "premium";

/**
 * Subscription status from Clerk
 * This is stored in Clerk's publicMetadata.subscription
 */
export interface SubscriptionStatus {
  plan: SubscriptionPlan;
  status: "active" | "canceled" | "past_due" | "trialing" | "none";
  currentPeriodEnd?: number; // timestamp
}

/**
 * Feature limits by plan
 * Requirements: R-CLERK-SUB-1.2 - Premium features gated server-side
 */
export const PLAN_LIMITS = {
  free: {
    maxProducts: 3,
    maxEvents: 5,
    maxLinks: 5,
    canUploadVideo: false,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },
  pro: {
    maxProducts: 20,
    maxEvents: 20,
    maxLinks: 15,
    canUploadVideo: true,
    maxFileSize: 50 * 1024 * 1024, // 50MB
  },
  premium: {
    maxProducts: Infinity,
    maxEvents: Infinity,
    maxLinks: Infinity,
    canUploadVideo: true,
    maxFileSize: 200 * 1024 * 1024, // 200MB
  },
} as const;

/**
 * Get subscription status from Clerk user identity
 * Requirements: R-CLERK-SUB-1.1 - Clerk Billing as source of truth
 * 
 * Reads subscription data from Clerk's publicMetadata.
 * Falls back to "free" plan if no subscription data found.
 * 
 * @param ctx - Query or Mutation context
 * @returns Subscription status or null if not authenticated
 */
export async function getSubscriptionStatus(
  ctx: QueryCtx | MutationCtx
): Promise<SubscriptionStatus | null> {
  const identity = await ctx.auth.getUserIdentity();
  
  if (!identity) {
    return null;
  }

  // Get subscription data from Clerk publicMetadata
  // Clerk Billing stores subscription info in publicMetadata.subscription
  const metadata = identity.publicMetadata as Record<string, unknown>;
  const subscription = metadata?.subscription as Record<string, unknown> | undefined;

  if (!subscription) {
    // No subscription data = free plan
    return {
      plan: "free",
      status: "none",
    };
  }

  // Parse subscription data
  const plan = (subscription.plan as SubscriptionPlan) || "free";
  const status = (subscription.status as SubscriptionStatus["status"]) || "none";
  const currentPeriodEnd = subscription.currentPeriodEnd as number | undefined;

  return {
    plan,
    status,
    currentPeriodEnd,
  };
}

/**
 * Check if user has an active subscription
 * Requirements: R-CLERK-SUB-1.2 - Server-side gating
 * 
 * @param ctx - Query or Mutation context
 * @returns true if user has active subscription (pro or premium)
 */
export async function hasActiveSubscription(
  ctx: QueryCtx | MutationCtx
): Promise<boolean> {
  const subscription = await getSubscriptionStatus(ctx);
  
  if (!subscription) {
    return false;
  }

  // Active subscription = pro or premium plan with active/trialing status
  const isActivePlan = subscription.plan === "pro" || subscription.plan === "premium";
  const isActiveStatus = subscription.status === "active" || subscription.status === "trialing";

  return isActivePlan && isActiveStatus;
}

/**
 * Get user's current plan
 * Requirements: R-CLERK-SUB-1.1 - Clerk Billing as source of truth
 * 
 * @param ctx - Query or Mutation context
 * @returns Current subscription plan (defaults to "free")
 */
export async function getCurrentPlan(
  ctx: QueryCtx | MutationCtx
): Promise<SubscriptionPlan> {
  const subscription = await getSubscriptionStatus(ctx);
  
  if (!subscription) {
    return "free";
  }

  // Only return paid plan if subscription is active
  const isActiveStatus = subscription.status === "active" || subscription.status === "trialing";
  
  if (!isActiveStatus) {
    return "free";
  }

  return subscription.plan;
}

/**
 * Get feature limits for user's current plan
 * Requirements: R-CLERK-SUB-1.2 - Server-side gating
 * 
 * @param ctx - Query or Mutation context
 * @returns Feature limits object for current plan
 */
export async function getFeatureLimits(ctx: QueryCtx | MutationCtx) {
  const plan = await getCurrentPlan(ctx);
  return PLAN_LIMITS[plan];
}

/**
 * Check if user can create more products
 * Requirements: R-CLERK-SUB-1.2 - Server-side gating
 * 
 * @param ctx - Mutation context
 * @param currentCount - Current number of products
 * @returns true if user can create more products
 */
export async function canCreateProduct(
  ctx: MutationCtx,
  currentCount: number
): Promise<boolean> {
  const limits = await getFeatureLimits(ctx);
  return currentCount < limits.maxProducts;
}

/**
 * Check if user can create more events
 * Requirements: R-CLERK-SUB-1.2 - Server-side gating
 * 
 * @param ctx - Mutation context
 * @param currentCount - Current number of events
 * @returns true if user can create more events
 */
export async function canCreateEvent(
  ctx: MutationCtx,
  currentCount: number
): Promise<boolean> {
  const limits = await getFeatureLimits(ctx);
  return currentCount < limits.maxEvents;
}

/**
 * Check if user can create more links
 * Requirements: R-CLERK-SUB-1.2 - Server-side gating
 * 
 * @param ctx - Mutation context
 * @param currentCount - Current number of links
 * @returns true if user can create more links
 */
export async function canCreateLink(
  ctx: MutationCtx,
  currentCount: number
): Promise<boolean> {
  const limits = await getFeatureLimits(ctx);
  return currentCount < limits.maxLinks;
}

/**
 * Check if user can upload video
 * Requirements: R-CLERK-SUB-1.2 - Server-side gating
 * 
 * @param ctx - Mutation context
 * @returns true if user can upload video
 */
export async function canUploadVideo(ctx: MutationCtx): Promise<boolean> {
  const limits = await getFeatureLimits(ctx);
  return limits.canUploadVideo;
}

/**
 * Get max file size for user's plan
 * Requirements: R-CLERK-SUB-1.2 - Server-side gating
 * 
 * @param ctx - Mutation context
 * @returns Max file size in bytes
 */
export async function getMaxFileSize(ctx: MutationCtx): Promise<number> {
  const limits = await getFeatureLimits(ctx);
  return limits.maxFileSize;
}

/**
 * Throw error if feature limit exceeded
 * Requirements: R-CLERK-SUB-1.2 - Server-side gating
 * 
 * @param canProceed - Result from can* check function
 * @param featureName - Name of the feature for error message
 * @param upgradeMessage - Optional custom upgrade message
 * @throws Error if limit exceeded
 */
export function enforceLimit(
  canProceed: boolean,
  featureName: string,
  upgradeMessage?: string
): void {
  if (!canProceed) {
    const defaultMessage = `You've reached the limit for ${featureName} on your current plan. Upgrade to create more.`;
    throw new Error(upgradeMessage || defaultMessage);
  }
}

/**
 * Query: Get current user's subscription status
 * Requirements: R-CLERK-SUB-1.1 - Clerk Billing as source of truth
 * 
 * Returns subscription status and feature limits for the authenticated user.
 * Used by frontend to display current plan and upgrade prompts.
 * 
 * @returns Subscription info with plan, status, and limits
 */

export const getCurrentSubscription = query({
  args: {},
  handler: async (ctx) => {
    const subscription = await getSubscriptionStatus(ctx);
    
    if (!subscription) {
      return null;
    }

    const plan = await getCurrentPlan(ctx);
    const limits = PLAN_LIMITS[plan];

    return {
      plan,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      limits: {
        maxProducts: limits.maxProducts === Infinity ? "unlimited" : limits.maxProducts,
        maxEvents: limits.maxEvents === Infinity ? "unlimited" : limits.maxEvents,
        maxLinks: limits.maxLinks === Infinity ? "unlimited" : limits.maxLinks,
        canUploadVideo: limits.canUploadVideo,
        maxFileSize: limits.maxFileSize,
      },
    };
  },
});

/**
 * Query: Get current usage counts for the authenticated artist
 * Requirements: R-CLERK-SUB-1.2 - Server-side gating
 * 
 * Returns current usage counts to display alongside limits.
 * 
 * @returns Usage counts for products, events, and links
 */
export const getCurrentUsage = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return null;
    }

    // Get the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (user?.role !== "artist") {
      return null;
    }

    // Get the artist profile
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", user._id))
      .unique();

    if (!artist) {
      return null;
    }

    // Count current usage
    const products = await ctx.db
      .query("products")
      .withIndex("by_artist", (q) => q.eq("artistId", artist._id))
      .collect();

    const events = await ctx.db
      .query("events")
      .withIndex("by_artist", (q) => q.eq("artistId", artist._id))
      .collect();

    const links = await ctx.db
      .query("links")
      .withIndex("by_artist", (q) => q.eq("artistId", artist._id))
      .collect();

    return {
      productsCount: products.length,
      eventsCount: events.length,
      linksCount: links.length,
    };
  },
});
