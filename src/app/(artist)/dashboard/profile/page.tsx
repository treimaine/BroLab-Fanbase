"use client";

/**
 * Artist Profile Page (Refactored with Suspense)
 * Requirements: 5.1-5.6
 *
 * UX Improvements:
 * - Suspense boundaries for better loading states
 * - Reduced cognitive complexity via component extraction
 * - Dedicated skeleton for profile page
 */

import { api } from "@/../convex/_generated/api";
import { Skeleton, SuspenseWrapper } from "@/components/ui/skeleton";
import { useQuery } from "convex/react";
import { ProfileContent } from "./components/profile-content";

export default function ProfilePage() {
  const artist = useQuery(api.artists.getCurrentArtist);
  const isLoading = artist === undefined;

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Profile & Bio</h1>
        <p className="text-muted-foreground mt-1">Manage your public profile information</p>
      </div>

      {/* Profile Content with Suspense */}
      <SuspenseWrapper
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        }
      >
        <ProfileContent artist={artist} />
      </SuspenseWrapper>
    </div>
  );
}

function ProfilePageSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="rounded-2xl border border-border/50 p-6 space-y-6">
        <Skeleton className="h-6 w-40" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-10 flex-1" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="rounded-2xl border border-border/50 p-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
