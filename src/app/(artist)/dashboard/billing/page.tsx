"use client";

import { SubscriptionCard } from "@/components/dashboard/subscription-card";
import { UsageStatsCard } from "@/components/dashboard/usage-stats-card";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SuspenseWrapper } from "@/components/ui/suspense-wrapper";
import { trackSubscriptionEvent } from "@/lib/analytics";
import { useSubscription } from "@clerk/nextjs/experimental";
import { useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { toast } from "sonner";
import { api } from "../../../../../convex/_generated/api";
import { BillingContent } from "./components/billing-content";

/**
 * Return URL Handler Component
 * Handles success/canceled URL params from subscription checkout
 * Requirements: R-ART-SUB-1.4, R-ART-SUB-6.3, R-ART-SUB-6.4
 */
function ReturnUrlHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasHandledReturnUrl = useRef(false);

  useEffect(() => {
    // Prevent duplicate handling
    if (hasHandledReturnUrl.current) return;

    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      hasHandledReturnUrl.current = true;
      
      // Show success toast
      toast.success("Subscription upgraded successfully!", {
        description: "Your new plan is now active. Thank you for upgrading!",
        duration: 5000,
      });
      
      // Track upgrade_success event (R-ART-SUB-6.3)
      trackSubscriptionEvent("upgrade_success", {
        source: "checkout_return",
      });
      
      // Clean up URL params without triggering navigation
      const newUrl = new URL(globalThis.location.href);
      newUrl.searchParams.delete("success");
      router.replace(newUrl.pathname, { scroll: false });
    } else if (canceled === "true") {
      hasHandledReturnUrl.current = true;
      
      // Show cancellation toast
      toast.info("Checkout canceled", {
        description: "No changes were made to your subscription.",
        duration: 4000,
      });
      
      // Track cancel_success event (R-ART-SUB-6.4)
      trackSubscriptionEvent("cancel_success", {
        source: "checkout_return",
      });
      
      // Clean up URL params without triggering navigation
      const newUrl = new URL(globalThis.location.href);
      newUrl.searchParams.delete("canceled");
      router.replace(newUrl.pathname, { scroll: false });
    }
  }, [searchParams, router]);

  return null;
}

/**
 * Subscription Section Component
 * Requirements: R-ART-SUB-4.1 through R-ART-SUB-4.6
 * 
 * Displays current subscription plan and usage stats.
 * Uses Clerk's useSubscription() hook for real-time subscription data
 * and Convex query for usage counts.
 * 
 * IMPORTANT: We use useSubscription() from Clerk instead of Convex query
 * because Clerk Billing updates publicMetadata.subscription, but the JWT
 * token used by Convex is not automatically refreshed. useSubscription()
 * fetches directly from Clerk API for real-time data.
 */
function SubscriptionSection() {
  // Use Clerk's useSubscription() for real-time subscription data
  const { data: clerkSubscription, isLoading: isSubscriptionLoading } = useSubscription();
  
  // Use Convex for usage counts (this data is in our DB, not affected by JWT caching)
  const usage = useQuery(api.subscriptions.getCurrentUsage);

  const isLoading = isSubscriptionLoading || usage === undefined;

  // Determine subscription plan and status from Clerk data
  // clerkSubscription is null if no subscription exists
  // status can be: "active", "past_due", "canceled", etc.
  const subscriptionStatus = clerkSubscription?.status;
  
  // Check if subscription is canceled (has canceledAt date in the active subscription item)
  const activeSubscriptionItem = clerkSubscription?.subscriptionItems?.find(
    (item) => item.status === "active"
  );
  const isCanceled = activeSubscriptionItem?.canceledAt != null;
  
  const hasActiveSubscription = subscriptionStatus === "active";
  const plan = hasActiveSubscription ? "premium" : "free";
  
  // Map Clerk status to our status type
  // If subscription is active but has been canceled (canceledAt is set), show "canceled" status
  // This allows the UI to display "Canceling" badge and appropriate messaging
  let status: "active" | "canceled" | "past_due" | "trialing" | "none";
  if (!subscriptionStatus) {
    status = "none";
  } else if (subscriptionStatus === "active" && isCanceled) {
    status = "canceled"; // Show as canceling even though technically still active
  } else {
    status = subscriptionStatus;
  }
  
  // Get period end from Clerk subscription's next payment date
  const currentPeriodEnd = clerkSubscription?.nextPayment?.date 
    ? new Date(clerkSubscription.nextPayment.date).getTime() 
    : undefined;

  // Determine limits based on plan
  const limits = hasActiveSubscription
    ? {
        maxProducts: "unlimited" as const,
        maxEvents: "unlimited" as const,
        maxLinks: "unlimited" as const,
        canUploadVideo: true,
      }
    : {
        maxProducts: 5,
        maxEvents: 5,
        maxLinks: 5,
        canUploadVideo: false,
      };

  // Get current usage counts
  const productsCount = usage?.productsCount ?? 0;
  const eventsCount = usage?.eventsCount ?? 0;
  const linksCount = usage?.linksCount ?? 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SubscriptionCard
        plan={plan}
        status={status}
        currentPeriodEnd={currentPeriodEnd}
        isLoading={isLoading}
      />
      <UsageStatsCard
        products={{
          current: productsCount,
          limit: limits.maxProducts,
        }}
        events={{
          current: eventsCount,
          limit: limits.maxEvents,
        }}
        links={{
          current: linksCount,
          limit: limits.maxLinks,
        }}
        canUploadVideo={limits.canUploadVideo}
        isLoading={isLoading}
      />
    </div>
  );
}

/**
 * Artist Billing Page
 * Requirements: R-ART-BAL-1, R-ART-TXN-1, R-PROD-0.1, R-PROD-0.2, R-PROD-0.3
 * 
 * Page Structure (Information Architecture):
 * - Section A: Subscription (Clerk Billing) - TOP priority
 *   - SubscriptionCard: Current plan with upgrade/manage CTAs
 *   - UsageStatsCard: Products, Events, Links, Video Uploads usage
 * - Section B: Earnings (Stripe Connect) - Below subscription
 *   - Connect Status / Balance / Payout Method / Transactions
 * 
 * UI State Branching (Task 14.7.2):
 * - not_connected: Show Connect CTA with explanation
 * - pending: Show requirements + Continue Setup CTA
 * - connected: Show full billing dashboard (balance, payout method, transactions)
 * 
 * Return/Refresh Handlers (Task 14.8.2):
 * - Handle return from Stripe onboarding (URL params)
 * - Refresh account link if expired
 * - Show success/error toasts
 * 
 * Return URL Handlers (Task 8.1.3):
 * - Success URL: /dashboard/billing?success=true
 * - Cancel URL: /dashboard/billing?canceled=true
 * - Display toast notifications based on URL params
 * - Track events: upgrade_success, cancel_success
 * 
 * Data sources:
 * - api.subscriptions.getCurrentSubscription (Clerk Billing)
 * - api.subscriptions.getCurrentUsage (usage counts)
 * - api.artistBilling.getSummary (deterministic read model)
 * - api.artistBilling.getTransactions (real sales data)
 */
export default function BillingPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Handle return URLs from subscription checkout - wrapped in Suspense for useSearchParams */}
      <Suspense fallback={null}>
        <ReturnUrlHandler />
      </Suspense>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Billing
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription and earnings
          </p>
        </div>
      </div>

      {/* Section A: Subscription (Clerk Billing) */}
      <section aria-labelledby="subscription-heading">
        <h2 id="subscription-heading" className="text-lg font-semibold mb-4">
          Subscription
        </h2>
        <SubscriptionSection />
      </section>

      {/* Visual Separator between Subscription and Earnings */}
      <Separator className="my-8" />

      {/* Section B: Earnings (Stripe Connect) */}
      <section aria-labelledby="earnings-heading">
        <h2 id="earnings-heading" className="text-lg font-semibold mb-4">
          Earnings & Payouts
        </h2>
        <SuspenseWrapper
          fallback={
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading billing information...</div>
                </div>
              </CardContent>
            </Card>
          }
        >
          <BillingContent />
        </SuspenseWrapper>
      </section>
    </div>
  );
}
