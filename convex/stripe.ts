/**
 * Stripe Webhook Handler (Convex Action)
 * Requirements: 18.2, 18.3, 18.4, 18.5
 * 
 * Handles Stripe webhook events, specifically checkout.session.completed.
 * Implements idempotency to prevent duplicate order creation.
 * 
 * Flow:
 * 1. Check if event already processed (idempotency)
 * 2. Extract metadata (fanUserId, productId) from Stripe session
 * 3. Create order record with status "paid"
 * 4. Create orderItems record with product snapshot
 * 5. Mark event as processed
 */

import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { action, internalQuery } from "./_generated/server";

/**
 * Internal helper: Get user by Clerk ID
 * Used by actions to fetch user data
 */
export const getUserByClerkId = internalQuery({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();
  },
});

/**
 * Create Stripe Setup Intent for adding payment method
 * Requirements: 11.2 - Add payment method
 * 
 * Creates a Stripe Setup Intent that allows users to save payment methods
 * for future purchases without charging them immediately.
 * 
 * @returns Object with clientSecret for Stripe Elements
 */
export const createSetupIntent = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from Convex
    const user = await ctx.runQuery(internal.stripe.getUserByClerkId, {
      clerkUserId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // In production, you would:
    // 1. Get or create Stripe customer ID for this user
    // 2. Create a Setup Intent with Stripe API
    // 3. Return the client secret
    
    // For MVP, return a placeholder
    // FUTURE: Implement actual Stripe Setup Intent creation when Stripe is fully integrated
    return {
      clientSecret: "seti_placeholder_" + Date.now(),
      message: "Setup Intent creation - to be implemented with Stripe API",
    };
  },
});

/**
 * Remove payment method from Stripe
 * Requirements: 11.3 - Remove payment method
 * 
 * Detaches a payment method from the customer in Stripe.
 * 
 * @param paymentMethodId - Stripe payment method ID
 * @returns Success status
 */
export const removePaymentMethod = action({
  args: {
    paymentMethodId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from Convex
    const user = await ctx.runQuery(internal.stripe.getUserByClerkId, {
      clerkUserId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // In production, you would:
    // 1. Verify the payment method belongs to this user's Stripe customer
    // 2. Detach the payment method using Stripe API
    // 3. Return success status
    
    // For MVP, simulate the operation
    // FUTURE: Implement actual Stripe payment method detachment when Stripe is fully integrated
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: "Payment method removal - to be implemented with Stripe API",
    };
  },
});

/**
 * Handle Stripe webhook event
 * Requirements: 18.2, 18.3, 18.4, 18.5
 * 
 * This action is called by the Next.js webhook route after signature verification.
 * It processes checkout.session.completed events and creates orders.
 * 
 * @param eventId - Stripe event ID (for idempotency)
 * @param eventType - Stripe event type (e.g., "checkout.session.completed")
 * @param sessionId - Stripe checkout session ID
 * @param metadata - Custom metadata from checkout session (fanUserId, productId)
 * @param amountTotal - Total amount in cents
 * @param currency - Currency code (e.g., "usd")
 * 
 * @returns Object with success status and orderId if created
 */
export const handleWebhook = action({
  args: {
    eventId: v.string(),
    eventType: v.string(),
    sessionId: v.string(),
    metadata: v.object({
      fanUserId: v.string(),
      productId: v.string(),
    }),
    amountTotal: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    // Only handle checkout.session.completed events
    if (args.eventType !== "checkout.session.completed") {
      return {
        success: true,
        message: `Event type ${args.eventType} not handled`,
      };
    }

    // Step 1: Check idempotency - has this event been processed?
    const existingEvent = await ctx.runQuery(api.orders.isEventProcessed, {
      eventId: args.eventId,
    });

    if (existingEvent) {
      console.log(`Event ${args.eventId} already processed, skipping`);
      return {
        success: true,
        message: "Event already processed",
        alreadyProcessed: true,
      };
    }

    // Step 2: Extract and validate metadata
    const { fanUserId, productId } = args.metadata;

    if (!fanUserId || !productId) {
      throw new Error(
        "Missing required metadata: fanUserId and productId are required"
      );
    }

    // Convert string IDs to Convex IDs
    const fanUserIdTyped = fanUserId as Id<"users">;
    const productIdTyped = productId as Id<"products">;

    // Convert amount from cents to dollars
    const totalUSD = args.amountTotal / 100;

    // Step 3: Create order + orderItems via existing mutation
    // This mutation handles idempotency, order creation, and event marking
    const orderId: Id<"orders"> = await ctx.runMutation(api.orders.createFromStripe, {
      fanUserId: fanUserIdTyped,
      stripeSessionId: args.sessionId,
      totalUSD,
      currency: args.currency,
      productId: productIdTyped,
      eventId: args.eventId,
    });

    console.log(
      `Order ${orderId} created for event ${args.eventId}, session ${args.sessionId}`
    );

    return {
      success: true,
      message: "Order created successfully",
      orderId: orderId as string,
    };
  },
});
