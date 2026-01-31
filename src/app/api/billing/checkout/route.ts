/**
 * Artist Billing Checkout Route Handler
 * Requirements: R-ART-SUB-1.1, R-ART-SUB-1.2
 *
 * This route handles the checkout flow for artist subscriptions.
 * It validates authentication and role, then redirects to the
 * Clerk Billing checkout page.
 *
 * Clerk Billing uses a client-side checkout flow with the useCheckout() hook.
 * This route validates the user and redirects to a checkout page that
 * renders the Clerk Billing checkout UI.
 *
 * Flow:
 * 1. Verify user is authenticated (Clerk auth())
 * 2. Verify user role = "artist"
 * 3. Redirect to /dashboard/billing/checkout page (client-side Clerk checkout)
 *
 * Error handling:
 * - 401 if not authenticated
 * - 403 if not artist role
 */

import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * GET /api/billing/checkout
 *
 * Validates user authentication and role, then redirects to
 * the Clerk Billing checkout page for the Premium plan.
 *
 * Query parameters (optional):
 * - plan: Plan ID to checkout (defaults to Premium plan)
 * - period: Billing period ("month" | "annual", defaults to "month")
 *
 * Returns:
 * - 302 redirect to checkout page on success
 * - 401 JSON error if not authenticated
 * - 403 JSON error if not artist role
 */
export async function GET(req: Request) {
  try {
    // 1. Verify authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // 2. Get user and verify role
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata?.role as string | undefined;

    if (role !== "artist") {
      return NextResponse.json(
        {
          error: "Only artists can access billing checkout",
          code: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    // 3. Parse optional query parameters
    const url = new URL(req.url);
    const planId = url.searchParams.get("plan") || undefined;
    const period = url.searchParams.get("period") || "month";

    // 4. Build redirect URL to client-side checkout page
    // The checkout page will use Clerk's useCheckout() hook to handle the checkout flow
    const baseUrl = process.env.NEXT_PUBLIC_URL || url.origin;
    const checkoutUrl = new URL("/dashboard/billing/checkout", baseUrl);

    // Pass plan parameters to the checkout page
    if (planId) {
      checkoutUrl.searchParams.set("plan", planId);
    }
    checkoutUrl.searchParams.set("period", period);

    // 5. Redirect to checkout page
    return NextResponse.redirect(checkoutUrl.toString());
  } catch (error) {
    console.error("Billing checkout error:", error);

    // Handle specific Clerk errors
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "User not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: "Failed to process checkout request", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
