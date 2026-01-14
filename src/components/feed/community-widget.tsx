"use client";

/**
 * CommunityWidget - Fan dashboard sidebar widget
 * Requirements: 9.5 - Display "My Community" stats
 * 
 * Shows:
 * - Following count (number of artists the fan is following)
 * - Events count (upcoming events from followed artists)
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Users } from "lucide-react";

interface CommunityWidgetProps {
  followingCount: number;
  upcomingEventsCount: number;
  className?: string;
}

export function CommunityWidget({
  followingCount,
  upcomingEventsCount,
  className,
}: Readonly<CommunityWidgetProps>) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">My Community</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Following Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Following</span>
          </div>
          <span className="text-lg font-semibold">{followingCount}</span>
        </div>

        <Separator />

        {/* Events Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm text-muted-foreground">Events</span>
          </div>
          <span className="text-lg font-semibold">{upcomingEventsCount}</span>
        </div>
      </CardContent>
    </Card>
  );
}
