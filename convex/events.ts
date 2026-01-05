/**
 * Events Functions
 * Requirements: 7.1-7.5 - Artist Events Management
 *
 * Handles event/tour management:
 * - getByArtist: Retrieve events for an artist (for Public Hub)
 */

import { v } from "convex/values";
import { query } from "./_generated/server";

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
