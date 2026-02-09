/**
 * Events Functions
 * Requirements: 7.1-7.5 - Artist Events Management
 *
 * Handles event/tour management:
 * - getByArtist: Retrieve events for an artist (for Public Hub)
 * - getCurrentArtistEvents: Get events for authenticated artist
 * - getEventStats: Get event statistics for dashboard
 * - create: Create a new event
 * - update: Update an existing event
 * - remove: Delete an event
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { canCreateEvent, enforceLimit } from "./subscriptions";

/**
 * Get all events for an artist
 * Requirements: 3.4 - Display "Tour Dates" tab on Public Hub
 *
 * Used for Public Hub to display artist's events/concerts.
 * Returns events sorted with upcoming first, then by date.
 *
 * @param artistId - Artist's Convex document ID
 * @returns Array of event documents
 */
export const getByArtist = query({
  args: {
    artistId: v.id("artists"),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_artist", (q) => q.eq("artistId", args.artistId))
      .collect();

    // Sort events: upcoming first, then by date
    return events.sort((a, b) => {
      // Upcoming events first
      if (a.status === "upcoming" && b.status !== "upcoming") return -1;
      if (a.status !== "upcoming" && b.status === "upcoming") return 1;
      // Then by date (ascending for upcoming, descending for past)
      if (a.status === "upcoming" && b.status === "upcoming") {
        return a.date - b.date;
      }
      return b.date - a.date;
    });
  },
});

/**
 * Get upcoming events for an artist
 * Requirements: 3.4 - Display upcoming events on Public Hub
 *
 * Returns only upcoming events for the specified artist.
 *
 * @param artistId - Artist's Convex document ID
 * @returns Array of upcoming event documents sorted by date
 */
export const getUpcomingByArtist = query({
  args: {
    artistId: v.id("artists"),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_artist", (q) => q.eq("artistId", args.artistId))
      .collect();

    // Filter only upcoming events and sort by date ascending
    return events
      .filter((event) => event.status === "upcoming")
      .sort((a, b) => a.date - b.date);
  },
});

/**
 * Count upcoming events for an artist
 * Requirements: R-ART-DASH-STAT-2 - Upcoming Events Count for Dashboard Stats
 *
 * Returns the count of upcoming events (date >= now) for the specified artist.
 * Used in the Artist Dashboard Overview stats card.
 *
 * @param artistId - Artist's Convex document ID
 * @returns Number of upcoming events
 */
export const countUpcomingByArtist = query({
  args: {
    artistId: v.id("artists"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const events = await ctx.db
      .query("events")
      .withIndex("by_artist", (q) => q.eq("artistId", args.artistId))
      .filter((q) => q.gte(q.field("date"), now))
      .collect();
    return events.length;
  },
});

/**
 * Get events for the current authenticated artist
 * Requirements: 7.2 - Display list of events in dashboard
 *
 * Convenience query that uses the authenticated user's identity.
 *
 * @returns Array of event documents or empty array if not authenticated/not an artist
 */
export const getCurrentArtistEvents = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (user?.role !== "artist") {
      return [];
    }

    // Get the artist profile for this user
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", user._id))
      .unique();

    if (!artist) {
      return [];
    }

    // Get all events for this artist
    const events = await ctx.db
      .query("events")
      .withIndex("by_artist", (q) => q.eq("artistId", artist._id))
      .collect();

    // Sort events: upcoming first, then by date
    return events.sort((a, b) => {
      if (a.status === "upcoming" && b.status !== "upcoming") return -1;
      if (a.status !== "upcoming" && b.status === "upcoming") return 1;
      if (a.status === "upcoming" && b.status === "upcoming") {
        return a.date - b.date;
      }
      return b.date - a.date;
    });
  },
});

/**
 * Get event statistics for the current artist
 * Requirements: 7.1 - Display stats (Total Tickets Sold, Gross Revenue, Upcoming Shows)
 *
 * @returns Object with totalTicketsSold, grossRevenue, upcomingShows
 */
export const getEventStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        totalTicketsSold: 0,
        grossRevenue: 0,
        upcomingShows: 0,
      };
    }

    // Get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (user?.role !== "artist") {
      return {
        totalTicketsSold: 0,
        grossRevenue: 0,
        upcomingShows: 0,
      };
    }

    // Get the artist profile for this user
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", user._id))
      .unique();

    if (!artist) {
      return {
        totalTicketsSold: 0,
        grossRevenue: 0,
        upcomingShows: 0,
      };
    }

    // Get all events for this artist
    const events = await ctx.db
      .query("events")
      .withIndex("by_artist", (q) => q.eq("artistId", artist._id))
      .collect();

    // Calculate stats
    const totalTicketsSold = events.reduce(
      (sum, event) => sum + event.ticketsSold,
      0
    );
    const grossRevenue = events.reduce((sum, event) => sum + event.revenue, 0);
    const upcomingShows = events.filter(
      (event) => event.status === "upcoming"
    ).length;

    return {
      totalTicketsSold,
      grossRevenue,
      upcomingShows,
    };
  },
});

/**
 * Create a new event
 * Requirements: 7.4 - Store date, city, venue, ticket URL, and image URL
 *
 * Creates a new event for the authenticated artist.
 * Validates:
 * - User is authenticated
 * - User has "artist" role
 * - User owns an artist profile
 *
 * @param title - Event title
 * @param date - Event date (timestamp)
 * @param city - City where event takes place
 * @param venue - Venue name
 * @param ticketUrl - Optional URL for ticket purchase
 * @param imageUrl - Optional promotional image URL
 * @returns The new event's Convex document ID
 * @throws Error if validation fails
 */
export const create = mutation({
  args: {
    title: v.string(),
    date: v.number(),
    city: v.string(),
    venue: v.string(),
    ticketUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify user has artist role
    if (user.role !== "artist") {
      throw new Error("Only artists can create events");
    }

    // Get the artist profile
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", user._id))
      .unique();

    if (!artist) {
      throw new Error(
        "Artist profile not found. Please create your profile first."
      );
    }

    // Check subscription limits (R-CLERK-SUB-1.2)
    const existingEvents = await ctx.db
      .query("events")
      .withIndex("by_artist", (q) => q.eq("artistId", artist._id))
      .collect();

    const canCreate = await canCreateEvent(ctx, existingEvents.length);
    enforceLimit(canCreate, "events");

    // Validate optional URLs
    if (args.ticketUrl) {
      try {
        new URL(args.ticketUrl);
      } catch {
        throw new Error("Invalid ticket URL format");
      }
    }

    if (args.imageUrl) {
      try {
        new URL(args.imageUrl);
      } catch {
        throw new Error("Invalid image URL format");
      }
    }

    // Determine initial status based on date
    const now = Date.now();
    const status = args.date > now ? "upcoming" : "past";

    // Create the event
    const eventId = await ctx.db.insert("events", {
      artistId: artist._id,
      title: args.title.trim(),
      date: args.date,
      city: args.city.trim(),
      venue: args.venue.trim(),
      ticketUrl: args.ticketUrl?.trim() || undefined,
      imageUrl: args.imageUrl?.trim() || undefined,
      ticketsSold: 0,
      revenue: 0,
      status,
      createdAt: now,
    });

    return eventId;
  },
});

/**
 * Validate URL format
 * @throws Error if URL is invalid
 */
function validateUrl(url: string, fieldName: string): void {
  try {
    new URL(url);
  } catch {
    throw new Error(`Invalid ${fieldName} URL format`);
  }
}

/**
 * Apply string field updates to the updates object
 */
function applyStringUpdates(
  updates: Record<string, unknown>,
  args: {
    title?: string;
    city?: string;
    venue?: string;
  }
): void {
  if (args.title !== undefined) {
    updates.title = args.title.trim();
  }
  if (args.city !== undefined) {
    updates.city = args.city.trim();
  }
  if (args.venue !== undefined) {
    updates.venue = args.venue.trim();
  }
}

/**
 * Apply URL field updates to the updates object
 * @throws Error if URL format is invalid
 */
function applyUrlUpdates(
  updates: Record<string, unknown>,
  args: {
    ticketUrl?: string;
    imageUrl?: string;
  }
): void {
  if (args.ticketUrl !== undefined) {
    if (args.ticketUrl) {
      validateUrl(args.ticketUrl, "ticket");
      updates.ticketUrl = args.ticketUrl.trim();
    } else {
      updates.ticketUrl = undefined;
    }
  }

  if (args.imageUrl !== undefined) {
    if (args.imageUrl) {
      validateUrl(args.imageUrl, "image");
      updates.imageUrl = args.imageUrl.trim();
    } else {
      updates.imageUrl = undefined;
    }
  }
}

/**
 * Apply numeric field updates to the updates object
 * @throws Error if values are negative
 */
function applyNumericUpdates(
  updates: Record<string, unknown>,
  args: {
    ticketsSold?: number;
    revenue?: number;
  }
): void {
  if (args.ticketsSold !== undefined) {
    if (args.ticketsSold < 0) {
      throw new Error("Tickets sold cannot be negative");
    }
    updates.ticketsSold = args.ticketsSold;
  }

  if (args.revenue !== undefined) {
    if (args.revenue < 0) {
      throw new Error("Revenue cannot be negative");
    }
    updates.revenue = args.revenue;
  }
}

/**
 * Update an existing event
 * Requirements: 7.5 - Display event details and edit options
 *
 * Updates an existing event. Can update title, date, city, venue, ticketUrl, imageUrl, status.
 * Validates:
 * - User is authenticated
 * - User owns the artist profile that owns the event
 *
 * @param eventId - ID of the event to update
 * @param title - Optional new title
 * @param date - Optional new date (timestamp)
 * @param city - Optional new city
 * @param venue - Optional new venue
 * @param ticketUrl - Optional new ticket URL
 * @param imageUrl - Optional new image URL
 * @param status - Optional new status
 * @param ticketsSold - Optional new tickets sold count
 * @param revenue - Optional new revenue amount
 * @returns The updated event's Convex document ID
 * @throws Error if validation fails
 */
export const update = mutation({
  args: {
    eventId: v.id("events"),
    title: v.optional(v.string()),
    date: v.optional(v.number()),
    city: v.optional(v.string()),
    venue: v.optional(v.string()),
    ticketUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    status: v.optional(
      v.union(v.literal("upcoming"), v.literal("sold-out"), v.literal("past"))
    ),
    ticketsSold: v.optional(v.number()),
    revenue: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the event
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Get the artist profile
    const artist = await ctx.db.get(event.artistId);
    if (!artist) {
      throw new Error("Artist profile not found");
    }

    // Verify ownership
    if (artist.ownerUserId !== user._id) {
      throw new Error("Not authorized to modify this event");
    }

    // Build update object
    const updates: Record<string, unknown> = {};

    // Apply string field updates
    applyStringUpdates(updates, args);

    // Handle date update with auto-status
    if (args.date !== undefined) {
      updates.date = args.date;
      // Auto-update status based on new date if status not explicitly provided
      if (args.status === undefined) {
        const now = Date.now();
        updates.status = args.date > now ? "upcoming" : "past";
      }
    }

    // Apply URL field updates
    applyUrlUpdates(updates, args);

    // Handle imageStorageId update (prioritize over imageUrl)
    if (args.imageStorageId !== undefined) {
      updates.imageStorageId = args.imageStorageId;
      // Clear imageUrl if imageStorageId is provided
      updates.imageUrl = undefined;
    }

    // Apply explicit status update
    if (args.status !== undefined) {
      updates.status = args.status;
    }

    // Apply numeric field updates
    applyNumericUpdates(updates, args);

    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.eventId, updates);
    }

    return args.eventId;
  },
});

/**
 * Delete an event
 * Requirements: 7.1-7.5 - Events management (implicit delete capability)
 *
 * Deletes an event from the artist's hub.
 * Validates:
 * - User is authenticated
 * - User owns the artist profile that owns the event
 *
 * @param eventId - ID of the event to delete
 * @returns The deleted event's ID
 * @throws Error if validation fails
 */
export const remove = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the event
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Get the artist profile
    const artist = await ctx.db.get(event.artistId);
    if (!artist) {
      throw new Error("Artist profile not found");
    }

    // Verify ownership
    if (artist.ownerUserId !== user._id) {
      throw new Error("Not authorized to delete this event");
    }

    // Delete the event
    await ctx.db.delete(args.eventId);

    return args.eventId;
  },
});
