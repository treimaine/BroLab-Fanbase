import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { WebhookEvent } from "@clerk/nextjs/server";
import { fetchAction, fetchMutation } from "convex/nextjs";
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
  const { id, first_name, last_name, username, image_url, email_addresses, public_metadata } = data;
  
  console.log(`📥 Processing user event for ${id}`);
  console.log(`   Role: ${public_metadata?.role || 'none'}`);
  console.log(`   Email addresses count: ${email_addresses?.length || 0}`);
  
  const role = public_metadata?.role as "artist" | "fan" | undefined;

  // Skip if no role assigned yet (user hasn't completed onboarding)
  if (!role) {
    console.log(`⏭️ Skipping sync for user ${id} - no role assigned yet (will sync after onboarding)`);
    return new Response("OK - No role assigned", { status: 200 });
  }

  // Extract primary email - handle multiple formats
  let primaryEmail: string | undefined;
  
  if (email_addresses && Array.isArray(email_addresses) && email_addresses.length > 0) {
    // Try to find primary email
    const primaryEmailObj = email_addresses.find((e: any) => e.id === data.primary_email_address_id);
    primaryEmail = primaryEmailObj?.email_address;
    
    // Fallback to first email if primary not found
    if (!primaryEmail) {
      primaryEmail = email_addresses[0]?.email_address;
    }
  }
  
  // If no email in webhook, skip for now (will sync when email is added)
  if (!primaryEmail) {
    console.log(`⏭️ Skipping sync for user ${id} - no email address yet (will sync when email is added)`);
    return new Response("OK - No email yet", { status: 200 });
  }

  console.log(`   Using email: ${primaryEmail}`);

  try {
    const userId = await fetchMutation(api.users.upsertFromClerk, {
      clerkUserId: id,
      role,
      displayName: `${first_name || ""} ${last_name || ""}`.trim() || username || id,
      usernameSlug: username || id,
      avatarUrl: image_url,
      email: primaryEmail,
    });

    console.log(`✅ User ${id} synced to Convex via webhook`);

    // Create Stripe customer for new users (non-blocking)
    try {
      await fetchAction(api.users.createStripeCustomer, {
        clerkUserId: id,
        email: primaryEmail,
      });
      console.log(`✅ Stripe customer created for user ${id}`);
    } catch (stripeError) {
      console.error(`⚠️ Failed to create Stripe customer for user ${id}:`, stripeError);
      // Don't fail the webhook - user sync succeeded
    }

    if (role === "artist") {
      await createArtistProfile(userId, id);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("❌ Failed to sync user to Convex:", error);
    console.error("   Error details:", error instanceof Error ? error.message : String(error));
    return new Response(`Error: Sync failed - ${error instanceof Error ? error.message : String(error)}`, { status: 500 });
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
