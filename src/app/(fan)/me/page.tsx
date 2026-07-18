import { api } from "@/../convex/_generated/api";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

/**
 * Fan Dashboard Redirect Page
 * Requirements: 9.1 - Redirect to /me/[username] based on the user's slug
 *
 * Redirects authenticated fans to their personalized dashboard URL using the
 * Convex usernameSlug (derived from display name, e.g. "steve-lemba") — the
 * single source of truth for user slugs. Falls back to the Clerk user id only
 * if the Convex record doesn't exist yet (webhook not processed).
 */
export default async function FanMeRedirect() {
  // Get the authenticated user
  const { userId } = await auth();

  // If not authenticated, this should be handled by middleware
  // but we add a safety check here
  if (!userId) {
    redirect("/sign-in");
  }

  // Resolve the user's slug from Convex (source of truth)
  const convexUser = await fetchQuery(api.users.getByClerkId, {
    clerkUserId: userId,
  });

  const usernameSlug = convexUser?.usernameSlug || userId;

  // Redirect to the personalized fan dashboard
  redirect(`/me/${usernameSlug}`);
}
