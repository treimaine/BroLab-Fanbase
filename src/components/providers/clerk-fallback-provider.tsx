"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode, useCallback, useEffect, useState } from "react";

interface ClerkFallbackProviderProps {
  readonly children: ReactNode;
  readonly publishableKey?: string;
  readonly appearance?: any;
  readonly afterSignOutUrl?: string;
  readonly signInFallbackRedirectUrl?: string;
  readonly signUpFallbackRedirectUrl?: string;
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

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setClerkError(null);
    globalThis.location.reload();
  }, []);

  const scheduleRetry = useCallback(() => {
    if (retryCount < maxRetries) {
      const delay = 2000 + (retryCount * 1000); // Exponential backoff
      setTimeout(handleRetry, delay);
    }
  }, [retryCount, maxRetries, handleRetry]);

  const handleClerkError = useCallback((event: ErrorEvent) => {
    const isClerkError = event.message?.includes('Clerk') || event.message?.includes('clerk');
    if (isClerkError) {
      setClerkError(event.message);
      scheduleRetry();
    }
  }, [scheduleRetry]);

  useEffect(() => {
    globalThis.addEventListener('error', handleClerkError);
    return () => globalThis.removeEventListener('error', handleClerkError);
  }, [handleClerkError]);

  const handleManualRetry = useCallback(() => {
    globalThis.location.reload();
  }, []);

  // Show error state if Clerk fails to load after retries
  if (clerkError && retryCount >= maxRetries) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Authentication Service Unavailable</h1>
          <p className="text-muted-foreground mb-6">
            We&apos;re having trouble connecting to our authentication service. 
            Please check your internet connection and try again.
          </p>
          <button
            onClick={handleManualRetry}
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