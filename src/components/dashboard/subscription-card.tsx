/**
 * Subscription Card Component
 * Requirements: R-ART-SUB-4.1, R-ART-SUB-4.2, R-ART-SUB-4.3, R-ART-SUB-4.4, R-ART-SUB-4.5, R-ART-SUB-6.2
 *
 * Displays current subscription plan with appropriate CTAs based on status.
 *
 * States:
 * - Free: "Upgrade to Premium — $19.99/month" → /api/billing/checkout
 * - Premium (Active): "Manage Subscription" → /api/billing/manage
 * - Premium (Trialing): "Manage Subscription" → /api/billing/manage (with trial badge)
 * - Premium (Canceling): "Reactivate Premium" → /api/billing/manage
 * - Premium (Past Due): "Update Payment Method" → /api/billing/manage
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertTriangle,
    Calendar,
    CheckCircle2,
    Crown,
    Loader2,
    Sparkles,
    XCircle,
} from "lucide-react";
import { useCallback, useState } from "react";

export type SubscriptionPlan = "free" | "premium";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing" | "none";

interface SubscriptionCardProps {
  /** Current subscription plan */
  plan: SubscriptionPlan;
  /** Current subscription status */
  status: SubscriptionStatus;
  /** End of current billing period (timestamp) - for Premium plans */
  currentPeriodEnd?: number;
  /** Loading state while fetching data */
  isLoading?: boolean;
}

/**
 * Track subscription-related events for analytics
 * Requirements: R-ART-SUB-6.2
 */
function trackSubscriptionEvent(eventName: string, properties?: Record<string, unknown>) {
  // Analytics tracking - can be integrated with analytics provider
  // For now, log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${eventName}`, properties);
  }

  // Future: integrate with analytics provider (e.g., Segment, Mixpanel, PostHog)
  // globalThis.analytics?.track(eventName, properties);
}

/**
 * Format date for display
 */
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Get status badge configuration based on plan and status
 */
function getStatusBadge(plan: SubscriptionPlan, status: SubscriptionStatus) {
  if (plan === "free" || status === "none") {
    return {
      label: "Free Plan",
      variant: "secondary" as const,
      className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    };
  }

  switch (status) {
    case "active":
      return {
        label: "Premium",
        variant: "default" as const,
        className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      };
    case "trialing":
      return {
        label: "Premium (Trial)",
        variant: "default" as const,
        className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      };
    case "canceled":
      return {
        label: "Canceling",
        variant: "destructive" as const,
        className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      };
    case "past_due":
      return {
        label: "Payment Failed",
        variant: "destructive" as const,
        className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      };
    default:
      return {
        label: "Free Plan",
        variant: "secondary" as const,
        className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}

/**
 * Get description text based on plan and status
 */
function getDescription(
  plan: SubscriptionPlan,
  status: SubscriptionStatus,
  currentPeriodEnd?: number
): string {
  if (plan === "free" || status === "none") {
    return "Unlock unlimited products, events, links, and video uploads.";
  }

  switch (status) {
    case "active":
      return currentPeriodEnd
        ? `Your subscription renews on ${formatDate(currentPeriodEnd)}.`
        : "Your subscription is active. Enjoy unlimited features!";
    case "trialing":
      return currentPeriodEnd
        ? `Your trial ends on ${formatDate(currentPeriodEnd)}. You'll be charged after.`
        : "You're on a free trial. Enjoy all premium features!";
    case "canceled":
      return currentPeriodEnd
        ? `Your plan will downgrade to Free on ${formatDate(currentPeriodEnd)}.`
        : "Your subscription has been canceled.";
    case "past_due":
      return "Your payment failed. Please update your payment method to continue.";
    default:
      return "Manage your subscription settings.";
  }
}

/**
 * Get icon based on plan and status
 */
function getIcon(plan: SubscriptionPlan, status: SubscriptionStatus) {
  if (plan === "free" || status === "none") {
    return <Sparkles className="h-5 w-5 text-muted-foreground" />;
  }

  switch (status) {
    case "active":
      return <Crown className="h-5 w-5 text-purple-500" />;
    case "trialing":
      return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
    case "canceled":
      return <XCircle className="h-5 w-5 text-amber-500" />;
    case "past_due":
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    default:
      return <Sparkles className="h-5 w-5 text-muted-foreground" />;
  }
}

export function SubscriptionCard({
  plan,
  status,
  currentPeriodEnd,
  isLoading = false,
}: Readonly<SubscriptionCardProps>) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  /**
   * Handle upgrade button click
   * Requirements: R-ART-SUB-4.1 - Free plan upgrade CTA
   */
  const handleUpgradeClick = useCallback(async () => {
    // Track upgrade_click event (already tracked in SubscriptionBadge, but also here for card)
    trackSubscriptionEvent("upgrade_click", {
      timestamp: new Date().toISOString(),
      currentPlan: plan,
      source: "subscription_card",
    });

    setIsRedirecting(true);

    try {
      // Redirect to checkout API route
      globalThis.location.href = "/api/billing/checkout";
    } catch (error) {
      console.error("Failed to redirect to checkout:", error);
      setIsRedirecting(false);
    }
  }, [plan]);

  /**
   * Handle manage button click
   * Requirements: R-ART-SUB-4.2, R-ART-SUB-4.3, R-ART-SUB-4.4, R-ART-SUB-4.5, R-ART-SUB-6.2
   */
  const handleManageClick = useCallback(async () => {
    // Track manage_click event (R-ART-SUB-6.2)
    trackSubscriptionEvent("manage_click", {
      timestamp: new Date().toISOString(),
      currentPlan: plan,
      currentStatus: status,
      source: "subscription_card",
    });

    setIsRedirecting(true);

    try {
      // Redirect to manage API route
      globalThis.location.href = "/api/billing/manage";
    } catch (error) {
      console.error("Failed to redirect to manage:", error);
      setIsRedirecting(false);
    }
  }, [plan, status]);

  // Loading state
  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  const statusBadge = getStatusBadge(plan, status);
  const description = getDescription(plan, status, currentPeriodEnd);
  const icon = getIcon(plan, status);

  // Determine which CTA to show
  const isFree = plan === "free" || status === "none";
  const isPremiumActive = plan === "premium" && status === "active";
  const isPremiumTrialing = plan === "premium" && status === "trialing";
  const isPremiumCanceling = plan === "premium" && status === "canceled";
  const isPremiumPastDue = plan === "premium" && status === "past_due";

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {icon}
            Subscription
          </CardTitle>
          <Badge variant={statusBadge.variant} className={statusBadge.className}>
            {statusBadge.label}
          </Badge>
        </div>
        <CardDescription className="flex items-start gap-2">
          {(isPremiumCanceling || isPremiumActive || isPremiumTrialing) && currentPeriodEnd && (
            <Calendar className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
          )}
          <span>{description}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Free Plan: Upgrade CTA */}
        {isFree && (
          <Button
            className="w-full"
            onClick={handleUpgradeClick}
            disabled={isRedirecting}
          >
            {isRedirecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Premium — $19.99/month
              </>
            )}
          </Button>
        )}

        {/* Premium Active: Manage CTA */}
        {isPremiumActive && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleManageClick}
            disabled={isRedirecting}
          >
            {isRedirecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting...
              </>
            ) : (
              "Manage Subscription"
            )}
          </Button>
        )}

        {/* Premium Trialing: Manage CTA */}
        {isPremiumTrialing && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleManageClick}
            disabled={isRedirecting}
          >
            {isRedirecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting...
              </>
            ) : (
              "Manage Subscription"
            )}
          </Button>
        )}

        {/* Premium Canceling: Reactivate CTA */}
        {isPremiumCanceling && (
          <Button
            className="w-full"
            onClick={handleManageClick}
            disabled={isRedirecting}
          >
            {isRedirecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                <Crown className="mr-2 h-4 w-4" />
                Reactivate Premium
              </>
            )}
          </Button>
        )}

        {/* Premium Past Due: Update Payment CTA */}
        {isPremiumPastDue && (
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleManageClick}
            disabled={isRedirecting}
          >
            {isRedirecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Update Payment Method
              </>
            )}
          </Button>
        )}

        {/* Helper text for free plan */}
        {isFree && (
          <p className="text-xs text-center text-muted-foreground">
            Cancel anytime. No commitment required.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
