"use client";

/**
 * SubscriptionReconciler
 * Requirements: R-CLERK-SUB-1.1, R-CLERK-SUB-1.2
 *
 * Fire-and-forget pull-based subscription sync. On mount (i.e. each dashboard
 * load) it asks the server to re-read the artist's true plan from Clerk and
 * mirror it onto the Convex `users` row — no webhook / ngrok required. This
 * keeps server-side plan enforcement correct and self-heals any missed webhook.
 *
 * Renders nothing.
 */

import { useEffect } from "react";

export function reconcileSubscriptionNow(): void {
  // Best-effort; enforcement never depends on this call succeeding synchronously.
  void fetch("/api/billing/reconcile", { method: "POST" }).catch(() => {});
}

export function SubscriptionReconciler() {
  useEffect(() => {
    reconcileSubscriptionNow();
  }, []);

  return null;
}
