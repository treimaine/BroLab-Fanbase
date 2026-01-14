import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Fan Dashboard Redirect Page
 * Requirements: 9.1 - Redirect to /me/[username] based on Clerk user
 * 
 * This page automatically redirects authenticated fans to their personalized
 * dashboard URL using their Clerk username.
 */
export default async function FanMeRedirect() {
  // Get the authenticated user
  const { userId } = await auth();
  
  // If not authenticated, this should be handled by middleware
  // but we add a safety check here
  if (!userId) {
    redirect("/sign-in");
  }

  // Get the full user object to access username
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  // Use username if available, otherwise fall back to userId
  // This ensures we always have a valid URL segment
  const usernameSlug = user.username || user.id;

  // Redirect to the personalized fan dashboard
  redirect(`/me/${usernameSlug}`);
}
