/**
 * Subscription Reconcile Route Handler
 * Requirements: R-CLERK-SUB-1.1 (Clerk Billing = source of truth),
 * R-CLERK-SUB-1.2 (server-side gating).
 *
 * Pull-based subscription sync — the ngrok-free counterpart to the Clerk
 * Billing webhook. It reads the caller's true plan server-side from Clerk
 * (auth().has()) and mirrors it onto the Convex `users` row so server-side
 * mutations can enforce plan limits. Triggered on dashboard load; also acts as
 * a self-healing fallback if a webhook delivery is ever missed.
 *
 * Security: the plan is resolved here from Clerk's signed session (never trusted
 * from the client). The Convex mutation is guarded by CONVEX_SYNC_SECRET.
 */

import { api } from "@/../convex/_generated/api";
import { auth } from "@clerk/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const { userId, has } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Not authenticated", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  // Resolve Premium from Clerk's signed session — no webhook required.
  // has({ plan }) may key on the plan slug or the plan id depending on config,
  // so we accept either to avoid depending on which one Clerk expects.
  const slug = process.env.NEXT_PUBLIC_CLERK_PLAN_PREMIUM_SLUG || "premium";
  const planId = process.env.NEXT_PUBLIC_CLERK_PLAN_PREMIUM_ID;

  let isPremium = false;
  try {
    isPremium =
      has({ plan: slug }) || (planId ? has({ plan: planId }) : false);
  } catch {
    // has() returns false for unknown keys; guard against unexpected throws.
    isPremium = false;
  }

  const plan: "free" | "premium" = isPremium ? "premium" : "free";

  const secret = process.env.CONVEX_SYNC_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Reconcile secret not configured", code: "MISCONFIGURED" },
      { status: 500 }
    );
  }

  try {
    const result = await fetchMutation(api.users.reconcileSubscriptionPlan, {
      clerkUserId: userId,
      plan,
      secret,
    });
    return NextResponse.json({ plan, ...result });
  } catch {
    return NextResponse.json(
      { error: "Failed to reconcile subscription", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
