"use client";

import { BalanceCard } from "@/components/dashboard/balance-card";
import { PayoutMethodCard } from "@/components/dashboard/payout-method-card";
import { TransactionsList } from "@/components/dashboard/transactions-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "convex/react";
import { ArrowUpRight } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";

/**
 * Artist Billing Page
 * Requirements: 8.1-8.5
 * 
 * - BalanceCard: Available balance, pending, last payout (gradient background)
 * - PayoutMethodCard: Stripe Connect status (placeholder "Coming soon")
 * - TransactionsList: Recent transactions (placeholder data)
 * - "Withdraw Funds" button (disabled for MVP)
 */
export default function BillingPage() {
  const artist = useQuery(api.artists.getCurrentArtist);
  const isLoading = artist === undefined;

  if (isLoading) {
    return <BillingSkeleton />;
  }

  // Placeholder data for MVP
  const balanceData = {
    availableBalance: 0,
    pendingBalance: 0,
    lastPayout: undefined,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Billing & Payouts
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your earnings and payout methods
          </p>
        </div>
        {/* Withdraw Funds button - disabled for MVP */}
        <Button disabled className="gap-2">
          <ArrowUpRight className="h-4 w-4" />
          Withdraw Funds
        </Button>
      </div>

      {/* Balance Card - Full width on top */}
      <BalanceCard
        availableBalance={balanceData.availableBalance}
        pendingBalance={balanceData.pendingBalance}
        lastPayout={balanceData.lastPayout}
      />

      {/* Payout Method & Transactions Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PayoutMethodCard isConnected={false} />
        <TransactionsList />
      </div>
    </div>
  );
}

function BillingSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Balance card skeleton */}
      <Skeleton className="h-44 rounded-xl" />

      {/* Cards skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}
