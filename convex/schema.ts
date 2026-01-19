/**
 * Convex Schema Definition
 * Requirements: 15.1, 15.6
 * 
 * Defines all database tables for BroLab Fanbase:
 * - users: Synced from Clerk
 * - waitlist: Beta signups
 * - artists: Artist profiles
 * - links: Artist external links (Linktree-style)
 * - events: Tours/concerts
 * - products: Digital products (music/video)
 * - follows: Fan → Artist relationships
 * - orders: Purchase orders
 * - orderItems: Individual items in orders
 * - processedEvents: Stripe webhook idempotency
 * - downloads: Download logs
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users synced from Clerk
  // Requirements: 15.2 - Sync Clerk → Convex on sign-in
  // Requirements: R-FAN-PM-1.1 - Stripe customer binding
  users: defineTable({
    clerkUserId: v.string(),
    role: v.union(v.literal("artist"), v.literal("fan")),
    displayName: v.string(),
    usernameSlug: v.string(),
    avatarUrl: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkUserId"])
    .index("by_username", ["usernameSlug"]),

  // Waitlist for beta signups
  // Requirements: 1.3 - Store email in waitlist
  waitlist: defineTable({
    email: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  // Artist profiles
  // Requirements: 3.1, 5.4, 5.5, 15.7 - Artist hub with unique slug
  // Requirements: R-ART-CONNECT-2 - Stripe Connect state
  artists: defineTable({
    ownerUserId: v.id("users"),
    artistSlug: v.string(),
    displayName: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    socials: v.array(
      v.object({
        platform: v.string(),
        url: v.string(),
        active: v.boolean(),
      })
    ),
    // Stripe Connect fields
    stripeConnectAccountId: v.optional(v.string()),
    connectStatus: v.optional(
      v.union(
        v.literal("not_connected"),
        v.literal("pending"),
        v.literal("connected")
      )
    ),
    chargesEnabled: v.optional(v.boolean()),
    payoutsEnabled: v.optional(v.boolean()),
    requirementsDue: v.optional(v.array(v.string())),
    connectUpdatedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerUserId"])
    .index("by_slug", ["artistSlug"]),

  // Artist links (Linktree-style)
  // Requirements: 6.1-6.5 - Links management
  links: defineTable({
    artistId: v.id("artists"),
    title: v.string(),
    url: v.string(),
    type: v.string(), // "latest-release", "instagram", "youtube", etc.
    active: v.boolean(),
    order: v.number(),
    createdAt: v.number(),
  }).index("by_artist", ["artistId"]),

  // Events/Tours
  // Requirements: 7.1-7.5 - Events management
  events: defineTable({
    artistId: v.id("artists"),
    title: v.string(),
    date: v.number(), // timestamp
    venue: v.string(),
    city: v.string(),
    ticketUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    ticketsSold: v.number(),
    revenue: v.number(),
    status: v.union(
      v.literal("upcoming"),
      v.literal("sold-out"),
      v.literal("past")
    ),
    createdAt: v.number(),
  }).index("by_artist", ["artistId"]),

  // Digital products
  // Requirements: 16.1-16.7 - Products upload & management
  products: defineTable({
    artistId: v.id("artists"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("music"), v.literal("video")),
    priceUSD: v.number(),
    coverImageUrl: v.optional(v.string()),
    visibility: v.union(v.literal("public"), v.literal("private")),
    fileStorageId: v.optional(v.id("_storage")),
    contentType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_artist", ["artistId"]),

  // Fan follows
  // Requirements: 3.5 - Follow toggle
  follows: defineTable({
    fanUserId: v.id("users"),
    artistId: v.id("artists"),
    createdAt: v.number(),
  })
    .index("by_fan", ["fanUserId"])
    .index("by_artist", ["artistId"])
    .index("by_fan_artist", ["fanUserId", "artistId"]),

  // Orders
  // Requirements: 18.2, 18.3 - Order creation on payment success
  orders: defineTable({
    fanUserId: v.id("users"),
    totalUSD: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    stripeSessionId: v.string(),
    createdAt: v.number(),
  })
    .index("by_fan", ["fanUserId"])
    .index("by_stripe_session", ["stripeSessionId"]),

  // Order items
  // Requirements: 18.3 - OrderItems records
  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.id("products"),
    type: v.union(v.literal("music"), v.literal("video")),
    priceUSD: v.number(),
    fileStorageId: v.optional(v.id("_storage")), // snapshot at purchase time
    createdAt: v.number(),
  }).index("by_order", ["orderId"]),

  // Stripe webhook idempotency
  // Requirements: 18.5 - Webhook idempotency
  processedEvents: defineTable({
    provider: v.literal("stripe"),
    eventId: v.string(),
    processedAt: v.number(),
  }).index("by_event", ["provider", "eventId"]),

  // Download logs (optional)
  // Requirements: 17.6 - Log download attempts
  downloads: defineTable({
    fanUserId: v.id("users"),
    productId: v.id("products"),
    orderId: v.id("orders"),
    timestamp: v.number(),
  }).index("by_fan", ["fanUserId"]),

  // Payment methods (Stripe)
  // Requirements: R-FAN-PM-3.3, R-FAN-PM-3.4 - Deterministic read model for payment methods
  paymentMethods: defineTable({
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    stripePaymentMethodId: v.string(),
    brand: v.string(), // visa, mastercard, amex, etc.
    last4: v.string(),
    expMonth: v.number(),
    expYear: v.number(),
    isDefault: v.boolean(),
    billingName: v.optional(v.string()),
    billingEmail: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_stripeCustomerId", ["stripeCustomerId"])
    .index("by_stripePaymentMethodId", ["stripePaymentMethodId"]),

  // Artist balance snapshots (optional - Palier B)
  // Requirements: R-ART-BAL-2 - Balance data from deterministic read-model
  artistBalanceSnapshots: defineTable({
    artistId: v.id("artists"),
    stripeConnectAccountId: v.string(),
    availableUSD: v.number(),
    pendingUSD: v.number(),
    currency: v.string(), // "usd"
    snapshotAt: v.number(), // timestamp
  }).index("by_artist", ["artistId"]),

  // Artist payouts (optional - Palier B)
  // Requirements: R-ART-BAL-3 - Payout history tracking
  artistPayouts: defineTable({
    artistId: v.id("artists"),
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
    arrivalDate: v.number(), // timestamp
    createdAt: v.number(),
  })
    .index("by_artist", ["artistId"])
    .index("by_stripe_payout", ["stripePayoutId"]),
});
