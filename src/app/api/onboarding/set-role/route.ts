import { api } from "@/../convex/_generated/api";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
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

    // Sync user to Convex
    // Requirements: 15.2 - Sync Clerk → Convex on sign-in
    await fetchMutation(api.users.upsertFromClerk, {
      clerkUserId: userId,
      role: role as "artist" | "fan",
      displayName: user.fullName || user.username || user.id,
      usernameSlug: user.username || user.id,
      avatarUrl: user.imageUrl,
    });

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error("Error setting user role:", error);
    return NextResponse.json(
      { message: "Failed to set role" },
      { status: 500 }
    );
  }
}
