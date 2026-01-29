/**
 * Hub Skeleton Component
 * 
 * Reusable skeleton for Public Artist Hub page
 * Mirrors the layout of HubHeader + Tabs + Content
 * 
 * Requirements: UX improvement - perceived performance
 */

import { Skeleton } from "./skeleton";

export function HubSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Cover skeleton */}
      <Skeleton className="h-48 w-full sm:h-56 md:h-64 lg:h-72" />

      {/* Content skeleton */}
      <div className="relative -mt-16 flex flex-col items-center px-4 pb-6 sm:-mt-20">
        <Skeleton className="h-28 w-28 rounded-full sm:h-32 sm:w-32" />
        <Skeleton className="mt-4 h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
        <Skeleton className="mt-4 h-10 w-28 rounded-full" />
        <div className="mt-4 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-9 rounded-full" />
          ))}
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        <Skeleton className="mx-auto h-10 w-64 rounded-lg" />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
