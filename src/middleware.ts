import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/onboarding",
  "/api/stripe/webhook",
  "/api/onboarding/set-role",
]);

// Public artist hub routes (dynamic [artistSlug])
// These are public pages that anyone can view
const isPublicArtistHub = (pathname: string): boolean => {
  // Match /{slug} but exclude known protected routes
  const protectedPrefixes = ["/dashboard", "/me", "/sign-in", "/sign-up", "/onboarding", "/api", "/admin", "/settings"];
  if (pathname === "/") return false;
  
  // Check if it's a single segment path (artist slug)
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 1) {
    return !protectedPrefixes.some(prefix => pathname.startsWith(prefix));
  }
  return false;
};

// Routes that require artist role
const isArtistRoute = createRouteMatcher(["/dashboard(.*)"]);

// Routes that require fan role (except /me which needs special handling)
const isFanRoute = createRouteMatcher(["/me/(.*)"]);

// The /me route itself (for redirect)
const isMeRootRoute = createRouteMatcher(["/me"]);

/**
 * Get user's role from Clerk
 */
async function getUserRole(userId: string): Promise<string | undefined> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.publicMetadata?.role as string | undefined;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return undefined;
  }
}

/**
 * Get user's username for redirect
 */
async function getUsername(userId: string): Promise<string> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.username || user.id;
  } catch {
    return userId;
  }
}

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl;

  // Allow public routes FIRST (before calling auth())
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Allow public artist hub pages (/{artistSlug})
  if (isPublicArtistHub(url.pathname)) {
    return NextResponse.next();
  }

  // Now check auth for protected routes
  const { userId } = await auth();

  // Redirect unauthenticated users to sign-in
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", url.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Get user's role (only for protected routes)
  const role = await getUserRole(userId);

  // If user has no role, redirect to onboarding (unless already there)
  if (!role && url.pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // Handle /me redirect to /me/[username]
  if (isMeRootRoute(req) && url.pathname === "/me") {
    const username = await getUsername(userId);
    return NextResponse.redirect(new URL(`/me/${username}`, req.url));
  }

  // Protect artist routes - require artist role
  if (isArtistRoute(req) && role !== "artist") {
    if (role === "fan") {
      const username = await getUsername(userId);
      return NextResponse.redirect(new URL(`/me/${username}`, req.url));
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Protect fan routes - require fan role
  if (isFanRoute(req) && role !== "fan") {
    if (role === "artist") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
