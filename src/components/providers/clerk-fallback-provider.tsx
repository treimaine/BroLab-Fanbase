"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode, useEffect, useState } from "react";

interface ClerkFallbackProviderProps {
  children: ReactNode;
  publishableKey?: string;
  appearance?: any;
  afterSignOutUrl?: string;
  signInFallbackRedirectUrl?: string;
  signUpFallbackRedirectUrl?: string;
}

export function ClerkFallbackProvider({
  children,
  publishableKey,
  appearance,
  afterSignOutUrl,
  signInFallbackRedirectUrl,
  signUpFallbackRedirectUrl,
}: ClerkFallbackProviderProps) {
  const [clerkError, setClerkError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    // Listen for Clerk loading errors
    const handleClerkError = (event: ErrorEvent) => {
      if (event.message?.includes('Clerk') || event.message?.includes('clerk')) {
        console.error('Clerk loading error:', event.message);
        setClerkError(event.message);
        
        // Auto-retry up to maxRetries times
        if (retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            setClerkError(null);
            window.location.reload();
          }, 2000 + (retryCount * 1000)); // Exponential backoff
        }
      }
    };

    window.addEventListener('error', handleClerkError);
    return () => window.removeEventListener('error', handleClerkError);
  }, [retryCount]);

  // Show error state if Clerk fails to load after retries
  if (clerkError && retryCount >= maxRetries) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Authentication Service Unavailable</h1>
          <p className="text-muted-foreground mb-6">
            We're having trouble connecting to our authentication service. 
            Please check your internet connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show loading state during retry
  if (clerkError && retryCount < maxRetries) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Reconnecting... (Attempt {retryCount + 1}/{maxRetries})
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={appearance}
      afterSignOutUrl={afterSignOutUrl}
      signInFallbackRedirectUrl={signInFallbackRedirectUrl}
      signUpFallbackRedirectUrl={signUpFallbackRedirectUrl}
    >
      {children}
    </ClerkProvider>
  );
}