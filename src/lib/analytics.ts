/**
 * Analytics Helper
 * Requirements: R-ART-SUB-6.1, R-ART-SUB-6.2, R-ART-SUB-6.3, R-ART-SUB-6.4, R-ART-SUB-6.5, R-ART-SUB-6.6
 *
 * Tracks subscription-related events for analytics.
 * Currently logs to console in development, can be integrated with analytics provider.
 */

export type LimitType = "products" | "events" | "links" | "video" | "fileSize";

export type SubscriptionEventName =
  | "upgrade_click"
  | "manage_click"
  | "upgrade_success"
  | "cancel_success"
  | "limit_hit";

export interface SubscriptionEventMetadata {
  plan?: string;
  status?: string;
  limitType?: LimitType;
  source?: string;
  timestamp?: string;
  [key: string]: unknown;
}

/**
 * Track subscription-related events for analytics
 * Requirements: R-ART-SUB-6.1, R-ART-SUB-6.2, R-ART-SUB-6.3, R-ART-SUB-6.4, R-ART-SUB-6.5, R-ART-SUB-6.6
 *
 * @param eventName - Name of the event to track
 * @param metadata - Optional metadata to include with the event
 */
export function trackSubscriptionEvent(
  eventName: SubscriptionEventName,
  metadata?: SubscriptionEventMetadata
): void {
  const eventData = {
    ...metadata,
    timestamp: metadata?.timestamp || new Date().toISOString(),
  };

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${eventName}`, eventData);
  }

  // Future: integrate with analytics provider (e.g., PostHog, Segment, Mixpanel)
  // Example PostHog integration:
  // if (typeof window !== "undefined" && window.posthog) {
  //   window.posthog.capture(eventName, eventData);
  // }
}

/**
 * Track limit_hit event when user hits quota limit
 * Requirements: R-ART-SUB-6.5, R-ART-SUB-6.6
 *
 * @param limitType - Type of limit that was hit
 * @param additionalMetadata - Optional additional metadata
 */
export function trackLimitHit(
  limitType: LimitType,
  additionalMetadata?: Omit<SubscriptionEventMetadata, "limitType">
): void {
  trackSubscriptionEvent("limit_hit", {
    limitType,
    ...additionalMetadata,
  });
}

/**
 * Check if an error message indicates a subscription limit was hit
 *
 * @param errorMessage - Error message to check
 * @returns true if the error is a limit error
 */
export function isLimitError(errorMessage: string): boolean {
  const limitPatterns = [
    /you've reached the limit/i,
    /upgrade to create more/i,
    /upgrade to premium/i,
    /video uploads? (are|is) not available/i,
    /video uploads? (are|is) disabled/i,
    /file size exceeds/i,
    /maximum file size/i,
    /on your current plan/i,
  ];

  return limitPatterns.some((pattern) => pattern.test(errorMessage));
}

/**
 * Detect the limit type from an error message
 *
 * @param errorMessage - Error message to analyze
 * @returns The detected limit type or undefined
 */
export function detectLimitType(errorMessage: string): LimitType | undefined {
  const lowerMessage = errorMessage.toLowerCase();

  if (lowerMessage.includes("product")) {
    return "products";
  }
  if (lowerMessage.includes("event")) {
    return "events";
  }
  if (lowerMessage.includes("link")) {
    return "links";
  }
  if (lowerMessage.includes("video")) {
    return "video";
  }
  if (lowerMessage.includes("file size") || lowerMessage.includes("filesize")) {
    return "fileSize";
  }

  return undefined;
}
