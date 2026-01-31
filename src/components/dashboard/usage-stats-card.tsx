/**
 * Usage Stats Card Component
 * Requirements: R-ART-SUB-4.6
 *
 * Displays current usage vs limits for subscription features:
 * - Products (current/limit)
 * - Events (current/limit)
 * - Links (current/limit)
 * - Video Uploads (enabled/disabled)
 *
 * Progress bars:
 * - Green: Safe (< 80%)
 * - Yellow: Warning (80%+)
 * - Red: At limit (100%)
 *
 * Visual treatment:
 * - Lock icon for disabled features
 * - Check icon for enabled features
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
    Calendar,
    CheckCircle2,
    Link2,
    Lock,
    Music,
    Video,
} from "lucide-react";

interface UsageItem {
  /** Current count */
  current: number;
  /** Maximum limit (Infinity for unlimited) */
  limit: number | "unlimited";
}

interface UsageStatsCardProps {
  /** Products usage */
  products: UsageItem;
  /** Events usage */
  events: UsageItem;
  /** Links usage */
  links: UsageItem;
  /** Whether video uploads are enabled */
  canUploadVideo: boolean;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Calculate usage percentage
 */
function getUsagePercentage(current: number, limit: number | "unlimited"): number {
  if (limit === "unlimited" || limit === Infinity) {
    return 0; // Unlimited = always safe
  }
  if (limit === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.min((current / limit) * 100, 100);
}

/**
 * Get progress bar color based on usage percentage
 * - Green: < 80%
 * - Yellow: 80% - 99%
 * - Red: 100%
 */
function getProgressColor(percentage: number): string {
  if (percentage >= 100) {
    return "bg-red-500";
  }
  if (percentage >= 80) {
    return "bg-yellow-500";
  }
  return "bg-green-500";
}

/**
 * Get text color based on usage percentage
 */
function getTextColor(percentage: number): string {
  if (percentage >= 100) {
    return "text-red-600 dark:text-red-400";
  }
  if (percentage >= 80) {
    return "text-yellow-600 dark:text-yellow-400";
  }
  return "text-muted-foreground";
}

/**
 * Format limit for display
 */
function formatLimit(limit: number | "unlimited"): string {
  if (limit === "unlimited" || limit === Infinity) {
    return "∞";
  }
  return limit.toString();
}

/**
 * Individual usage stat row with progress bar
 */
function UsageStatRow({
  icon: Icon,
  label,
  current,
  limit,
}: Readonly<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  current: number;
  limit: number | "unlimited";
}>) {
  const percentage = getUsagePercentage(current, limit);
  const progressColor = getProgressColor(percentage);
  const textColor = getTextColor(percentage);
  const isUnlimited = limit === "unlimited" || limit === Infinity;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className={cn("text-sm font-medium", textColor)}>
          {current} / {formatLimit(limit)}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            progressColor,
            isUnlimited && "bg-green-500"
          )}
          style={{
            width: isUnlimited ? "100%" : `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

/**
 * Video upload feature row with lock/check icon
 */
function VideoUploadRow({ enabled }: Readonly<{ enabled: boolean }>) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Video className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Video Uploads</span>
      </div>
      <div className="flex items-center gap-1.5">
        {enabled ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              Enabled
            </span>
          </>
        ) : (
          <>
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">
              Premium Only
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Loading skeleton for usage stats
 */
function UsageStatsSkeleton() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48 mt-1" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
        <div className="flex items-center justify-between py-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

export function UsageStatsCard({
  products,
  events,
  links,
  canUploadVideo,
  isLoading = false,
}: Readonly<UsageStatsCardProps>) {
  if (isLoading) {
    return <UsageStatsSkeleton />;
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Music className="h-5 w-5 text-muted-foreground" />
          Usage
        </CardTitle>
        <CardDescription>
          Your current usage across features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <UsageStatRow
          icon={Music}
          label="Products"
          current={products.current}
          limit={products.limit}
        />
        <UsageStatRow
          icon={Calendar}
          label="Events"
          current={events.current}
          limit={events.limit}
        />
        <UsageStatRow
          icon={Link2}
          label="Custom Links"
          current={links.current}
          limit={links.limit}
        />
        <div className="border-t border-border/50 pt-2">
          <VideoUploadRow enabled={canUploadVideo} />
        </div>
      </CardContent>
    </Card>
  );
}
