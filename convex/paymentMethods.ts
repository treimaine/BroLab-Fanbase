/**
 * Payment Methods Functions
 * Requirements: R-FAN-PM-3.1, R-FAN-PM-3.2 - Deterministic read model for billing page
 * Requirements: R-FAN-PM-4.3 - Internal mutations for webhook sync
 * 
 * Handles payment methods queries for fans:
 * - listForCurrentUser: Retrieve all payment methods for the authenticated user
 * 
 * Internal mutations for webhook sync:
 * - upsertFromStripe: Upsert payment method from Stripe webhook data
 * - removeByStripePaymentMethodId: Remove payment method by Stripe ID
 * - setDefaultByCustomer: Update default payment method for a customer
 * 
 * IMPORTANT: This is a deterministic read model.
 * Payment methods are synced from Stripe via webhooks (push model).
 * Never call Stripe API directly in queries - always read from Convex table.
 */

import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

/**
 * List all payment methods for the current authenticated user
 * Requirements: R-FAN-PM-3.1, R-FAN-PM-3.2 - Deterministic query for billing page
 * 
 * Returns payment methods sorted by:
 * 1. Default payment method first (isDefault: true)
 * 2. Then by createdAt descending (newest first)
 * 
 * This query reads from the local Convex table (deterministic).
 * Payment methods are synced via Stripe webhooks:
 * - setup_intent.succeeded → upsert payment method
 * - payment_method.attached → upsert payment method
 * - payment_method.detached → delete payment method
 * - customer.updated → sync default payment method
 * 
 * @returns Array of payment methods with brand, last4, expiry, default status
 */
export const listForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user identity
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get Convex user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Query all payment methods for this user
    const paymentMethods = await ctx.db
      .query("paymentMethods")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    // Sort: default first, then by createdAt desc (newest first)
    // Create a copy to avoid mutating the original array
    const sorted = [...paymentMethods].sort((a, b) => {
      // Default payment method always comes first
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      
      // If both default or both not default, sort by createdAt desc
      return b.createdAt - a.createdAt;
    });

    return sorted;
  },
});

/**
 * Internal Mutations for Webhook Sync
 * Requirements: R-FAN-PM-4.3 - Webhook-driven sync of payment methods
 * 
 * These mutations are called by Stripe webhook handlers to sync payment method data.
 * They are internal-only and cannot be called directly from the client.
 */

/**
 * Upsert payment method from Stripe webhook data
 * Requirements: R-FAN-PM-4.3 - Sync payment methods from webhooks
 * 
 * Called by webhook handlers for:
 * - setup_intent.succeeded
 * - payment_method.attached
 * 
 * If payment method exists (by stripePaymentMethodId), updates it.
 * If not, creates a new record.
 * 
 * @param userId - Convex user ID
 * @param stripeCustomerId - Stripe customer ID
 * @param stripePaymentMethodId - Stripe payment method ID (unique)
 * @param brand - Card brand (visa, mastercard, etc.)
 * @param last4 - Last 4 digits of card
 * @param expMonth - Expiration month
 * @param expYear - Expiration year
 * @param isDefault - Whether this is the default payment method
 * @param billingName - Billing name (optional)
 * @param billingEmail - Billing email (optional)
 */
export const upsertFromStripe = internalMutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    stripePaymentMethodId: v.string(),
    brand: v.string(),
    last4: v.string(),
    expMonth: v.number(),
    expYear: v.number(),
    isDefault: v.boolean(),
    billingName: v.optional(v.string()),
    billingEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if payment method already exists
    const existing = await ctx.db
      .query("paymentMethods")
      .withIndex("by_stripePaymentMethodId", (q) => 
        q.eq("stripePaymentMethodId", args.stripePaymentMethodId)
      )
      .unique();

    if (existing) {
      // Update existing payment method
      await ctx.db.patch(existing._id, {
        brand: args.brand,
        last4: args.last4,
        expMonth: args.expMonth,
        expYear: args.expYear,
        isDefault: args.isDefault,
        billingName: args.billingName,
        billingEmail: args.billingEmail,
        updatedAt: now,
      });

      return existing._id;
    } else {
      // Insert new payment method
      const id = await ctx.db.insert("paymentMethods", {
        userId: args.userId,
        stripeCustomerId: args.stripeCustomerId,
        stripePaymentMethodId: args.stripePaymentMethodId,
        brand: args.brand,
        last4: args.last4,
        expMonth: args.expMonth,
        expYear: args.expYear,
        isDefault: args.isDefault,
        billingName: args.billingName,
        billingEmail: args.billingEmail,
        createdAt: now,
        updatedAt: now,
      });

      return id;
    }
  },
});

/**
 * Remove payment method by Stripe payment method ID
 * Requirements: R-FAN-PM-4.3 - Sync payment method removal from webhooks
 * 
 * Called by webhook handler for:
 * - payment_method.detached
 * 
 * Deletes the payment method if it exists in Convex.
 * 
 * @param stripePaymentMethodId - Stripe payment method ID to remove
 */
export const removeByStripePaymentMethodId = internalMutation({
  args: {
    stripePaymentMethodId: v.string(),
  },
  handler: async (ctx, args) => {
    // Query payment method by Stripe ID
    const paymentMethod = await ctx.db
      .query("paymentMethods")
      .withIndex("by_stripePaymentMethodId", (q) => 
        q.eq("stripePaymentMethodId", args.stripePaymentMethodId)
      )
      .unique();

    // Delete if exists
    if (paymentMethod) {
      await ctx.db.delete(paymentMethod._id);
      return { deleted: true, id: paymentMethod._id };
    }

    return { deleted: false };
  },
});

/**
 * Update default payment method for a customer
 * Requirements: R-FAN-PM-4.3 - Sync default payment method from webhooks
 * 
 * Called by webhook handler for:
 * - customer.updated (when invoice_settings.default_payment_method changes)
 * 
 * Sets isDefault=true for the specified payment method,
 * and isDefault=false for all other payment methods of the same customer.
 * 
 * @param stripeCustomerId - Stripe customer ID
 * @param stripePaymentMethodId - Stripe payment method ID to set as default
 */
export const setDefaultByCustomer = internalMutation({
  args: {
    stripeCustomerId: v.string(),
    stripePaymentMethodId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Query all payment methods for this customer
    const paymentMethods = await ctx.db
      .query("paymentMethods")
      .withIndex("by_stripeCustomerId", (q) => 
        q.eq("stripeCustomerId", args.stripeCustomerId)
      )
      .collect();

    // Update isDefault for all payment methods
    const updates = paymentMethods.map(async (pm) => {
      const isDefault = pm.stripePaymentMethodId === args.stripePaymentMethodId;
      
      // Only update if isDefault status changed
      if (pm.isDefault !== isDefault) {
        await ctx.db.patch(pm._id, {
          isDefault,
          updatedAt: now,
        });
      }
    });

    await Promise.all(updates);

    return {
      updated: paymentMethods.length,
      defaultPaymentMethodId: args.stripePaymentMethodId,
    };
  },
});
