"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, CreditCard, ExternalLink, Loader2, XCircle } from "lucide-react";

interface PayoutMethodCardProps {
  /** Stripe Connect status: "not_connected" | "pending" | "connected" */
  connectStatus: "not_connected" | "pending" | "connected";
  /** Whether charges are enabled on the connected account */
  chargesEnabled: boolean;
  /** Whether payouts are enabled on the connected account */
  payoutsEnabled: boolean;
  /** Array of requirements that need to be completed (e.g., ["bank_account", "identity_verification"]) */
  requirementsDue: string[];
  /** Loading state while fetching data */
  isLoading?: boolean;
  /** Callback when "Connect Stripe" or "Continue Setup" is clicked */
  onConnectClick?: () => void;
  /** Callback when "Manage Payouts on Stripe" is clicked (Task 14.8.3) */
  onManagePayouts?: () => void;
  /** Loading state for login link generation (Task 14.8.3) */
  isLoadingLoginLink?: boolean;
}

/**
 * PayoutMethodCard - Stripe Connect status display
 * Requirements: R-ART-CONNECT-4, R-ART-PAYOUT-3, R-PROD-0.2
 * 
 * Displays real Stripe Connect status with three states:
 * - not_connected: Show "Connect Stripe" CTA
 * - pending: Show requirements list + "Continue Setup" CTA
 * - connected: Show status + "Manage Payouts on Stripe" link (Task 14.8.3)
 * 
 * NO "Coming soon" badge, NO "Add Payout Method" button
 * 
 * Task 14.8.3: "Manage Payouts on Stripe" link
 * - Calls stripeConnect.createLoginLink action via onManagePayouts callback
 * - Opens Express dashboard in new tab
 * - Shows loading state while generating link
 */
export function PayoutMethodCard({
  connectStatus,
  chargesEnabled,
  payoutsEnabled,
  requirementsDue,
  isLoading = false,
  onConnectClick,
  onManagePayouts,
  isLoadingLoginLink = false,
}: Readonly<PayoutMethodCardProps>) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          Payout Method
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* State 1: Not Connected */}
        {connectStatus === "not_connected" && (
          <>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border/50">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Connect Stripe to Receive Payments
                </p>
                <p className="text-sm text-muted-foreground">
                  Fans pay you directly via Stripe. Payouts are automatic and secure.
                </p>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={onConnectClick}
              disabled={isLoading}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Connect Stripe Account
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secure payments powered by Stripe
            </p>
          </>
        )}

        {/* State 2: Pending (Requirements Due) */}
        {connectStatus === "pending" && (
          <>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Action Required
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Complete these steps to activate payments:
                </p>
              </div>
            </div>

            {/* Requirements list */}
            {requirementsDue.length > 0 && (
              <div className="space-y-2">
                {requirementsDue.map((requirement) => (
                  <div
                    key={requirement}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <XCircle className="h-4 w-4 text-amber-500" />
                    <span className="capitalize">
                      {requirement.replaceAll("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Status indicators */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Charges</span>
                <Badge
                  variant={chargesEnabled ? "default" : "secondary"}
                  className={
                    chargesEnabled
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : ""
                  }
                >
                  {chargesEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Payouts</span>
                <Badge
                  variant={payoutsEnabled ? "default" : "secondary"}
                  className={
                    payoutsEnabled
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : ""
                  }
                >
                  {payoutsEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={onConnectClick}
              disabled={isLoading}
            >
              Continue Setup
            </Button>
          </>
        )}

        {/* State 3: Connected */}
        {connectStatus === "connected" && (
          <>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Stripe Connected
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your account is active. Payouts are automatic.
                </p>
              </div>
            </div>

            {/* Status indicators */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Charges</span>
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                >
                  Enabled
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Payouts</span>
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                >
                  Enabled
                </Badge>
              </div>
            </div>

            {/* Manage Payouts link (Task 14.8.3) */}
            {/* Requirements: R-ART-PAYOUT-3 - Provide "Manage Payouts on Stripe" link */}
            <Button
              variant="outline"
              className="w-full"
              onClick={onManagePayouts}
              disabled={isLoadingLoginLink}
            >
              {isLoadingLoginLink ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Manage Payouts on Stripe
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Payouts are processed automatically by Stripe
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
