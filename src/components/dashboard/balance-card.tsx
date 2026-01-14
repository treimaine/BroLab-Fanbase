"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, Clock, Wallet } from "lucide-react";

interface BalanceCardProps {
  availableBalance: number;
  pendingBalance: number;
  lastPayout?: {
    amount: number;
    date: string;
  };
  currency?: string;
}

/**
 * BalanceCard - Artist billing balance display
 * Requirements: 8.1 - Display available balance with pending and last payout amounts
 * 
 * Features a gradient background matching SuperDesign aesthetic.
 * Shows available balance prominently with pending and last payout info.
 */
export function BalanceCard({
  availableBalance,
  pendingBalance,
  lastPayout,
  currency = "USD",
}: Readonly<BalanceCardProps>) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {/* Gradient background - lavender to purple matching SuperDesign */}
      <div className="bg-gradient-to-br from-primary/90 via-primary to-primary/80 dark:from-primary/80 dark:via-primary/70 dark:to-primary/60">
        <CardContent className="p-6 sm:p-8">
          {/* Available Balance - Main display */}
          <div className="space-y-1 mb-6">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary-foreground/80" />
              <p className="text-sm font-medium text-primary-foreground/80">
                Available Balance
              </p>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-primary-foreground tracking-tight">
              {formatCurrency(availableBalance)}
            </p>
          </div>

          {/* Secondary info row */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary-foreground/20">
            {/* Pending Balance */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary-foreground/70" />
                <p className="text-xs text-primary-foreground/70">Pending</p>
              </div>
              <p className="text-lg font-semibold text-primary-foreground">
                {formatCurrency(pendingBalance)}
              </p>
            </div>

            {/* Last Payout */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <ArrowUpRight className="h-3.5 w-3.5 text-primary-foreground/70" />
                <p className="text-xs text-primary-foreground/70">Last Payout</p>
              </div>
              {lastPayout ? (
                <div>
                  <p className="text-lg font-semibold text-primary-foreground">
                    {formatCurrency(lastPayout.amount)}
                  </p>
                  <p className="text-xs text-primary-foreground/60">
                    {lastPayout.date}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-primary-foreground/60">No payouts yet</p>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
