"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Music, Receipt, Video } from "lucide-react";

/**
 * Transaction type from Convex artistBilling.getTransactions
 * Requirements: R-ART-TXN-2 - Source of truth is Convex orders/orderItems
 */
interface ConvexTransaction {
  _id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  productType: "music" | "video";
  amount: number; // USD cents
  currency: string;
  status: "paid" | "pending" | "failed" | "refunded";
  statusLabel: string; // UI-friendly label
  fanDisplayName: string;
  createdAt: number;
}

interface TransactionsListProps {
  transactions?: ConvexTransaction[];
}

const productTypeConfig: Record<
  "music" | "video",
  {
    icon: typeof Music;
    label: string;
    badgeVariant: "default" | "secondary" | "outline";
    iconBg: string;
  }
> = {
  music: {
    icon: Music,
    label: "Music",
    badgeVariant: "secondary",
    iconBg:
      "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  },
  video: {
    icon: Video,
    label: "Video",
    badgeVariant: "secondary",
    iconBg:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  },
};


/**
 * TransactionsList - Recent transactions display (real data)
 * Requirements: R-ART-TXN-1 - Display real sales data, not placeholder/mock data
 * Requirements: R-ART-TXN-4 - Display empty state if no transactions
 * Requirements: R-PROD-0.1 - No mock/placeholder data visible
 *
 * Shows real sales from Convex orders/orderItems/products.
 * Empty state: "No sales yet. Share your products with fans!"
 */
export function TransactionsList({
  transactions = [],
}: Readonly<TransactionsListProps>) {
  const formatCurrency = (amountCents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amountCents / 100); // Convert cents to dollars
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(timestamp));
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Receipt className="h-5 w-5 text-muted-foreground" />
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No sales yet. Share your products with fans!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {transactions.map((transaction) => {
              const config = productTypeConfig[transaction.productType];
              const Icon = config.icon;

              return (
                <div
                  key={transaction._id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                >
                  {/* Icon */}
                  <div className={cn("p-2.5 rounded-xl shrink-0", config.iconBg)}>
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-foreground truncate">
                        {transaction.productTitle}
                      </p>
                      <Badge
                        variant={config.badgeVariant}
                        className="text-[10px] px-1.5 py-0 h-4 shrink-0"
                      >
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(transaction.createdAt)} • {transaction.fanDisplayName}
                      </p>
                      {transaction.status !== "paid" && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1.5 py-0 h-4",
                            transaction.status === "pending" &&
                              "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
                            transaction.status === "failed" &&
                              "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
                            transaction.status === "refunded" &&
                              "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
                          )}
                        >
                          {transaction.statusLabel}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        transaction.status === "paid"
                          ? "text-green-600 dark:text-green-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
