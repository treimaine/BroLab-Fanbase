"use client";

import { api } from "@/../convex/_generated/api";
import { AppShell } from "@/components/layout/app-shell";
import { SubscriptionReconciler } from "@/components/dashboard/subscription-reconciler";
import { Skeleton } from "@/components/ui/skeleton";
import { useClerk, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";

/**
 * Artist Dashboard Layout
 * Requirements: 4.5 - Protected by middleware (artist role required)
 * 
 * Wraps all artist dashboard pages with AppShell configured for artist role.
 * Uses Clerk for user data and sign out functionality.
 */
export default function ArtistLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  // Convex user record — source of truth for the usernameSlug used in URLs
  const convexUser = useQuery(api.users.getCurrentUser);
  // Artist profile — source of truth for the identity shown across the dashboard
  // chrome (avatar + display name). Keeps the sidebar/drawer/nav in sync with the
  // public hub and fan feed, instead of the stale Clerk auth image/name.
  const artist = useQuery(api.artists.getCurrentArtist);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Show loading skeleton while user data loads
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  // User should always be available here (protected by middleware)
  if (!user) {
    return null;
  }

  const userData = {
    // Prefer the artist profile identity so what the artist edits is what they
    // see everywhere. Fall back to Clerk only until the artist profile loads.
    name: artist?.displayName || user.fullName || user.username || "Artist",
    avatar: artist?.avatarUrl || user.imageUrl,
    // Prefer the Convex usernameSlug (e.g. "steve-lemba") over the Clerk id
    username: convexUser?.usernameSlug || user.username || user.id,
  };

  return (
    <AppShell role="artist" user={userData} onSignOut={handleSignOut}>
      {/* Pull-based subscription sync on each dashboard load (ngrok-free). */}
      <SubscriptionReconciler />
      {children}
    </AppShell>
  );
}
