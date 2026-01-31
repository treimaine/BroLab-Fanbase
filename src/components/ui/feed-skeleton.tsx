/**
 * Feed Skeleton Component
 * 
 * Reusable skeleton for feed pages (Fan Feed, Explore)
 * Mirrors the layout of FeedCard components
 * 
 * Requirements: UX improvement - perceived performance
 */

import { Skeleton } from "./skeleton";

interface FeedSkeletonProps {
  readonly count?: number;
}

export function FeedSkeleton({ count = 3 }: Readonly<FeedSkeletonProps>) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }, (_, i) => i).map((index) => (
        <div key={`feed-skeleton-${index}`} className="rounded-2xl border bg-card p-6">
          {/* Header */}
          <div className="mb-4 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>

          {/* Content */}
          <Skeleton className="mb-4 h-4 w-full" />
          <Skeleton className="mb-4 h-4 w-3/4" />

          {/* Image */}
          <Skeleton className="mb-4 aspect-video w-full rounded-xl" />

          {/* Actions */}
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
