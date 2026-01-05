"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
  };
  icon: LucideIcon;
  iconClassName?: string;
}

/**
 * StatsCard - Dashboard statistics card
 * Requirements: 4.1 - Stats cards showing Followers, Revenue, Events
 * 
 * Displays a metric with optional change indicator and icon.
 */
export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  iconClassName,
}: Readonly<StatsCardProps>) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl sm:text-3xl font-semibold tracking-tight">
              {value}
            </p>
            {change && (
              <p
                className={cn(
                  "text-xs font-medium",
                  change.type === "increase" && "text-green-600 dark:text-green-400",
                  change.type === "decrease" && "text-red-600 dark:text-red-400",
                  change.type === "neutral" && "text-muted-foreground"
                )}
              >
                {change.type === "increase" && "+"}
                {change.type === "decrease" && "-"}
                {Math.abs(change.value)}%{" "}
                <span className="text-muted-foreground font-normal">
                  vs last month
                </span>
              </p>
            )}
          </div>
          <div
            className={cn(
              "p-2 rounded-lg bg-primary/10",
              iconClassName
            )}
          >
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
