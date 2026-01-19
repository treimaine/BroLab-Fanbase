import { api } from "@/../convex/_generated/api";
import { WebhookEvent } from "@clerk/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { headers } from "next/headers";
// @ts-ignore - svix types issue
import { Webhook } from "svix";

export async function POST(req: Request) {
  // Get the Svix headers for verification
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("❌ Missing svix headers");
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify webhook secret is configured
  if (!process.env.CLERK_WEBHOOK_SECRET) {
    console.error("❌ CLERK_WEBHOOK_SECRET not configured");
    return new Response("Error: Webhook secret not configured", { status: 500 });
  }

  // Create a new Webhook instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook signature
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("❌ Error verifying webhook:", err);
    return new Response("Error: Verification failed", { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log(`📥 Received Clerk webhook: ${eventType}`);

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, first_name, last_name, username, image_url, public_metadata } = evt.data;

    const role = public_metadata?.role as "artist" | "fan" | undefined;

    // Only sync if user has a role (completed onboarding)
    if (!role) {
      console.log(`⏭️ Skipping sync for user ${id} - no role assigned yet`);
      return new Response("OK - No role assigned", { status: 200 });
    }

    try {
      await fetchMutation(api.users.upsertFromClerk, {
        clerkUserId: id,
        role,
        displayName: `${first_name || ""} ${last_name || ""}`.trim() || username || id,
        usernameSlug: username || id,
        avatarUrl: image_url,
      });

      console.log(`✅ User ${id} synced to Convex via webhook`);
      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("❌ Failed to sync user to Convex:", error);
      return new Response("Error: Sync failed", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    // TODO: Implement user deletion logic
    // For now, just log it
    console.log(`🗑️ User ${id} deleted from Clerk`);
    return new Response("OK", { status: 200 });
  }

  console.log(`✅ Webhook ${eventType} processed successfully`);
  return new Response("OK", { status: 200 });
}
