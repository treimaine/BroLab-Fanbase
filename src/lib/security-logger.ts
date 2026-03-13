/**
 * Security Event Logger
 * 
 * Logs security-related events with detailed information server-side
 * while returning generic error messages to clients.
 * 
 * Integrates with Convex centralized security logging for critical events.
 */

import { api } from "@/../convex/_generated/api";
import { fetchAction } from "convex/nextjs";

interface SecurityEvent {
  type: string;
  error?: unknown;
  timestamp: number;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log security event with full details server-side
 * This should be enhanced to send to a monitoring service in production
 * 
 * For critical events (webhook failures, authentication failures),
 * also logs to Convex centralized security logging system.
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  const logEntry = {
    ...event,
    timestamp: new Date(event.timestamp).toISOString(),
    errorDetails: event.error instanceof Error 
      ? {
          message: event.error.message,
          stack: event.error.stack,
          name: event.error.name,
        }
      : event.error,
  };

  // Log to console (in production, send to monitoring service like Sentry, DataDog, etc.)
  // console.log('Security Event:', logEntry);

  // Determine if this is a critical event that should be logged to Convex
  const criticalEventTypes = [
    "stripe_webhook_verification_failed",
    "stripe_checkout_processing_failed",
    "stripe_payment_method_processing_failed",
    "stripe_connect_account_processing_failed",
    "stripe_balance_processing_failed",
    "stripe_payout_processing_failed",
  ];

  if (criticalEventTypes.includes(event.type)) {
    try {
      // Log to Convex centralized security logging
      await fetchAction(api.security.logWebhookSignatureFailureAction, {
        provider: "stripe",
        eventId: event.metadata?.eventId,
        error: event.error instanceof Error ? event.error.message : String(event.error),
        ipAddress: event.ipAddress,
      });
    } catch (convexError) {
      // Don't fail the original operation if Convex logging fails
      
    }
  }

  // Future enhancement: Send to monitoring service
  // Example: await sendToMonitoringService(logEntry);
}

/**
 * Generic error messages for different error types
 * These are safe to return to clients
 */
export const GENERIC_ERROR_MESSAGES = {
  WEBHOOK_VERIFICATION_FAILED: "Webhook verification failed",
  WEBHOOK_PROCESSING_FAILED: "Failed to process webhook",
  INTERNAL_SERVER_ERROR: "Internal server error",
  MISSING_REQUIRED_DATA: "Missing required data",
  INVALID_REQUEST: "Invalid request",
} as const;
