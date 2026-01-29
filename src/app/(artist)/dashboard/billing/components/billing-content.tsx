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
import { api } from "../../../../../../convex/_generated/api";

function LoadingState() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading billing information...</div>
        </div>
      </CardContent>
    </Card>
  );
}

function NotConnectedState({
  isConnecting,
  onConnect,
}: Readonly<{
  isConnecting: boolean;
  onConnect: () => void;
}>) {
  return (
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
        <Button size="lg" onClick={onConnect} disabled={isConnecting}>
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
  );
}

function PendingState({
  requirementsDue,
  isConnecting,
  onContinueSetup,
}: Readonly<{
  requirementsDue: string[];
  isConnecting: boolean;
  onContinueSetup: () => void;
}>) {
  return (
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
        {requirementsDue.length > 0 ? (
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {requirementsDue.map((requirement) => (
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
        <Button size="lg" onClick={onContinueSetup} disabled={isConnecting}>
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
  );
}

function ConnectedState({
  availableBalance,
  pendingBalance,
  lastPayout,
  connectStatus,
  chargesEnabled,
  payoutsEnabled,
  requirementsDue,
  transactions,
  onConnectClick,
  onManagePayouts,
  isLoadingLoginLink,
}: Readonly<{
  availableBalance: number;
  pendingBalance: number;
  lastPayout?: { amount: number; date: string };
  connectStatus: "not_connected" | "pending" | "connected";
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requirementsDue: string[];
  transactions: any[];
  onConnectClick: () => void;
  onManagePayouts: () => void;
  isLoadingLoginLink: boolean;
}>) {
  return (
    <>
      <BalanceCard
        availableBalance={availableBalance}
        pendingBalance={pendingBalance}
        lastPayout={lastPayout}
        isLoading={false}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <PayoutMethodCard
          connectStatus={connectStatus}
          chargesEnabled={chargesEnabled}
          payoutsEnabled={payoutsEnabled}
          requirementsDue={requirementsDue}
          isLoading={false}
          onConnectClick={onConnectClick}
          onManagePayouts={onManagePayouts}
          isLoadingLoginLink={isLoadingLoginLink}
        />
        <TransactionsList transactions={transactions} />
      </div>
    </>
  );
}

export function BillingContent() {
  const billingSummary = useQuery(api.artistBilling.getSummary);
  const transactionsData = useQuery(api.artistBilling.getTransactions, { limit: 20 });

  const createAccount = useAction(api.stripeConnect.createAccount);
  const createAccountLink = useAction(api.stripeConnect.createAccountLink);
  const createLoginLink = useAction(api.stripeConnect.createLoginLink);
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingLoginLink, setIsLoadingLoginLink] = useState(false);
  const [hasShownReturnToast, setHasShownReturnToast] = useState(false);

  const isLoading = billingSummary === undefined;

  useEffect(() => {
    if (isLoading || hasShownReturnToast) return;

    const connectStatus = billingSummary?.connectStatus;
    
    if (connectStatus === "connected") {
      toast.success("Stripe account connected successfully! You can now receive payments.");
      setHasShownReturnToast(true);
    } else if (connectStatus === "pending" && billingSummary?.requirementsDue?.length) {
      toast.info("Almost there! Please complete the remaining requirements to activate payments.");
      setHasShownReturnToast(true);
    }
  }, [isLoading, billingSummary, hasShownReturnToast]);

  const handleConnectStripe = async () => {
    try {
      setIsConnecting(true);

      const { stripeConnectAccountId } = await createAccount({});
      console.log("Stripe Connect account created:", stripeConnectAccountId);

      const returnUrl = `${globalThis.location.origin}/dashboard/billing`;
      const refreshUrl = `${globalThis.location.origin}/dashboard/billing`;

      const { url } = await createAccountLink({ returnUrl, refreshUrl });
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

  const handleContinueSetup = async () => {
    try {
      setIsConnecting(true);

      const returnUrl = `${globalThis.location.origin}/dashboard/billing`;
      const refreshUrl = `${globalThis.location.origin}/dashboard/billing`;

      const { url } = await createAccountLink({ returnUrl, refreshUrl });
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

  const handleManagePayouts = async () => {
    try {
      setIsLoadingLoginLink(true);

      const { url } = await createLoginLink({});
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

  const transactions = transactionsData?.transactions ?? [];
  const availableBalance = billingSummary ? billingSummary.availableBalance / 100 : 0;
  const pendingBalance = billingSummary ? billingSummary.pendingBalance / 100 : 0;

  const lastPayout = billingSummary?.lastPayout
    ? {
        amount: billingSummary.lastPayout.amount / 100,
        date: new Date(billingSummary.lastPayout.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      }
    : undefined;

  const connectStatus = billingSummary?.connectStatus ?? "not_connected";

  if (isLoading) {
    return <LoadingState />;
  }

  if (connectStatus === "not_connected") {
    return (
      <NotConnectedState
        isConnecting={isConnecting}
        onConnect={handleConnectStripe}
      />
    );
  }

  if (connectStatus === "pending") {
    return (
      <PendingState
        requirementsDue={billingSummary?.requirementsDue ?? []}
        isConnecting={isConnecting}
        onContinueSetup={handleContinueSetup}
      />
    );
  }

  return (
    <ConnectedState
      availableBalance={availableBalance}
      pendingBalance={pendingBalance}
      lastPayout={lastPayout}
      connectStatus={connectStatus}
      chargesEnabled={billingSummary?.chargesEnabled ?? false}
      payoutsEnabled={billingSummary?.payoutsEnabled ?? false}
      requirementsDue={billingSummary?.requirementsDue ?? []}
      transactions={transactions}
      onConnectClick={handleConnectStripe}
      onManagePayouts={handleManagePayouts}
      isLoadingLoginLink={isLoadingLoginLink}
    />
  );
}
