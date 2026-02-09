/**
 * Email Actions using Resend
 * Handles all transactional emails for the platform
 * 
 * Requirements:
 * - R-EMAIL-1: Send emails from Convex internal actions (Node runtime)
 * - R-EMAIL-2: Async dispatch via scheduler
 * - R-EMAIL-5: FROM address configuration
 * - R-EMAIL-6: Idempotency via processedEvents
 * - R-EMAIL-7: Structured logging
 */

"use node";

import { v } from "convex/values";
import { Resend } from "resend";
import { renderEmail, type TemplateId } from "../emails/render";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

const resend = new Resend(process.env.RESEND_API_KEY);

// Email sender configuration
// Requirement: R-EMAIL-5
const FROM_EMAIL = "BroLab Support <support@app.brolabentertainment.com>";

/**
 * Centralized email sending action
 * 
 * This is the main function for sending all transactional emails.
 * It handles idempotency, rendering, sending, and logging.
 * 
 * Requirements:
 * - R-EMAIL-1: Send from Convex internal action (Node runtime)
 * - R-EMAIL-2: Async dispatch (called via scheduler)
 * - R-EMAIL-5: FROM address
 * - R-EMAIL-6: Idempotency
 * - R-EMAIL-7: Structured logging
 * 
 * @param templateId - The email template identifier
 * @param to - Recipient email address
 * @param props - Template-specific props
 * @param idempotencyKey - Unique key to prevent duplicate sends (e.g., "waitlist_confirmation:<waitlistId>")
 * 
 * @example
 * ```ts
 * await ctx.scheduler.runAfter(0, internal.emails.send, {
 *   templateId: "waitlist_confirmation",
 *   to: "user@example.com",
 *   props: { email: "user@example.com" },
 *   idempotencyKey: `waitlist_confirmation:${waitlistId}`,
 * });
 * ```
 */
export const send = internalAction({
  args: {
    templateId: v.string(), // TemplateId type
    to: v.string(),
    props: v.any(), // Template-specific props
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    return await sendEmailInternal(ctx, args);
  },
});

/**
 * Internal helper function for sending emails
 * Extracted to allow reuse from other actions in the same file
 */
async function sendEmailInternal(
  ctx: any,
  args: {
    templateId: string;
    to: string;
    props: any;
    idempotencyKey: string;
  }
) {
  const startTime = Date.now();

  try {
    // Step 1: Check idempotency
    // Requirement: R-EMAIL-6
    // @ts-ignore - emails_helpers is generated but TypeScript cache may not be updated
    const alreadySent = await ctx.runQuery(internal.emails_helpers.checkEmailSent, {
      idempotencyKey: args.idempotencyKey,
    });

    if (alreadySent) {
      // Requirement: R-EMAIL-7 - Structured logging
      console.log(
        JSON.stringify({
          level: "info",
          message: "Email already sent (idempotency)",
          templateId: args.templateId,
          recipient: args.to,
          status: "skipped",
          idempotencyKey: args.idempotencyKey,
          timestamp: Date.now(),
        })
      );
      return { success: true, skipped: true, reason: "already_sent" };
    }

    // Step 2: Render email template
    // Requirement: R-EMAIL-4
    const { subject, html, text } = await renderEmail(
      args.templateId as TemplateId,
      args.props
    );

    // Step 3: Send via Resend API
    // Requirement: R-EMAIL-1, R-EMAIL-5
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: args.to,
      subject,
      html,
      text,
    });

    if (error) {
      // Mark as failed for idempotency tracking
      // @ts-ignore - emails_helpers is generated but TypeScript cache may not be updated
      await ctx.runMutation(internal.emails_helpers.markEmailSent, {
        idempotencyKey: args.idempotencyKey,
        templateId: args.templateId,
        recipient: args.to,
        status: "failed",
        errorMessage: error.message,
      });

      // Requirement: R-EMAIL-7 - Structured logging (error)
      console.log(
        JSON.stringify({
          level: "error",
          message: "Failed to send email",
          templateId: args.templateId,
          recipient: args.to,
          status: "failed",
          idempotencyKey: args.idempotencyKey,
          error: error.message,
          timestamp: Date.now(),
          duration: Date.now() - startTime,
        })
      );
      return { success: false, error: error.message };
    }

    // Step 4: Mark as processed (idempotency)
    // Requirement: R-EMAIL-6
    // @ts-ignore - emails_helpers is generated but TypeScript cache may not be updated
    await ctx.runMutation(internal.emails_helpers.markEmailSent, {
      idempotencyKey: args.idempotencyKey,
      templateId: args.templateId,
      recipient: args.to,
      status: "sent",
      providerMessageId: data?.id,
    });

    // Step 5: Log success
    // Requirement: R-EMAIL-7 - Structured logging (success)
    console.log(
      JSON.stringify({
        level: "info",
        message: "Email sent successfully",
        templateId: args.templateId,
        recipient: args.to,
        status: "sent",
        idempotencyKey: args.idempotencyKey,
        providerMessageId: data?.id,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
      })
    );

    return { success: true, emailId: data?.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Mark as failed for idempotency tracking
    try {
      // @ts-ignore - emails_helpers is generated but TypeScript cache may not be updated
      await ctx.runMutation(internal.emails_helpers.markEmailSent, {
        idempotencyKey: args.idempotencyKey,
        templateId: args.templateId,
        recipient: args.to,
        status: "failed",
        errorMessage,
      });
    } catch (markError) {
      // If marking failed also fails, log but don't throw
      console.error("Failed to mark email as failed:", markError);
    }

    // Requirement: R-EMAIL-7 - Structured logging (exception)
    console.log(
      JSON.stringify({
        level: "error",
        message: "Email send exception",
        templateId: args.templateId,
        recipient: args.to,
        status: "failed",
        idempotencyKey: args.idempotencyKey,
        error: errorMessage,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
      })
    );

    return {
      success: false,
      error: errorMessage,
    };
  }
}


/**
 * Send waitlist confirmation email
 * Called after a user successfully joins the waitlist
 * 
 * Requirements:
 * - R-EMAIL-1: Send from Convex internal action
 * - R-EMAIL-2: Async dispatch via centralized send
 */
export const sendWaitlistConfirmation = internalAction({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Use centralized send logic with idempotency
    // Requirement: R-EMAIL-1, R-EMAIL-2
    return await sendEmailInternal(ctx, {
      templateId: "waitlist_confirmation",
      to: args.email,
      props: { email: args.email },
      idempotencyKey: `waitlist_confirmation:${args.email}`,
    });
  },
});
