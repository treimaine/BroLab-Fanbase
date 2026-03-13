"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

// Extend Window interface for Clerk
declare global {
  interface Window {
    Clerk?: any;
  }
}

export function ClerkDebug() {
  const { isLoaded: authLoaded, userId } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && mounted) {
      // eslint-disable-next-line no-console
      console.log('🔍 Clerk Debug Info:', {
        publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.slice(0, 20) + '...',
        authLoaded,
        userLoaded,
        userId: userId ? 'Present' : 'None',
        user: user ? 'Present' : 'None',
        clerkJSLoaded: globalThis.window?.Clerk ? 'Yes' : 'No'
      });
    }
  }, [authLoaded, userLoaded, userId, user, mounted]);

  // NEVER render in production - double check
  if (process.env.NODE_ENV !== 'development' || !mounted) {
    return null;
  }

  // Additional runtime check to ensure we're in development
  if (globalThis.window && !globalThis.window.location.hostname.includes('localhost') && !globalThis.window.location.hostname.includes('127.0.0.1')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50" suppressHydrationWarning>
      <div className="text-xs font-mono">
        <div>🔧 DEV MODE</div>
        <div>Auth: {authLoaded ? '✅' : '⏳'}</div>
        <div>User: {userLoaded ? '✅' : '⏳'}</div>
        <div>Clerk JS: {globalThis.window?.Clerk ? '✅' : '❌'}</div>
      </div>
    </div>
  );
}