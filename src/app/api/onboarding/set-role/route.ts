import { auth, clerkClient } from "@clerk/nextjs/server";
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

    // Update user's publicMetadata with the selected role
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role,
      },
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
