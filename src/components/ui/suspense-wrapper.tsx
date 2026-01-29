"use client";

/**
 * Suspense Wrapper Component
 * 
 * Combines React Suspense with Error Boundary for robust loading states.
 * Provides a consistent pattern for async data fetching across the app.
 * 
 * Requirements: UX improvement - better loading states and error handling
 */

import { Suspense, type ReactNode } from "react";
import { ErrorBoundary } from "./error-boundary";

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback: ReactNode;
  errorFallback?: ReactNode;
  onError?: () => void;
}

/**
 * Wraps children with Suspense and ErrorBoundary
 * 
 * Usage:
 * ```tsx
 * <SuspenseWrapper fallback={<Skeleton />}>
 *   <AsyncComponent />
 * </SuspenseWrapper>
 * ```
 */
export function SuspenseWrapper({
  children,
  fallback,
  errorFallback,
  onError,
}: SuspenseWrapperProps) {
  return (
    <ErrorBoundary fallback={errorFallback} onReset={onError}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}
