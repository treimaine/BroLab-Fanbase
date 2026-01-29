"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SuspenseWrapper } from "@/components/ui/suspense-wrapper";
import { BillingContent } from "./components/billing-content";

/**
 * Artist Billing Page
 * Requirements: R-ART-BAL-1, R-ART-TXN-1, R-PROD-0.1, R-PROD-0.2, R-PROD-0.3
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
 * Data sources:
 * - api.artistBilling.getSummary (deterministic read model)
 * - api.artistBilling.getTransactions (real sales data)
 */
export default function BillingPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Earnings & Payouts
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your earnings and payout methods
          </p>
        </div>
      </div>

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
    </div>
  );
}
