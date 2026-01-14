"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

/**
 * Fan Dashboard Layout
 * Requirements: 9.1 - Protected by middleware (fan role required)
 * 
 * Wraps all fan dashboard pages with AppShell configured for fan role.
 * Uses Clerk for user data and sign out functionality.
 */
export default function FanLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

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
    name: user.fullName || user.username || "Fan",
    avatar: user.imageUrl,
    username: user.username || user.id,
  };

  return (
    <AppShell role="fan" user={userData} onSignOut={handleSignOut}>
      {children}
    </AppShell>
  );
}
