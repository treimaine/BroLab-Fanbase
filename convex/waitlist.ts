/**
 * Waitlist Functions
 * Requirements: 1.3 - Store email in waitlist and display success confirmation
 * Requirements: 1.4 - Display error message for invalid email without storing
 */

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";

/**
 * Email validation regex pattern
 * Validates standard email format: local@domain.tld
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns true if valid email format, false otherwise
 */
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }
  
  const trimmed = email.trim();
  
  // Check minimum length and format
  if (trimmed.length < 5 || trimmed.length > 254) {
    return false;
  }
  
  return EMAIL_REGEX.test(trimmed);
}

/**
 * Submit email to waitlist
 * Requirements: 1.3 - Store valid email in waitlist
 * Requirements: 1.4 - Reject invalid email with error
 * 
 * @param email - Email address to add to waitlist
 * @returns Object with success status and message
 */
export const submit = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    
    // Validate email format
    if (!isValidEmail(email)) {
      return {
        success: false,
        error: "Please enter a valid email address",
      };
    }
    
    // Check if email already exists in waitlist
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    
    if (existing) {
      return {
        success: true,
        message: "You're already on the waitlist!",
        alreadyExists: true,
      };
    }
    
    // Insert new waitlist entry
    await ctx.db.insert("waitlist", {
      email,
      createdAt: Date.now(),
    });

    // Send confirmation email via Resend
    await ctx.scheduler.runAfter(0, internal.emails.sendWaitlistConfirmation, {
      email,
    });

    return {
      success: true,
      message: "Welcome to the waitlist! We'll be in touch soon.",
      alreadyExists: false,
    };
  },
});

/**
 * Check if email exists in waitlist
 * Utility query for checking waitlist status
 * 
 * @param email - Email address to check
 * @returns Boolean indicating if email is in waitlist
 */
export const checkEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    
    return existing !== null;
  },
});
