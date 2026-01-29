"use client";

/**
 * Artist Dashboard Overview Page (Refactored with Suspense)
 * Requirements: 4.1-4.4, R-ART-DASH-STAT-1, R-ART-DASH-STAT-2, R-ART-DASH-STAT-3
 * 
 * UX Improvements:
 * - Suspense boundaries for stats loading
 * - Reduced cognitive complexity via component extraction
 * - Better loading states with dedicated skeletons
 */

import { api } from "@/../convex/_generated/api";
import { CreateContentCard } from "@/components/dashboard/create-content-card";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton, SuspenseWrapper } from "@/components/ui/skeleton";
import { useQuery } from "convex/react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { DashboardStats } from "./components/dashboard-stats";

export default function DashboardPage() {
  const artist = useQuery(api.artists.getCurrentArtist);
  const products = useQuery(api.products.getCurrentArtistProducts);

  const isLoading = artist === undefined || products === undefined;

  // Calculate setup checklist items
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
    return <DashboardSkeleton variant="overview" />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Welcome back{artist?.displayName ? `, ${artist.displayName}` : ""}
          </h1>
          <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your hub</p>
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

      {/* Stats Grid with Suspense */}
      {artist && (
        <SuspenseWrapper
          fallback={
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-xl animate-pulse bg-primary/10" />
              ))}
            </div>
          }
        >
          <DashboardStats artistId={artist._id} />
        </SuspenseWrapper>
      )}

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
