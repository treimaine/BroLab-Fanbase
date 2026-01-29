/**
 * Artist Billing Queries (Deterministic Read Model)
 * Requirements: R-ART-BAL-1, R-ART-TXN-1, R-ART-TXN-2, R-ART-TXN-3
 * 
 * Provides deterministic queries for artist billing dashboard:
 * - getSummary: Connect status, balances, last payout, requirements
 * - getTransactions: Real sales from orders/orderItems/products
 * 
 * Business Model:
 * - Fans pay artists directly via Stripe Connect (destination charges)
 * - Platform takes 0% commission (application_fee_amount = 0)
 * - Platform revenue = artist subscriptions (Clerk Billing)
 * - Payouts are automatic (Stripe managed schedule)
 * 
 * Data Sources:
 * - Connect status: artists table (synced via webhooks)
 * - Balances: artistBalanceSnapshots table (optional Palier B) OR calculated from orders
 * - Payouts: artistPayouts table (optional Palier B)
 * - Transactions: orders/orderItems/products (source of truth)
 */

import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Get artist billing summary
 * Requirements: R-ART-BAL-1 - Display real available and pending balances
 * Requirements: R-ART-BAL-3 - Display last payout information
 * Requirements: R-ART-CONNECT-4 - Display requirements due
 * 
 * Returns:
 * - connectStatus: "not_connected" | "pending" | "connected"
 * - chargesEnabled: boolean
 * - payoutsEnabled: boolean
 * - requirementsDue: string[] (e.g., ["bank_account", "identity_verification"])
 * - availableBalance: number (USD cents) - from latest snapshot OR calculated from orders
 * - pendingBalance: number (USD cents) - from latest snapshot OR 0
 * - lastPayout: { amount, date, status } | null
 * 
 * Palier A (MVP): Calculate balance from orders (no balance snapshots)
 * Palier B (Future): Use artistBalanceSnapshots for real-time balance
 */
export const getSummary = query({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from Convex
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify user is an artist
    if (user.role !== "artist") {
      throw new Error("Only artists can access billing summary");
    }

    // Get artist profile
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", user._id))
      .unique();

    if (!artist) {
      throw new Error("Artist profile not found");
    }

    // Get Connect status from artist record
    const connectStatus = artist.connectStatus ?? "not_connected";
    const chargesEnabled = artist.chargesEnabled ?? false;
    const payoutsEnabled = artist.payoutsEnabled ?? false;
    const requirementsDue = artist.requirementsDue ?? [];

    // Get balance data
    // Palier A (MVP): Calculate from orders
    // Palier B (Future): Use artistBalanceSnapshots
    let availableBalance = 0;
    let pendingBalance = 0;

    // Try to get latest balance snapshot (Palier B)
    const latestSnapshot = await ctx.db
      .query("artistBalanceSnapshots")
      .withIndex("by_artist", (q) => q.eq("artistId", artist._id))
      .order("desc")
      .first();

    if (latestSnapshot) {
      // Use snapshot data (Palier B)
      availableBalance = latestSnapshot.availableUSD;
      pendingBalance = latestSnapshot.pendingUSD;
    } else {
      // Calculate from orders (Palier A - MVP fallback)
      // Get all products for this artist
      const products = await ctx.db
        .query("products")
        .withIndex("by_artist", (q) => q.eq("artistId", artist._id))
        .collect();

      const productIds = new Set(products.map((p) => p._id));

      // Get all order items for these products
      const allOrderItems = await ctx.db.query("orderItems").collect();
      const artistOrderItems = allOrderItems.filter((item) =>
        productIds.has(item.productId)
      );

      // Batch fetch all orders in parallel (eliminates N+1 pattern)
      const uniqueOrderIds = [...new Set(artistOrderItems.map((item) => item.orderId))];
      const orders = await Promise.all(
        uniqueOrderIds.map((orderId) => ctx.db.get(orderId))
      );

      // Create order lookup map for O(1) access
      const orderMap = new Map(
        orders.filter((order): order is NonNullable<typeof order> => order !== null)
          .map((order) => [order._id, order])
      );

      // Calculate total revenue from paid orders
      for (const item of artistOrderItems) {
        const order = orderMap.get(item.orderId);
        if (order?.status === "paid") {
          availableBalance += item.priceUSD * 100; // Convert to cents
        }
      }
    }

    // Get last payout (Palier B - optional)
    const lastPayout = await ctx.db
      .query("artistPayouts")
      .withIndex("by_artist", (q) => q.eq("artistId", artist._id))
      .order("desc")
      .first();

    return {
      connectStatus,
      chargesEnabled,
      payoutsEnabled,
      requirementsDue,
      availableBalance, // USD cents
      pendingBalance, // USD cents
      lastPayout: lastPayout
        ? {
            amount: lastPayout.amount,
            date: lastPayout.arrivalDate,
            status: lastPayout.status,
          }
        : null,
    };
  },
});

/**
 * Transaction item type returned by getTransactions
 */
type Transaction = {
  _id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  productType: "music" | "video";
  amount: number; // USD cents
  currency: string;
  status: "paid" | "pending" | "failed" | "refunded";
  statusLabel: string; // UI-friendly label
  fanDisplayName: string;
  createdAt: number;
};

/**
 * Get artist transactions (real sales)
 * Requirements: R-ART-TXN-1 - Display real sales data, not placeholder/mock data
 * Requirements: R-ART-TXN-2 - Source of truth is Convex orders/orderItems
 * Requirements: R-ART-TXN-3 - Map order statuses to UI-friendly labels
 * 
 * Returns real sales transactions filtered by artistId via relation:
 * orderItems.productId → products.artistId
 * 
 * Pagination:
 * - limit: Maximum number of transactions to return (default: 20)
 * - cursor: Pagination cursor (createdAt timestamp of last item)
 * 
 * Status mapping:
 * - "paid" → "Completed"
 * - "pending" → "Processing"
 * - "failed" → "Failed"
 * - "refunded" → "Refunded"
 * 
 * @param limit - Maximum number of transactions (default: 20, max: 100)
 * @param cursor - Pagination cursor (createdAt timestamp)
 * @returns Array of transactions with product and fan details
 */
export const getTransactions = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{
    transactions: Transaction[];
    nextCursor: number | null;
  }> => {
    // Get authenticated user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from Convex
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify user is an artist
    if (user.role !== "artist") {
      throw new Error("Only artists can access transactions");
    }

    // Get artist profile
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", user._id))
      .unique();

    if (!artist) {
      throw new Error("Artist profile not found");
    }

    // Pagination settings
    const limit = Math.min(args.limit ?? 20, 100); // Max 100 per page
    const cursor = args.cursor ?? Date.now(); // Start from now if no cursor

    // Get all products for this artist
    const products = await ctx.db
      .query("products")
      .withIndex("by_artist", (q) => q.eq("artistId", artist._id))
      .collect();

    const productIds = new Set(products.map((p) => p._id));
    const productMap = new Map(products.map((p) => [p._id, p]));

    // Get all order items (we need to filter by productId)
    // Note: This is not optimal for large datasets, but works for MVP
    // Future optimization: Add index on orderItems by productId
    const allOrderItems = await ctx.db.query("orderItems").collect();

    // Filter order items for this artist's products
    const artistOrderItems = allOrderItems.filter((item) =>
      productIds.has(item.productId)
    );

    // Sort by createdAt desc and apply cursor
    const sortedItems = artistOrderItems
      .filter((item) => item.createdAt < cursor)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit + 1); // Fetch one extra to determine if there's a next page

    // Check if there are more items
    const hasMore = sortedItems.length > limit;
    const itemsToReturn = hasMore ? sortedItems.slice(0, limit) : sortedItems;

    // Batch fetch all orders and fans in parallel (eliminates N+1 pattern)
    const uniqueOrderIds = [...new Set(itemsToReturn.map((item) => item.orderId))];
    const orders = await Promise.all(
      uniqueOrderIds.map((orderId) => ctx.db.get(orderId))
    );

    // Create order lookup map for O(1) access
    const orderMap = new Map(
      orders.filter((order): order is NonNullable<typeof order> => order !== null)
        .map((order) => [order._id, order])
    );

    // Batch fetch all fans in parallel
    const uniqueFanIds = [...new Set(
      orders.filter((order): order is NonNullable<typeof order> => order !== null)
        .map((order) => order.fanUserId)
    )];
    const fans = await Promise.all(
      uniqueFanIds.map((fanId) => ctx.db.get(fanId))
    );

    // Create fan lookup map for O(1) access
    const fanMap = new Map(
      fans.filter((fan): fan is NonNullable<typeof fan> => fan !== null)
        .map((fan) => [fan._id, fan])
    );

    // Build transactions with order and fan details
    const transactions: Transaction[] = [];

    for (const item of itemsToReturn) {
      // Get order from map
      const order = orderMap.get(item.orderId);
      if (!order) continue;

      // Get product from map
      const product = productMap.get(item.productId);
      if (!product) continue;

      // Get fan from map
      const fan = fanMap.get(order.fanUserId);
      if (!fan) continue;

      // Map status to UI-friendly label
      // Requirements: R-ART-TXN-3 - Map order statuses to UI-friendly labels
      const statusLabel = mapStatusToLabel(order.status);

      transactions.push({
        _id: item._id,
        orderId: order._id,
        productId: product._id,
        productTitle: product.title,
        productType: product.type,
        amount: item.priceUSD * 100, // Convert to cents
        currency: order.currency,
        status: order.status,
        statusLabel,
        fanDisplayName: fan.displayName,
        createdAt: item.createdAt,
      });
    }

    // Determine next cursor
    const nextCursor = hasMore
      ? itemsToReturn.at(-1)?.createdAt ?? null
      : null;

    return {
      transactions,
      nextCursor,
    };
  },
});

/**
 * Map order status to UI-friendly label
 * Requirements: R-ART-TXN-3 - Map order statuses to UI-friendly labels
 */
function mapStatusToLabel(
  status: "paid" | "pending" | "failed" | "refunded"
): string {
  switch (status) {
    case "paid":
      return "Completed";
    case "pending":
      return "Processing";
    case "failed":
      return "Failed";
    case "refunded":
      return "Refunded";
    default:
      return "Unknown";
  }
}
