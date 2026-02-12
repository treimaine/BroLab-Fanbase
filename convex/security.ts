/**
 * Security Logging & Alerting
 * Requirements: A09:2025 - Security Logging and Monitoring Failures
 * 
 * Centralized security event logging and alerting system.
 * Logs critical security events and sends alerts for high-severity incidents.
 */

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalMutation } from "./_generated/server";

/**
 * Security event severity levels
 */
export type SecuritySeverity = "low" | "medium" | "high" | "critical";

/**
 * Log security event
 * Requirements: A09 - Centralized logging for security events
 * 
 * Logs security events to the securityLogs table with severity classification.
 * For critical events, triggers alerting mechanism.
 * 
 * Event types:
 * - download_attempt: File download attempts (authorized/unauthorized)
 * - unauthorized_access: Access to protected resources without permission
 * - webhook_signature_failed: Stripe webhook signature verification failure
 * - role_change: User role modification
 * - rate_limit_exceeded: Rate limit violations
 * - authentication_failed: Failed authentication attempts
 * 
 * @param eventType - Type of security event
 * @param userId - Convex user ID (optional)
 * @param clerkUserId - Clerk user ID (optional)
 * @param severity - Event severity (low, medium, high, critical)
 * @param details - Additional event details
 * @param resourceType - Type of resource accessed (product, order, etc.)
 * @param resourceId - ID of resource accessed
 * @param reason - Reason for security event (not_authenticated, not_authorized, etc.)
 * @param ipAddress - Client IP address (optional)
 * @param userAgent - Client user agent (optional)
 */
export const logSecurityEvent = internalMutation({
  args: {
    eventType: v.string(),
    userId: v.optional(v.id("users")),
    clerkUserId: v.optional(v.string()),
    severity: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    details: v.any(),
    resourceType: v.optional(v.string()),
    resourceId: v.optional(v.string()),
    reason: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();

    // Insert security log
    await ctx.db.insert("securityLogs", {
      userId: args.userId,
      clerkUserId: args.clerkUserId,
      action: args.eventType,
      resourceType: args.resourceType || "unknown",
      resourceId: args.resourceId || "unknown",
      reason: args.reason || "unknown",
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      timestamp,
    });

    // Log to console for immediate visibility
    console.log(`[SECURITY ${args.severity.toUpperCase()}] ${args.eventType}`, {
      userId: args.userId,
      clerkUserId: args.clerkUserId,
      resourceType: args.resourceType,
      resourceId: args.resourceId,
      reason: args.reason,
      timestamp: new Date(timestamp).toISOString(),
      details: args.details,
    });

    // Alert if critical
    if (args.severity === "critical") {
      await sendSecurityAlert(ctx, {
        eventType: args.eventType,
        severity: args.severity,
        userId: args.userId,
        clerkUserId: args.clerkUserId,
        resourceType: args.resourceType,
        resourceId: args.resourceId,
        reason: args.reason,
        details: args.details,
        timestamp,
      });
    }
  },
});

/**
 * Send security alert for critical events
 * Requirements: A09 - Alerting for critical security events
 * 
 * Sends alerts via multiple channels for critical security events:
 * - Console logging (immediate visibility)
 * - Email notification (future: via Resend)
 * - Slack notification (future: via webhook)
 * - PagerDuty (future: for on-call)
 * 
 * @param ctx - Convex context
 * @param event - Security event details
 */
async function sendSecurityAlert(
  ctx: any,
  event: {
    eventType: string;
    severity: SecuritySeverity;
    userId?: string;
    clerkUserId?: string;
    resourceType?: string;
    resourceId?: string;
    reason?: string;
    details: any;
    timestamp: number;
  }
) {
  // Format alert message
  const alertMessage = formatAlertMessage(event);

  // Console alert (always enabled)
  console.error("🚨 CRITICAL SECURITY ALERT 🚨");
  console.error(alertMessage);
  console.error("Details:", JSON.stringify(event.details, null, 2));

  // TODO: Email notification via Resend
  // await sendEmailAlert(alertMessage, event);

  // TODO: Slack notification
  // await sendSlackAlert(alertMessage, event);

  // TODO: PagerDuty incident
  // await createPagerDutyIncident(alertMessage, event);
}

/**
 * Format security alert message
 */
function formatAlertMessage(event: {
  eventType: string;
  severity: SecuritySeverity;
  userId?: string;
  clerkUserId?: string;
  resourceType?: string;
  resourceId?: string;
  reason?: string;
  timestamp: number;
}): string {
  const lines = [
    `🚨 CRITICAL SECURITY EVENT: ${event.eventType}`,
    `Severity: ${event.severity.toUpperCase()}`,
    `Time: ${new Date(event.timestamp).toISOString()}`,
  ];

  if (event.userId) {
    lines.push(`User ID: ${event.userId}`);
  }

  if (event.clerkUserId) {
    lines.push(`Clerk User ID: ${event.clerkUserId}`);
  }

  if (event.resourceType && event.resourceId) {
    lines.push(`Resource: ${event.resourceType}/${event.resourceId}`);
  }

  if (event.reason) {
    lines.push(`Reason: ${event.reason}`);
  }

  return lines.join("\n");
}

/**
 * Log webhook signature verification failure (Public Action)
 * Requirements: A09 - Log webhook security events
 * 
 * Public action that can be called from Next.js webhook routes.
 * Logs failed webhook signature verifications as critical security events.
 * 
 * @param provider - Webhook provider (stripe)
 * @param eventId - Webhook event ID
 * @param error - Error message
 * @param ipAddress - Client IP address (optional)
 */
export const logWebhookSignatureFailureAction = action({
  args: {
    provider: v.string(),
    eventId: v.optional(v.string()),
    error: v.string(),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Call the internal mutation to log the event
    await ctx.runMutation(internal.security.logWebhookSignatureFailure, {
      provider: args.provider,
      eventId: args.eventId,
      error: args.error,
      ipAddress: args.ipAddress,
    });
  },
});

/**
 * Log webhook signature verification failure (Internal Mutation)
 * Requirements: A09 - Log webhook security events
 * 
 * Logs failed webhook signature verifications as critical security events.
 * These indicate potential webhook spoofing attempts.
 * 
 * @param provider - Webhook provider (stripe)
 * @param eventId - Webhook event ID
 * @param error - Error message
 * @param ipAddress - Client IP address (optional)
 */
export const logWebhookSignatureFailure = internalMutation({
  args: {
    provider: v.string(),
    eventId: v.optional(v.string()),
    error: v.string(),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();

    // Insert security log directly
    await ctx.db.insert("securityLogs", {
      clerkUserId: undefined,
      action: "webhook_signature_failed",
      resourceType: "webhook",
      resourceId: args.eventId || "unknown",
      reason: "signature_verification_failed",
      ipAddress: args.ipAddress,
      timestamp,
    });

    // Log to console (critical severity)
    console.error(`[SECURITY CRITICAL] webhook_signature_failed`, {
      provider: args.provider,
      eventId: args.eventId,
      error: args.error,
      ipAddress: args.ipAddress,
      timestamp: new Date(timestamp).toISOString(),
    });

    // Future: Send critical alert to monitoring service
  },
});

/**
 * Log user role change
 * Requirements: A09 - Log role modifications
 * 
 * Logs user role changes as high-severity security events.
 * Role changes are sensitive operations that should be monitored.
 * 
 * @param userId - Convex user ID
 * @param clerkUserId - Clerk user ID
 * @param oldRole - Previous role
 * @param newRole - New role
 * @param changedBy - User who made the change (optional)
 */
/**
 * Log user role change
 * Requirements: A09 - Log role modifications
 * 
 * Logs user role changes as high-severity security events.
 * Role changes are sensitive operations that should be monitored.
 * 
 * @param userId - Convex user ID
 * @param clerkUserId - Clerk user ID
 * @param oldRole - Previous role
 * @param newRole - New role
 * @param changedBy - User who made the change (optional)
 */
export const logRoleChange = internalMutation({
  args: {
    userId: v.id("users"),
    clerkUserId: v.string(),
    oldRole: v.union(v.literal("artist"), v.literal("fan")),
    newRole: v.union(v.literal("artist"), v.literal("fan")),
    changedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();

    // Insert security log
    await ctx.db.insert("securityLogs", {
      userId: args.userId,
      clerkUserId: args.clerkUserId,
      action: "role_change",
      resourceType: "user",
      resourceId: args.userId,
      reason: "role_modified",
      timestamp,
    });

    // Log to console (high severity)
    console.error(`[SECURITY HIGH] role_change`, {
      userId: args.userId,
      clerkUserId: args.clerkUserId,
      oldRole: args.oldRole,
      newRole: args.newRole,
      changedBy: args.changedBy,
      timestamp: new Date(timestamp).toISOString(),
    });

    // Future: Send alert to monitoring service for high-severity events
  },
});

/**
 * Log successful file download
 * Requirements: A09 - Log file access
 * 
 * Logs successful file downloads as low-severity events for audit trail.
 * 
 * @param userId - Convex user ID
 * @param clerkUserId - Clerk user ID
 * @param productId - Product ID
 * @param orderId - Order ID
 */
/**
 * Log successful file download
 * Requirements: A09 - Log file access
 * 
 * Logs successful file downloads as low-severity events for audit trail.
 * 
 * @param userId - Convex user ID
 * @param clerkUserId - Clerk user ID
 * @param productId - Product ID
 * @param orderId - Order ID
 */
export const logFileDownload = internalMutation({
  args: {
    userId: v.id("users"),
    clerkUserId: v.string(),
    productId: v.id("products"),
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();

    // Insert security log
    await ctx.db.insert("securityLogs", {
      userId: args.userId,
      clerkUserId: args.clerkUserId,
      action: "file_download",
      resourceType: "product",
      resourceId: args.productId,
      reason: "authorized_download",
      timestamp,
    });

    // Log to console (low severity - info level)
    console.log(`[SECURITY LOW] file_download`, {
      userId: args.userId,
      productId: args.productId,
      orderId: args.orderId,
      timestamp: new Date(timestamp).toISOString(),
    });
  },
});

/**
 * Log authentication failure
 * Requirements: A09 - Log authentication events
 * 
 * Logs failed authentication attempts as medium-severity events.
 * Multiple failures from same IP may indicate brute force attack.
 * 
 * @param clerkUserId - Clerk user ID (if available)
 * @param reason - Failure reason
 * @param ipAddress - Client IP address (optional)
 * @param userAgent - Client user agent (optional)
 */
/**
 * Log authentication failure
 * Requirements: A09 - Log authentication events
 * 
 * Logs failed authentication attempts as medium-severity events.
 * Multiple failures from same IP may indicate brute force attack.
 * 
 * @param clerkUserId - Clerk user ID (if available)
 * @param reason - Failure reason
 * @param ipAddress - Client IP address (optional)
 * @param userAgent - Client user agent (optional)
 */
export const logAuthenticationFailure = internalMutation({
  args: {
    clerkUserId: v.optional(v.string()),
    reason: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();

    // Insert security log
    await ctx.db.insert("securityLogs", {
      clerkUserId: args.clerkUserId,
      action: "authentication_failed",
      resourceType: "authentication",
      resourceId: "auth_system",
      reason: args.reason,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      timestamp,
    });

    // Log to console
    console.log(`[SECURITY MEDIUM] authentication_failed`, {
      clerkUserId: args.clerkUserId,
      reason: args.reason,
      ipAddress: args.ipAddress,
      timestamp: new Date(timestamp).toISOString(),
    });
  },
});
