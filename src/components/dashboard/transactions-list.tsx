"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
    ArrowDownLeft,
    ArrowUpRight,
    CreditCard,
    Music,
    Receipt,
    ShoppingBag,
    Ticket,
} from "lucide-react";

type TransactionType =
  | "ticket_sale"
  | "merch_sale"
  | "music_sale"
  | "payout"
  | "subscription";

interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
}

interface TransactionsListProps {
  transactions?: Transaction[];
  currency?: string;
}

// Placeholder transactions for MVP
const PLACEHOLDER_TRANSACTIONS: Transaction[] = [
  {
    id: "txn_1",
    type: "ticket_sale",
    description: "Summer Tour 2024 - NYC",
    amount: 125,
    date: "Dec 15, 2024",
    status: "completed",
  },
  {
    id: "txn_2",
    type: "merch_sale",
    description: "Limited Edition Hoodie",
    amount: 65,
    date: "Dec 14, 2024",
    status: "completed",
  },
  {
    id: "txn_3",
    type: "music_sale",
    description: "Midnight Dreams EP",
    amount: 9.99,
    date: "Dec 13, 2024",
    status: "completed",
  },
  {
    id: "txn_4",
    type: "payout",
    description: "Bank Transfer - Chase ****4521",
    amount: -500,
    date: "Dec 10, 2024",
    status: "completed",
  },
  {
    id: "txn_5",
    type: "subscription",
    description: "Fan Club Monthly - @musiclover",
    amount: 4.99,
    date: "Dec 8, 2024",
    status: "completed",
  },
  {
    id: "txn_6",
    type: "ticket_sale",
    description: "Summer Tour 2024 - LA",
    amount: 95,
    date: "Dec 5, 2024",
    status: "pending",
  },
];

const transactionConfig: Record<
  TransactionType,
  {
    icon: typeof Ticket;
    label: string;
    badgeVariant: "default" | "secondary" | "outline";
    iconBg: string;
  }
> = {
  ticket_sale: {
    icon: Ticket,
    label: "Ticket Sale",
    badgeVariant: "default",
    iconBg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
  merch_sale: {
    icon: ShoppingBag,
    label: "Merch",
    badgeVariant: "secondary",
    iconBg:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  },
  music_sale: {
    icon: Music,
    label: "Music",
    badgeVariant: "secondary",
    iconBg:
      "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  },
  payout: {
    icon: CreditCard,
    label: "Payout",
    badgeVariant: "outline",
    iconBg:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  },
  subscription: {
    icon: Receipt,
    label: "Subscription",
    badgeVariant: "secondary",
    iconBg: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
  },
};

/**
 * TransactionsList - Recent transactions display (placeholder)
 * Requirements: 8.4 - Display recent transactions list
 *
 * Shows Ticket Sales, Merch Revenue, Payouts, Subscriptions.
 * MVP: Uses placeholder data until Stripe integration is complete.
 */
export function TransactionsList({
  transactions = PLACEHOLDER_TRANSACTIONS,
  currency = "USD",
}: Readonly<TransactionsListProps>) {
  const formatCurrency = (amount: number) => {
    const absAmount = Math.abs(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(absAmount);
  };

  const isIncoming = (amount: number) => amount > 0;

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
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No transactions yet. Your sales and payouts will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {transactions.map((transaction) => {
              const config = transactionConfig[transaction.type];
              const Icon = config.icon;
              const incoming = isIncoming(transaction.amount);

              return (
                <div
                  key={transaction.id}
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
                        {transaction.description}
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
                        {transaction.date}
                      </p>
                      {transaction.status === "pending" && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 h-4 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                        >
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {incoming ? (
                      <ArrowDownLeft className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        incoming
                          ? "text-green-600 dark:text-green-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {incoming ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        <div className="p-4 border-t border-border/50 bg-muted/20">
          <p className="text-xs text-center text-muted-foreground">
            Showing placeholder data • Real transactions coming soon
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
