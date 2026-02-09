/**
 * Limit Toast Utility
 * Requirements: R-ART-SUB-5.6, R-ART-SUB-6.1, R-ART-SUB-6.5
 *
 * Shows a toast with an "Upgrade to Premium" button when a mutation throws a limit error.
 * Tracks the limit_hit event with metadata.
 */

import { Crown } from "lucide-react";
import { toast } from "sonner";

import {
    detectLimitType,
    isLimitError,
    trackLimitHit,
    trackSubscriptionEvent,
    type LimitType,
} from "./analytics";

/**
 * Handle a mutation error and show appropriate toast
 * Requirements: R-ART-SUB-5.6, R-ART-SUB-6.5
 *
 * If the error is a limit error:
 * - Shows toast with error message and "Upgrade to Premium" button
 * - Tracks limit_hit event with metadata
 *
 * If the error is not a limit error:
 * - Shows a regular error toast
 *
 * @param error - The error from the mutation
 * @param fallbackMessage - Fallback message if error has no message
 * @param explicitLimitType - Optional explicit limit type (overrides detection)
 * @returns true if it was a limit error, false otherwise
 */
export function handleMutationError(
  error: unknown,
  fallbackMessage: string = "An error occurred",
  explicitLimitType?: LimitType
): boolean {
  const errorMessage =
    error instanceof Error ? error.message : fallbackMessage;

  if (isLimitError(errorMessage)) {
    const limitType = explicitLimitType || detectLimitType(errorMessage);

    // Track the limit_hit event (R-ART-SUB-6.5)
    if (limitType) {
      trackLimitHit(limitType);
    }

    // Show toast with upgrade button (R-ART-SUB-5.6)
    showLimitToast(errorMessage, limitType);

    return true;
  }

  // Regular error toast
  toast.error(errorMessage);
  return false;
}

/**
 * Show a limit error toast with "Upgrade to Premium" button
 * Requirements: R-ART-SUB-5.6, R-ART-SUB-6.1
 *
 * @param message - Error message to display
 * @param limitType - Optional limit type for tracking
 */
export function showLimitToast(message: string, limitType?: LimitType): void {
  toast.error(message, {
    duration: 8000, // Longer duration for important message
    action: {
      label: (
        <span className="flex items-center gap-1.5">
          <Crown className="h-3.5 w-3.5" />
          Upgrade to Premium
        </span>
      ) as unknown as string, // Sonner types expect string but accepts ReactNode
      onClick: () => {
        // Track upgrade_click from limit toast (R-ART-SUB-6.1)
        trackSubscriptionEvent("upgrade_click", {
          source: "limit_toast",
          limitType,
        });
        // Redirect to checkout
        globalThis.location.href = "/api/billing/checkout";
      },
    },
  });
}

/**
 * Show a video upload blocked toast
 * Requirements: R-ART-SUB-5.5, R-ART-SUB-5.6
 */
export function showVideoBlockedToast(): void {
  trackLimitHit("video");
  showLimitToast(
    "Video uploads are not available on the Free plan. Upgrade to Premium to upload videos.",
    "video"
  );
}

/**
 * Show a file size exceeded toast
 * Requirements: R-ART-SUB-5.6
 *
 * @param maxSizeMB - Maximum file size in MB
 */
export function showFileSizeExceededToast(maxSizeMB: number): void {
  trackLimitHit("fileSize");
  showLimitToast(
    `File size exceeds the ${maxSizeMB}MB limit on your current plan. Upgrade to Premium for larger uploads.`,
    "fileSize"
  );
}
