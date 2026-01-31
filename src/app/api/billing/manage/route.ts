/**
 * Artist Billing Manage Route Handler
 * Requirements: R-ART-SUB-2.1, R-ART-SUB-2.2
 *
 * This route handles the subscription management flow for artists.
 * It validates authentication and role, then redirects to the
 * Clerk Billing subscription management page.
 *
 * Clerk Billing uses client-side components for subscription management.
 * This route validates the user and redirects to a manage page that
 * renders the Clerk Billing subscription details UI.
 *
 * Flow:
 * 1. Verify user is authenticated (Clerk auth())
 * 2. Verify user role = "artist"
 * 3. Redirect to Clerk Billing portal (client-side manage page)
 *
 * Error handling:
 * - 401 if not authenticated
 * - 403 if not artist role
 */

import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * GET /api/billing/manage
 *
 * Validates user authentication and role, then redirects to
 * the Clerk Billing subscription management page.
 *
 * Returns:
 * - 302 redirect to manage page on success
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
          error: "Only artists can access subscription management",
          code: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    // 3. Build redirect URL to client-side manage page
    // The manage page will use Clerk's <SubscriptionDetailsButton /> to handle subscription management
    const url = new URL(req.url);
    const baseUrl = process.env.NEXT_PUBLIC_URL || url.origin;
    const manageUrl = new URL("/dashboard/billing/manage", baseUrl);

    // 4. Redirect to manage page
    return NextResponse.redirect(manageUrl.toString());
  } catch (error) {
    console.error("Billing manage error:", error);

    // Handle specific Clerk errors
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "User not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: "Failed to process manage request", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
