"use client";

/**
 * Artist Billing Checkout Page
 * Requirements: R-ART-SUB-1.2, R-ART-SUB-1.4
 *
 * This page renders the Clerk Billing checkout UI for artist subscriptions.
 * It uses Clerk's experimental CheckoutButton component to handle the checkout flow.
 *
 * Return URLs (Task 8.1.3):
 * - Success URL: /dashboard/billing?success=true
 * - Cancel URL: /dashboard/billing?canceled=true
 *
 * Flow:
 * 1. User arrives from /api/billing/checkout with plan parameters
 * 2. Clerk checkout UI is rendered
 * 3. On success: redirect to /dashboard/billing?success=true
 * 4. On cancel: redirect to /dashboard/billing?canceled=true
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { CheckoutButton } from "@clerk/nextjs/experimental";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";

/**
 * Return URLs for checkout flow
 * Requirements: R-ART-SUB-1.4
 */
const CHECKOUT_RETURN_URLS = {
  success: "/dashboard/billing?success=true",
  cancel: "/dashboard/billing?canceled=true",
} as const;

/**
 * Checkout Content Component
 * Wrapped in Suspense for useSearchParams
 */
function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get plan parameters from URL
  const planId = searchParams.get("plan") || undefined;
  const period = (searchParams.get("period") as "month" | "annual") || "month";

  // Handle subscription completion
  const handleSubscriptionComplete = useCallback(() => {
    // Redirect to success URL
    router.push(CHECKOUT_RETURN_URLS.success);
  }, [router]);

  // Handle cancel/back
  const handleCancel = useCallback(() => {
    router.push(CHECKOUT_RETURN_URLS.cancel);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to billing</span>
            </Button>
            <CardTitle>Upgrade Your Plan</CardTitle>
          </div>
          <CardDescription>
            Complete your subscription to unlock premium features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignedIn>
            {planId ? (
              <CheckoutButton
                planId={planId}
                planPeriod={period}
                onSubscriptionComplete={handleSubscriptionComplete}
                newSubscriptionRedirectUrl={CHECKOUT_RETURN_URLS.success}
              >
                <Button className="w-full" size="lg">
                  Continue to Checkout
                </Button>
              </CheckoutButton>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  No plan selected. Please choose a plan from the billing page.
                </p>
                <Button asChild>
                  <Link href="/dashboard/billing">
                    Go to Billing
                  </Link>
                </Button>
              </div>
            )}
          </SignedIn>
          <SignedOut>
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                Please sign in to continue with checkout.
              </p>
            </div>
          </SignedOut>
          
          <div className="text-center">
            <Button
              variant="link"
              onClick={handleCancel}
              className="text-muted-foreground"
            >
              Cancel and return to billing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Loading fallback for checkout page
 */
function CheckoutLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading checkout...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Checkout Page
 * Renders Clerk Billing checkout UI with proper return URLs
 */
export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  );
}
