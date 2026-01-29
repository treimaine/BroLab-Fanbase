"use client";

/**
 * Dashboard Stats Component
 * 
 * Extracted from Dashboard Overview to reduce cognitive complexity.
 * Displays real-time stats: Followers, Revenue, Upcoming Events.
 * 
 * Requirements: R-ART-DASH-STAT-1, R-ART-DASH-STAT-2, R-ART-DASH-STAT-3
 * Cognitive Complexity Target: < 10
 */

import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "convex/react";
import { Calendar, DollarSign, Users } from "lucide-react";

interface DashboardStatsProps {
  artistId: Id<"artists">;
}

export function DashboardStats({ artistId }: DashboardStatsProps) {
  const followersCount = useQuery(api.follows.countByArtist, { artistId });
  const billingSummary = useQuery(api.artistBilling.getSummary);
  const upcomingEventsCount = useQuery(api.events.countUpcomingByArtist, { artistId });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Followers stat */}
      {followersCount === undefined ? (
        <Skeleton className="h-28 rounded-xl" />
      ) : (
        <StatsCard
          title="Followers"
          value={followersCount.toString()}
          change={{ value: 0, type: "neutral" }}
          icon={Users}
        />
      )}

      {/* Revenue stat */}
      {billingSummary === undefined ? (
        <Skeleton className="h-28 rounded-xl" />
      ) : (
        <StatsCard
          title="Revenue"
          value={formatCurrency(billingSummary.availableBalance)}
          change={{ value: 0, type: "neutral" }}
          icon={DollarSign}
        />
      )}

      {/* Upcoming Events stat */}
      {upcomingEventsCount === undefined ? (
        <Skeleton className="h-28 rounded-xl" />
      ) : (
        <StatsCard
          title="Upcoming Events"
          value={upcomingEventsCount.toString()}
          icon={Calendar}
        />
      )}
    </div>
  );
}
