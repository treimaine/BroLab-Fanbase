/**
 * Dashboard Skeleton Component
 * 
 * Reusable skeleton for Artist Dashboard pages
 * Mirrors the layout of dashboard content
 * 
 * Requirements: UX improvement - perceived performance
 */

import { Skeleton } from "./skeleton";

interface DashboardSkeletonProps {
  readonly variant?: "overview" | "list" | "grid";
}

export function DashboardSkeleton({ variant = "overview" }: Readonly<DashboardSkeletonProps>) {
  if (variant === "overview") {
    return (
      <div className="space-y-6">
        {/* Stats cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => i).map((index) => (
            <Skeleton key={`stats-${index}`} className="h-32 rounded-2xl" />
          ))}
        </div>

        {/* Content sections */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }, (_, i) => i).map((index) => (
          <Skeleton key={`list-${index}`} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  // grid variant
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => i).map((index) => (
        <Skeleton key={`grid-${index}`} className="aspect-square rounded-2xl" />
      ))}
    </div>
  );
}
