"use client";

/**
 * UserSyncProvider - Automatically sync Clerk users to Convex
 * Requirements: 15.2 - Sync Clerk → Convex on sign-in
 * 
 * This provider ensures that whenever a user is authenticated with Clerk,
 * their data is automatically synchronized to the Convex database.
 * 
 * This handles cases where:
 * - User signs in for the first time
 * - User's data changes in Clerk
 * - User returns after being away
 */

import { api } from "@/../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";

export function UserSyncProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, isLoaded } = useUser();
  const upsertUser = useMutation(api.users.upsertFromClerk);
  const hasSynced = useRef(false);

  useEffect(() => {
    // Only sync once per session when user is loaded and authenticated
    if (!isLoaded || !user || hasSynced.current) {
      return;
    }

    // Check if user has a role assigned
    const role = user.publicMetadata?.role as "artist" | "fan" | undefined;
    
    // Only sync if user has completed onboarding (has a role)
    if (!role) {
      return;
    }

    // Sync user to Convex
    const syncUser = async () => {
      try {
        await upsertUser({
          clerkUserId: user.id,
          role,
          displayName: user.fullName || user.username || user.id,
          usernameSlug: user.username || user.id,
          avatarUrl: user.imageUrl,
        });
        
        hasSynced.current = true;
        console.log("✅ User synced to Convex:", user.id);
      } catch (error) {
        console.error("❌ Failed to sync user to Convex:", error);
        // Don't block the app if sync fails
        // User can still use the app, sync will retry on next load
      }
    };

    syncUser();
  }, [isLoaded, user, upsertUser]);

  return <>{children}</>;
}
