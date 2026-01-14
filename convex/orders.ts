/**
 * Orders Convex Functions
 * Requirements: 10.1-10.5, 18.2-18.5
 * 
 * Handles order and purchase management:
 * - Get fan's purchase history
 * - Create orders from Stripe webhooks
 * - Get order details with items
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get all purchases for the current fan user
 * Requirements: 10.1 - Display purchase history
 * 
 * Returns orders with their items, including product details
 */
export const getMyPurchases = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get all orders for this fan
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_fan", (q) => q.eq("fanUserId", user._id))
      .order("desc")
      .collect();

    // For each order, get its items with product details
    const purchasesWithDetails = await Promise.all(
      orders.map(async (order) => {
        const items = await ctx.db
          .query("orderItems")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .collect();

        // Get product and artist details for each item
        const itemsWithDetails = await Promise.all(
          items.map(async (item) => {
            const product = await ctx.db.get(item.productId);
            if (!product) return null;

            const artist = await ctx.db.get(product.artistId);
            if (!artist) return null;

            return {
              ...item,
              product: {
                _id: product._id,
                title: product.title,
                type: product.type,
                coverImageUrl: product.coverImageUrl,
              },
              artist: {
                _id: artist._id,
                displayName: artist.displayName,
                artistSlug: artist.artistSlug,
              },
            };
          })
        );

        // Filter out null items
        const validItems = itemsWithDetails.filter((item) => item !== null);

        return {
          order,
          items: validItems,
        };
      })
    );

    return purchasesWithDetails;
  },
});

/**
 * Get order details by ID
 * Requirements: 10.5 - View order details
 */
export const getOrderById = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get order
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Verify ownership
    if (order.fanUserId !== user._id) {
      throw new Error("Not authorized to view this order");
    }

    // Get order items
    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", order._id))
      .collect();

    // Get product and artist details for each item
    const itemsWithDetails = await Promise.all(
      items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (!product) return null;

        const artist = await ctx.db.get(product.artistId);
        if (!artist) return null;

        return {
          ...item,
          product,
          artist,
        };
      })
    );

    return {
      order,
      items: itemsWithDetails.filter((item) => item !== null),
    };
  },
});

/**
 * Create order from Stripe checkout session
 * Requirements: 18.2, 18.3 - Create order on payment success
 * 
 * Called by Stripe webhook handler
 */
export const createFromStripe = mutation({
  args: {
    fanUserId: v.id("users"),
    stripeSessionId: v.string(),
    totalUSD: v.number(),
    currency: v.string(),
    productId: v.id("products"),
    eventId: v.string(), // Stripe event ID for idempotency
  },
  handler: async (ctx, args) => {
    // Check idempotency - has this event been processed?
    const existingEvent = await ctx.db
      .query("processedEvents")
      .withIndex("by_event", (q) =>
        q.eq("provider", "stripe").eq("eventId", args.eventId)
      )
      .unique();

    if (existingEvent) {
      // Event already processed, return existing order
      const existingOrder = await ctx.db
        .query("orders")
        .withIndex("by_stripe_session", (q) =>
          q.eq("stripeSessionId", args.stripeSessionId)
        )
        .unique();

      if (existingOrder) {
        return existingOrder._id;
      }
    }

    // Get product details
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Create order
    const orderId = await ctx.db.insert("orders", {
      fanUserId: args.fanUserId,
      totalUSD: args.totalUSD,
      currency: args.currency,
      status: "paid",
      stripeSessionId: args.stripeSessionId,
      createdAt: Date.now(),
    });

    // Create order item
    await ctx.db.insert("orderItems", {
      orderId,
      productId: args.productId,
      type: product.type,
      priceUSD: args.totalUSD,
      fileStorageId: product.fileStorageId,
      createdAt: Date.now(),
    });

    // Mark event as processed
    await ctx.db.insert("processedEvents", {
      provider: "stripe",
      eventId: args.eventId,
      processedAt: Date.now(),
    });

    return orderId;
  },
});

/**
 * Check if a Stripe event has been processed
 * Requirements: 18.5 - Webhook idempotency
 */
export const isEventProcessed = query({
  args: {
    eventId: v.string(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("processedEvents")
      .withIndex("by_event", (q) =>
        q.eq("provider", "stripe").eq("eventId", args.eventId)
      )
      .unique();

    return event !== null;
  },
});
