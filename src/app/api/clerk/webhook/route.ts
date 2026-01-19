import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { WebhookEvent } from "@clerk/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { headers } from "next/headers";
// @ts-ignore - svix types issue
import { Webhook } from "svix";

/**
 * Verify webhook signature using Svix headers
 */
async function verifyWebhook(req: Request): Promise<WebhookEvent | Response> {
  const headerPayload = headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("❌ Missing svix headers");
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  if (!process.env.CLERK_WEBHOOK_SECRET) {
    console.error("❌ CLERK_WEBHOOK_SECRET not configured");
    return new Response("Error: Webhook secret not configured", { status: 500 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

  try {
    return wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("❌ Error verifying webhook:", err);
    return new Response("Error: Verification failed", { status: 400 });
  }
}

/**
 * Handle user created/updated events
 */
async function handleUserUpsert(evt: WebhookEvent): Promise<Response> {
  const data = evt.data as any;
  const { id, first_name, last_name, username, image_url, public_metadata } = data;
  const role = public_metadata?.role as "artist" | "fan" | undefined;

  if (!role) {
    console.log(`⏭️ Skipping sync for user ${id} - no role assigned yet`);
    return new Response("OK - No role assigned", { status: 200 });
  }

  try {
    const userId = await fetchMutation(api.users.upsertFromClerk, {
      clerkUserId: id,
      role,
      displayName: `${first_name || ""} ${last_name || ""}`.trim() || username || id,
      usernameSlug: username || id,
      avatarUrl: image_url,
    });

    console.log(`✅ User ${id} synced to Convex via webhook`);

    if (role === "artist") {
      await createArtistProfile(userId, id);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("❌ Failed to sync user to Convex:", error);
    return new Response("Error: Sync failed", { status: 500 });
  }
}

/**
 * Create artist profile (non-blocking)
 */
async function createArtistProfile(userId: Id<"users">, clerkUserId: string): Promise<void> {
  try {
    await fetchMutation(api.artists.createFromWebhook, { userId });
    console.log(`✅ Artist profile created for user ${clerkUserId}`);
  } catch (artistError) {
    console.log(`ℹ️ Artist profile creation skipped for user ${clerkUserId}:`, artistError);
  }
}

/**
 * Handle user deleted events
 */
async function handleUserDeletion(evt: WebhookEvent): Promise<Response> {
  const data = evt.data as any;
  const id = data.id;

  if (!id) {
    console.error("❌ Missing user ID in deletion event");
    return new Response("Error: Missing user ID", { status: 400 });
  }

  try {
    await fetchMutation(api.users.deleteByClerkId, { clerkUserId: id });
    console.log(`✅ User ${id} and all associated data deleted from Convex`);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("❌ Failed to delete user from Convex:", error);
    return new Response("Error: Deletion failed", { status: 500 });
  }
}

export async function POST(req: Request) {
  const evt = await verifyWebhook(req);

  if (evt instanceof Response) {
    return evt;
  }

  const eventType = evt.type;
  console.log(`📥 Received Clerk webhook: ${eventType}`);

  if (eventType === "user.created" || eventType === "user.updated") {
    return handleUserUpsert(evt);
  }

  if (eventType === "user.deleted") {
    return handleUserDeletion(evt);
  }

  console.log(`✅ Webhook ${eventType} processed successfully`);
  return new Response("OK", { status: 200 });
}
