"use client";

import { CreateContentCard } from "@/components/dashboard/create-content-card";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "convex/react";
import { Calendar, DollarSign, ExternalLink, Users } from "lucide-react";
import Link from "next/link";
import { api } from "../../../../convex/_generated/api";

/**
 * Artist Dashboard Overview Page
 * Requirements: 4.1-4.4
 * 
 * - 3 StatsCards: Followers, Revenue, Events
 * - SetupChecklist with progress
 * - CreateContentCard for quick actions
 * - "View Public Hub" link
 */
export default function DashboardPage() {
  const artist = useQuery(api.artists.getCurrentArtist);
  const products = useQuery(api.products.getCurrentArtistProducts);
  const isLoading = artist === undefined || products === undefined;

  // Calculate setup checklist items based on artist data
  const checklistItems = [
    {
      id: "profile",
      label: "Complete your profile",
      completed: Boolean(artist?.displayName && artist?.bio),
      href: "/dashboard/profile",
    },
    {
      id: "avatar",
      label: "Add a profile photo",
      completed: Boolean(artist?.avatarUrl),
      href: "/dashboard/profile",
    },
    {
      id: "cover",
      label: "Add a cover image",
      completed: Boolean(artist?.coverUrl),
      href: "/dashboard/profile",
    },
    {
      id: "socials",
      label: "Connect social accounts",
      completed: Boolean(artist?.socials && artist.socials.length > 0),
      href: "/dashboard/profile",
    },
    {
      id: "product",
      label: "Upload your first product",
      completed: Boolean(products && products.length > 0),
      href: "/dashboard/products",
    },
  ];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Welcome back{artist?.displayName ? `, ${artist.displayName}` : ""}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your hub
          </p>
        </div>
        {artist?.artistSlug && (
          <Link href={`/${artist.artistSlug}`} target="_blank">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View Public Hub
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Followers"
          value="0"
          change={{ value: 0, type: "neutral" }}
          icon={Users}
        />
        <StatsCard
          title="Revenue"
          value="$0.00"
          change={{ value: 0, type: "neutral" }}
          icon={DollarSign}
        />
        <StatsCard
          title="Upcoming Events"
          value="0"
          icon={Calendar}
        />
      </div>

      {/* Setup & Actions Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SetupChecklist items={checklistItems} />
        <CreateContentCard />
      </div>

      {/* No artist profile notice */}
      {!artist && (
        <div className="rounded-xl border border-dashed border-border/50 bg-muted/30 p-6 text-center">
          <h3 className="font-medium mb-2">Complete Your Artist Profile</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Set up your profile to start building your fan community
          </p>
          <Link href="/dashboard/profile">
            <Button>Set Up Profile</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
