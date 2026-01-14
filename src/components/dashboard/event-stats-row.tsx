"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, DollarSign, Ticket } from "lucide-react";

interface EventStats {
  totalTicketsSold: number;
  grossRevenue: number;
  upcomingShows: number;
}

interface EventStatsRowProps {
  stats: EventStats;
  isLoading?: boolean;
}

/**
 * EventStatsRow - Events page statistics row
 * Requirements: 7.1 - Display stats (Total Tickets Sold, Gross Revenue, Upcoming Shows)
 *
 * Displays event-related metrics in a horizontal row of cards.
 */
export function EventStatsRow({ stats, isLoading }: Readonly<EventStatsRowProps>) {
  if (isLoading) {
    return <EventStatsRowSkeleton />;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Total Tickets Sold */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Tickets Sold</p>
              <p className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {formatNumber(stats.totalTicketsSold)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10">
              <Ticket className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gross Revenue */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Gross Revenue</p>
              <p className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {formatCurrency(stats.grossRevenue)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-green-500/10">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Shows */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Upcoming Shows</p>
              <p className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {formatNumber(stats.upcomingShows)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EventStatsRowSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}
