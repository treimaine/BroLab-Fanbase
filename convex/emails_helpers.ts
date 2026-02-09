/**
 * Email Helper Functions (Queries & Mutations)
 * 
 * These functions are used by email actions for idempotency checking.
 * They are separate from emails.ts because they need to be regular
 * queries/mutations (not Node runtime actions).
 * 
 * Requirements: R-EMAIL-6 - Idempotency via dedicated emailEvents table
 * 
 * Decision: Option B - Dedicated emailEvents table
 * Rationale:
 * - Better observability: Email events are separate from Stripe webhook events
 * - Clearer querying: Can filter and analyze email-specific events easily
 * - Richer metadata: Store templateId, recipient, status, providerMessageId, errorMessage
 * - Separation of concerns: Email idempotency is independent from payment idempotency
 * - Future-proof: Easier to add email-specific features (retry logic, analytics, etc.)
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Check if an email has already been sent (idempotency check)
 * Requirement: R-EMAIL-6
 * @internal
 */
export const checkEmailSent = query({
  args: {
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("emailEvents")
      .withIndex("by_idempotency_key", (q) =>
        q.eq("idempotencyKey", args.idempotencyKey)
      )
      .first();

    return existing !== null;
  },
});

/**
 * Mark an email as sent (idempotency tracking)
 * Requirement: R-EMAIL-6
 * @internal
 * 
 * @param idempotencyKey - Unique key for this email send
 * @param templateId - Email template identifier
 * @param recipient - Email address
 * @param status - "sent" or "failed"
 * @param providerMessageId - Resend message ID (optional)
 * @param errorMessage - Error message if failed (optional)
 */
export const markEmailSent = mutation({
  args: {
    idempotencyKey: v.string(),
    templateId: v.string(),
    recipient: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed")),
    providerMessageId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("emailEvents", {
      idempotencyKey: args.idempotencyKey,
      templateId: args.templateId,
      recipient: args.recipient,
      status: args.status,
      providerMessageId: args.providerMessageId,
      errorMessage: args.errorMessage,
      sentAt: Date.now(),
    });
  },
});
