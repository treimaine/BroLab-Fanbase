"use client";

/**
 * BillingHistoryTab Component
 * Requirements: 11.4 - Display list of transactions with date, description, and amount
 *
 * Fan billing component for viewing transaction history.
 * Shows all past transactions including purchases, refunds, and other billing events.
 */

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Receipt } from "lucide-react";

/**
 * Transaction type configuration
 */
const transactionTypeConfig = {
  purchase: {
    label: "Purchase",
    icon: ArrowUpRight,
    className: "bg-red-500/10 text-red-600 border-red-500/20",
    iconClassName: "text-red-600",
  },
  refund: {
    label: "Refund",
    icon: ArrowDownLeft,
    className: "bg-green-500/10 text-green-600 border-green-500/20",
    iconClassName: "text-green-600",
  },
  subscription: {
    label: "Subscription",
    icon: Receipt,
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    iconClassName: "text-blue-600",
  },
} as const;

export type TransactionType = keyof typeof transactionTypeConfig;

export interface TransactionData {
  id: string;
  type: TransactionType;
  description: string;
  amount: number; // in USD
  currency: string;
  date: number; // timestamp
  status: "completed" | "pending" | "failed";
}

interface BillingHistoryTabProps {
  readonly transactions: TransactionData[];
  readonly isLoading?: boolean;
}

/**
 * Format date for display
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  // Today
  if (diffInDays === 0) {
    return `Today at ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  }

  // Yesterday
  if (diffInDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  }

  // This week
  if (diffInDays < 7) {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Older
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format amount for display
 */
function formatAmount(amount: number, currency: string, type: TransactionType): string {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(Math.abs(amount));

  // Refunds are positive (money back), purchases are negative (money out)
  return type === "refund" ? `+${formattedAmount}` : `-${formattedAmount}`;
}

/**
 * TransactionCard - Display individual transaction
 */
function TransactionCard({ transaction }: { readonly transaction: TransactionData }) {
  const typeConfig = transactionTypeConfig[transaction.type];
  const Icon = typeConfig.icon;

  return (
    <Card
      className={cn(
        "p-4 transition-all border-border/50 hover:shadow-md",
        transaction.status === "failed" && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Transaction Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <Icon className={cn("h-5 w-5", typeConfig.iconClassName)} />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Type Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={cn("text-xs", typeConfig.className)}
              >
                {typeConfig.label}
              </Badge>
              {transaction.status === "pending" && (
                <Badge
                  variant="outline"
                  className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                >
                  Pending
                </Badge>
              )}
              {transaction.status === "failed" && (
                <Badge
                  variant="outline"
                  className="text-xs bg-red-500/10 text-red-600 border-red-500/20"
                >
                  Failed
                </Badge>
              )}
            </div>

            {/* Description */}
            <p className="font-medium text-sm truncate">
              {transaction.description}
            </p>

            {/* Date */}
            <p className="text-xs text-muted-foreground">
              {formatDate(transaction.date)}
            </p>
          </div>
        </div>

        {/* Amount */}
        <div className="flex-shrink-0 text-right">
          <p
            className={cn(
              "font-semibold text-base",
              transaction.type === "refund"
                ? "text-green-600"
                : "text-foreground"
            )}
          >
            {formatAmount(transaction.amount, transaction.currency, transaction.type)}
          </p>
        </div>
      </div>
    </Card>
  );
}

/**
 * BillingHistoryTab - Main component for viewing transaction history
 */
export function BillingHistoryTab({
  transactions,
  isLoading = false,
}: BillingHistoryTabProps) {
  if (isLoading) {
    return <BillingHistoryTabSkeleton />;
  }

  const hasTransactions = transactions.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Billing History</h3>
        <p className="text-sm text-muted-foreground mt-1">
          View all your past transactions and purchases
        </p>
      </div>

      {/* Transactions List */}
      {hasTransactions ? (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

/**
 * Empty state when no transactions exist
 */
function EmptyState() {
  return (
    <Card className="p-8 text-center border-dashed border-2 border-border/50">
      <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <Receipt className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-base">No Transactions Yet</h4>
          <p className="text-sm text-muted-foreground">
            Your transaction history will appear here once you make your first purchase.
          </p>
        </div>
      </div>
    </Card>
  );
}

/**
 * Loading skeleton for BillingHistoryTab
 */
export function BillingHistoryTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Transactions */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 border-border/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
