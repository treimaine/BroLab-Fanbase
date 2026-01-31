"use client";

import { SubscriptionCard } from "@/components/dashboard/subscription-card";
import { UsageStatsCard } from "@/components/dashboard/usage-stats-card";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SuspenseWrapper } from "@/components/ui/suspense-wrapper";
import { useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { toast } from "sonner";
import { api } from "../../../../../convex/_generated/api";
import { BillingContent } from "./components/billing-content";

/**
 * Track billing-related events for analytics
 * Requirements: R-ART-SUB-6.3, R-ART-SUB-6.4
 */
function trackBillingEvent(eventName: string, properties?: Record<string, unknown>) {
  // Analytics tracking - can be integrated with analytics provider
  // For now, log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${eventName}`, properties);
  }
  
  // Future: integrate with analytics provider (e.g., Segment, Mixpanel, PostHog)
  // globalThis.analytics?.track(eventName, properties);
}

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
      trackBillingEvent("upgrade_success", {
        source: "checkout_return",
        timestamp: new Date().toISOString(),
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
      trackBillingEvent("cancel_success", {
        source: "checkout_return",
        timestamp: new Date().toISOString(),
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
 * Uses Convex queries for subscription and usage data.
 */
function SubscriptionSection() {
  const subscription = useQuery(api.subscriptions.getCurrentSubscription);
  const usage = useQuery(api.subscriptions.getCurrentUsage);

  const isLoading = subscription === undefined || usage === undefined;

  // Determine subscription plan and status
  const plan = subscription?.plan ?? "free";
  const status = subscription?.status ?? "none";
  const currentPeriodEnd = subscription?.currentPeriodEnd;

  // Get limits from subscription data
  // Type assertion needed because Convex returns "unlimited" as string
  const limits = subscription?.limits ?? {
    maxProducts: 5 as number | "unlimited",
    maxEvents: 5 as number | "unlimited",
    maxLinks: 5 as number | "unlimited",
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
          limit: limits.maxProducts as number | "unlimited",
        }}
        events={{
          current: eventsCount,
          limit: limits.maxEvents as number | "unlimited",
        }}
        links={{
          current: linksCount,
          limit: limits.maxLinks as number | "unlimited",
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
