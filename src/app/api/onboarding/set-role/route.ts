import { api } from "@/../convex/_generated/api";
import { withRateLimit } from "@/lib/api-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limiter";
import { logSecurityEvent } from "@/lib/security-logger";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { fetchAction, fetchMutation } from "convex/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return withRateLimit(req, RATE_LIMITS.ONBOARDING, async () => {
    try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { role } = body;

    // Validate role
    if (!role || !["artist", "fan"].includes(role)) {
      return NextResponse.json(
        { message: "Invalid role. Must be 'artist' or 'fan'" },
        { status: 400 }
      );
    }

    // Get full user data from Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    // Update user's publicMetadata with the selected role
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role,
      },
    });

    // Extract primary email for Stripe customer creation.
    const primaryEmail =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress ?? user.emailAddresses[0]?.emailAddress;

    // Sync user to Convex
    // Requirements: 15.2 - Sync Clerk → Convex on sign-in
    const convexUserId = await fetchMutation(api.users.upsertFromClerk, {
      clerkUserId: userId,
      role: role as "artist" | "fan",
      displayName: user.fullName || user.username || user.id,
      // Slug derivation happens server-side in Convex (username > displayName > id)
      username: user.username || undefined,
      avatarUrl: user.imageUrl,
      email: primaryEmail,
    });

    // Mirror the webhook's downstream sync here so onboarding is self-sufficient:
    // works in dev without a tunnel, and hardens prod (no longer solely dependent
    // on webhook delivery). Both calls below are idempotent, so a later webhook
    // firing the same steps is a no-op. Non-blocking: a failure must not fail
    // onboarding — the prod webhook remains a backstop.
    if (primaryEmail) {
      try {
        await fetchAction(api.users.createStripeCustomer, {
          clerkUserId: userId,
          email: primaryEmail,
        });
      } catch (stripeError) {
        await logSecurityEvent({
          type: "stripe_customer_creation_failed",
          error: stripeError,
          timestamp: Date.now(),
          metadata: { clerkUserId: userId, source: "onboarding" },
        });
      }
    }

    if (role === "artist") {
      try {
        await fetchMutation(api.artists.createFromWebhook, {
          userId: convexUserId,
        });
      } catch (artistError) {
        await logSecurityEvent({
          type: "artist_profile_creation_failed",
          error: artistError,
          timestamp: Date.now(),
          metadata: { clerkUserId: userId, source: "onboarding" },
        });
      }
    }

    return NextResponse.json({ success: true, role });
  } catch (error) {
    
    return NextResponse.json(
      { message: "Failed to set role" },
      { status: 500 }
    );
  }
  });
}
