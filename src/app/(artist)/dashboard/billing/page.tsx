"use client";

import { BalanceCard } from "@/components/dashboard/balance-card";
import { PayoutMethodCard } from "@/components/dashboard/payout-method-card";
import { TransactionsList } from "@/components/dashboard/transactions-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAction, useQuery } from "convex/react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../../convex/_generated/api";

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
  // Fetch billing summary with real data
  const billingSummary = useQuery(api.artistBilling.getSummary);
  const isLoading = billingSummary === undefined;

  // Stripe Connect actions (Task 14.8.1, 14.8.3)
  const createAccount = useAction(api.stripeConnect.createAccount);
  const createAccountLink = useAction(api.stripeConnect.createAccountLink);
  const createLoginLink = useAction(api.stripeConnect.createLoginLink);
  
  // Loading state for Connect button
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Loading state for login link (Task 14.8.3)
  const [isLoadingLoginLink, setIsLoadingLoginLink] = useState(false);
  
  // Track if we've shown the return toast (Task 14.8.2)
  const [hasShownReturnToast, setHasShownReturnToast] = useState(false);

  /**
   * Handle return from Stripe onboarding (Task 14.8.2)
   * Requirements: R-ART-CONNECT-4 - Handle return from Stripe onboarding
   * 
   * Stripe redirects back to returnUrl after onboarding with no special params.
   * We detect the return by checking if the user just came back and their status changed.
   * 
   * Success indicators:
   * - connectStatus changed from "pending" to "connected"
   * - chargesEnabled and payoutsEnabled are true
   * 
   * Pending indicators:
   * - connectStatus is still "pending"
   * - requirementsDue array is not empty
   * 
   * We show a toast once when the page loads after return.
   */
  useEffect(() => {
    if (isLoading || hasShownReturnToast) return;

    // Check if user just returned from Stripe (we can use a URL param or session storage)
    // For simplicity, we'll check if the status is "connected" and show success
    // or if status is "pending" with requirements, show info toast
    
    const connectStatus = billingSummary?.connectStatus;
    
    if (connectStatus === "connected") {
      // Show success toast if account is fully connected
      toast.success("Stripe account connected successfully! You can now receive payments.");
      setHasShownReturnToast(true);
    } else if (connectStatus === "pending" && billingSummary?.requirementsDue && billingSummary.requirementsDue.length > 0) {
      // Show info toast if there are still requirements
      toast.info("Almost there! Please complete the remaining requirements to activate payments.");
      setHasShownReturnToast(true);
    }
  }, [isLoading, billingSummary, hasShownReturnToast]);

  /**
   * Handle Connect Stripe button click
   * Requirements: R-ART-CONNECT-1 - Stripe Connect onboarding flow
   * 
   * Flow (Task 14.8.1):
   * 1. Call stripeConnect.createAccount action
   * 2. Call stripeConnect.createAccountLink action
   * 3. Redirect to Stripe onboarding URL
   * 
   * Error handling:
   * - Show toast on error
   * - Reset loading state
   */
  const handleConnectStripe = async () => {
    try {
      setIsConnecting(true);

      // Step 1: Create Stripe Connect account (idempotent)
      console.log("Creating Stripe Connect account...");
      const { stripeConnectAccountId } = await createAccount({});
      console.log("Stripe Connect account created:", stripeConnectAccountId);

      // Step 2: Create account link for onboarding
      // Return URL: redirect back to billing page after successful onboarding
      // Refresh URL: redirect back to billing page if link expires
      const returnUrl = `${globalThis.location.origin}/dashboard/billing`;
      const refreshUrl = `${globalThis.location.origin}/dashboard/billing`;

      console.log("Creating account link...");
      const { url } = await createAccountLink({ returnUrl, refreshUrl });
      console.log("Account link created:", url);

      // Step 3: Redirect to Stripe onboarding
      // Requirements: R-ART-CONNECT-1 - Redirect to Stripe onboarding URL
      globalThis.location.href = url;
    } catch (error) {
      console.error("Error connecting Stripe:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to connect Stripe. Please try again."
      );
      setIsConnecting(false);
    }
  };

  /**
   * Handle Continue Setup button click (Task 14.8.2)
   * Requirements: R-ART-CONNECT-4 - Refresh account link if expired
   * 
   * When the user clicks "Continue Setup" in the pending state,
   * we generate a new account link and redirect them back to Stripe.
   * 
   * This handles the case where:
   * - The previous link expired
   * - The user needs to complete additional requirements
   * - The user wants to update their information
   * 
   * Flow:
   * 1. Call stripeConnect.createAccountLink action (refresh)
   * 2. Redirect to Stripe onboarding URL
   * 
   * Error handling:
   * - Show toast on error
   * - Reset loading state
   */
  const handleContinueSetup = async () => {
    try {
      setIsConnecting(true);

      // Create a new account link (refresh)
      const returnUrl = `${globalThis.location.origin}/dashboard/billing`;
      const refreshUrl = `${globalThis.location.origin}/dashboard/billing`;

      console.log("Refreshing account link...");
      const { url } = await createAccountLink({ returnUrl, refreshUrl });
      console.log("Account link refreshed:", url);

      // Redirect to Stripe onboarding
      globalThis.location.href = url;
    } catch (error) {
      console.error("Error refreshing Stripe link:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to refresh Stripe link. Please try again."
      );
      setIsConnecting(false);
    }
  };

  /**
   * Handle "Manage Payouts on Stripe" link click (Task 14.8.3)
   * Requirements: R-ART-PAYOUT-3 - Generate Express dashboard URL
   * 
   * When the user clicks "Manage Payouts on Stripe" in the connected state,
   * we generate a login link to the Stripe Express dashboard and open it in a new tab.
   * 
   * The login link is single-use and expires after a short time, so we generate it
   * on-demand rather than storing it.
   * 
   * Flow:
   * 1. Call stripeConnect.createLoginLink action
   * 2. Open Express dashboard URL in new tab
   * 
   * Error handling:
   * - Show toast on error
   * - Reset loading state
   */
  const handleManagePayouts = async () => {
    try {
      setIsLoadingLoginLink(true);

      console.log("Creating Stripe Express login link...");
      const { url } = await createLoginLink({});
      console.log("Login link created:", url);

      // Open Express dashboard in new tab
      // Requirements: R-ART-PAYOUT-3 - Open Express dashboard in new tab
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error creating login link:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to open Stripe dashboard. Please try again."
      );
    } finally {
      setIsLoadingLoginLink(false);
    }
  };

  // Fetch real transactions (limit: 20 most recent)
  const transactionsData = useQuery(api.artistBilling.getTransactions, {
    limit: 20,
  });
  const transactions = transactionsData?.transactions ?? [];

  // Convert cents to dollars for display (only if data is loaded)
  const availableBalance = billingSummary ? billingSummary.availableBalance / 100 : 0;
  const pendingBalance = billingSummary ? billingSummary.pendingBalance / 100 : 0;

  // Format last payout data
  const lastPayout = billingSummary?.lastPayout
    ? {
        amount: billingSummary.lastPayout.amount / 100, // Convert cents to dollars
        date: new Date(billingSummary.lastPayout.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      }
    : undefined;

  // Get connect status (default to not_connected if loading)
  const connectStatus = billingSummary?.connectStatus ?? "not_connected";

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
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

      {/* UI State Branching based on connectStatus */}
      {isLoading ? (
        // Loading state
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading billing information...</div>
            </div>
          </CardContent>
        </Card>
      ) : connectStatus === "not_connected" ? (
        // State 1: Not Connected - Show Connect CTA
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="space-y-1">
                <CardTitle>Connect Stripe to Receive Payments</CardTitle>
                <CardDescription className="text-base">
                  Fans pay you directly via Stripe. Payouts are automatic.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              onClick={handleConnectStripe}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Stripe Account"
              )}
            </Button>
          </CardContent>
        </Card>
      ) : connectStatus === "pending" ? (
        // State 2: Pending - Show requirements + Continue Setup CTA
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="space-y-1">
                <CardTitle>Action Required</CardTitle>
                <CardDescription className="text-base">
                  Complete these steps to activate payments:
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Requirements list */}
            {billingSummary?.requirementsDue && billingSummary.requirementsDue.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {billingSummary.requirementsDue.map((requirement: string) => (
                  <li key={requirement} className="capitalize">
                    {requirement.replaceAll("_", " ")}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Please complete your Stripe account setup.
              </p>
            )}
            <Button
              size="lg"
              onClick={handleContinueSetup}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Continue Stripe Setup"
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        // State 3: Connected - Show full billing dashboard
        <>
          {/* Balance Card - Full width on top with real data */}
          <BalanceCard
            availableBalance={availableBalance}
            pendingBalance={pendingBalance}
            lastPayout={lastPayout}
            isLoading={false}
          />

          {/* Payout Method & Transactions Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            <PayoutMethodCard
              connectStatus={connectStatus}
              chargesEnabled={billingSummary?.chargesEnabled ?? false}
              payoutsEnabled={billingSummary?.payoutsEnabled ?? false}
              requirementsDue={billingSummary?.requirementsDue ?? []}
              isLoading={false}
              onConnectClick={handleConnectStripe}
              onManagePayouts={handleManagePayouts}
              isLoadingLoginLink={isLoadingLoginLink}
            />
            <TransactionsList transactions={transactions} />
          </div>
        </>
      )}
    </div>
  );
}
