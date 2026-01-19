/**
 * Orders Convex Functions
 * Requirements: 10.1-10.5, 18.2-18.5
 * 
 * Handles order and purchase management:
 * - Get fan's purchase history
 * - Create orders from Stripe webhooks
 * - Get order details with items
 * 
 * ## Idempotency & Entitlement System
 * 
 * ### Idempotency (Requirement 18.5)
 * The webhook processing is idempotent to handle:
 * - Stripe webhook retries (automatic on failure)
 * - Network issues causing duplicate deliveries
 * - Manual webhook replay from Stripe dashboard
 * 
 * Implementation:
 * 1. Check `processedEvents` table for Stripe event ID
 * 2. If found, return existing order (no duplicate creation)
 * 3. If not found, create order + orderItems + mark event as processed
 * 4. All three operations happen in a single mutation (atomic)
 * 
 * ### Entitlement System (Requirements 17.3, 17.4)
 * When an order is created, download entitlements are automatically granted:
 * 
 * 1. **Order Status**: Set to "paid" (required for download access)
 * 2. **OrderItem Creation**: Links fanUserId → productId
 * 3. **FileStorageId Snapshot**: Permanent access even if product changes
 * 4. **Ownership Verification**: downloads_helpers.checkOwnership validates:
 *    - Fan is authenticated
 *    - OrderItem exists for fan + product
 *    - Order status is "paid"
 * 
 * Flow:
 * ```
 * Stripe Webhook → handleWebhook (action) → createFromStripe (mutation)
 *                                          ↓
 *                  [Idempotency Check] → processedEvents table
 *                                          ↓
 *                  [Create Order] → orders table (status: "paid")
 *                                          ↓
 *                  [Create OrderItem] → orderItems table (fileStorageId snapshot)
 *                                          ↓
 *                  [Mark Processed] → processedEvents table
 *                                          ↓
 *                  [Download Access] → downloads.getDownloadUrl validates ownership
 * ```
 * 
 * ### Error Handling
 * - Missing product: Throws error (webhook will retry)
 * - Missing fileStorageId: Throws error (product must have file)
 * - Duplicate event: Returns existing order (safe idempotent behavior)
 * - Data inconsistency: Throws error with clear message
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
 * Requirements: 18.2, 18.3, 18.5 - Create order on payment success with idempotency
 * Requirements: 17.3, 17.4 - Write entitlement/download permissions
 * 
 * Called by Stripe webhook handler (checkout.session.completed)
 * 
 * Idempotency:
 * - Checks processedEvents table before creating order
 * - Returns existing order if event already processed
 * - Marks event as processed atomically with order creation
 * 
 * Entitlements:
 * - Creates orderItem linking fanUserId → productId
 * - Sets order status to "paid" (required for download access)
 * - Snapshots fileStorageId for permanent access
 * - Download permissions verified via downloads_helpers.checkOwnership
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
    // Step 1: Idempotency check - has this event been processed?
    // Requirements: 18.5 - Webhook idempotency
    const existingEvent = await ctx.db
      .query("processedEvents")
      .withIndex("by_event", (q) =>
        q.eq("provider", "stripe").eq("eventId", args.eventId)
      )
      .unique();

    if (existingEvent) {
      console.log(`Event ${args.eventId} already processed, returning existing order`);
      
      // Event already processed, return existing order
      const existingOrder = await ctx.db
        .query("orders")
        .withIndex("by_stripe_session", (q) =>
          q.eq("stripeSessionId", args.stripeSessionId)
        )
        .unique();

      if (existingOrder) {
        console.log(`Returning existing order ${existingOrder._id} for session ${args.stripeSessionId}`);
        return existingOrder._id;
      }

      // Edge case: event processed but order not found
      // This should never happen, but handle gracefully
      console.warn(`Event ${args.eventId} marked as processed but order not found for session ${args.stripeSessionId}`);
      throw new Error("Order not found for processed event - data inconsistency");
    }

    // Step 2: Validate product exists and has required data
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error(`Product ${args.productId} not found`);
    }

    if (!product.fileStorageId) {
      throw new Error(`Product ${args.productId} has no file attached - cannot create order`);
    }

    console.log(`Creating order for product ${product.title} (${product._id})`);

    // Step 3: Create order with status "paid"
    // Requirements: 18.2 - Create order record
    const orderId = await ctx.db.insert("orders", {
      fanUserId: args.fanUserId,
      totalUSD: args.totalUSD,
      currency: args.currency,
      status: "paid", // Required for download entitlement
      stripeSessionId: args.stripeSessionId,
      createdAt: Date.now(),
    });

    console.log(`Order ${orderId} created for fan ${args.fanUserId}`);

    // Step 4: Create order item (establishes entitlement)
    // Requirements: 18.3 - Create orderItems record
    // Requirements: 17.3, 17.4 - Write entitlement/download permissions
    // This orderItem grants the fan permanent download access to the product
    await ctx.db.insert("orderItems", {
      orderId,
      productId: args.productId,
      type: product.type,
      priceUSD: args.totalUSD,
      fileStorageId: product.fileStorageId, // Snapshot for permanent access
      createdAt: Date.now(),
    });

    console.log(`OrderItem created for product ${args.productId} in order ${orderId}`);

    // Step 5: Mark event as processed (completes idempotency)
    // Requirements: 18.5 - Mark event as processed
    await ctx.db.insert("processedEvents", {
      provider: "stripe",
      eventId: args.eventId,
      processedAt: Date.now(),
    });

    console.log(`Event ${args.eventId} marked as processed`);
    console.log(`✅ Order ${orderId} created successfully - download entitlement granted`);

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
