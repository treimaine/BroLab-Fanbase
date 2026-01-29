"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SuspenseWrapper } from "@/components/ui/suspense-wrapper";
import { BillingContent } from "./components/billing-content";

/**
 * Fan Billing Page
 * Requirements: 11.1-11.5 - Payment methods and billing history management
 * Requirements: R-FAN-PM-3.1, R-FAN-PM-7.2, R-FAN-PM-7.3 - Real data from Convex
 * 
 * Displays fan's billing information with:
 * - Tabs: Payment Methods / Billing History
 * - Payment methods management (add/remove cards)
 * - Transaction history
 * - Security notice about Stripe-secured payments
 * 
 * Connected to Stripe via Convex with real data
 */
export default function BillingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Billing</h1>
          <p className="text-muted-foreground">
            Manage your payment methods and view transaction history
          </p>
        </div>

        <SuspenseWrapper
          fallback={
            <Card className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </Card>
          }
        >
          <BillingContent />
        </SuspenseWrapper>
      </div>
    </div>
  );
}
