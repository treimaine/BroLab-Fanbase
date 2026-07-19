import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { GENERIC_ERROR_MESSAGES, logSecurityEvent } from "@/lib/security-logger";
import { WebhookEvent } from "@clerk/nextjs/server";
import { fetchAction, fetchMutation } from "convex/nextjs";
import { headers } from "next/headers";
// @ts-ignore - svix types issue
import { Webhook } from "svix";

/**
 * Verify webhook signature using Svix headers
 */
async function verifyWebhook(req: Request): Promise<WebhookEvent | Response> {
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  if (!process.env.CLERK_WEBHOOK_SECRET) {
    
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
    // Log detailed error server-side
    await logSecurityEvent({
      type: "clerk_webhook_verification_failed",
      error: err,
      timestamp: Date.now(),
      metadata: {
        hasSvixId: !!svixId,
        hasSvixTimestamp: !!svixTimestamp,
        hasSvixSignature: !!svixSignature,
      },
    });

    // Return generic error to client
    return new Response(GENERIC_ERROR_MESSAGES.WEBHOOK_VERIFICATION_FAILED, { status: 400 });
  }
}

/**
 * Handle user created/updated events
 */
async function handleUserUpsert(evt: WebhookEvent): Promise<Response> {
  const data = evt.data as any;
  const { id, first_name, last_name, username, image_url, email_addresses, public_metadata } = data;
  
  
  
  
  
  const role = public_metadata?.role as "artist" | "fan" | undefined;

  // Skip if no role assigned yet (user hasn't completed onboarding)
  if (!role) {
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
    return new Response("OK - No email yet", { status: 200 });
  }

  

  try {
    const userId = await fetchMutation(api.users.upsertFromClerk, {
      clerkUserId: id,
      role,
      displayName: `${first_name || ""} ${last_name || ""}`.trim() || username || id,
      // Slug derivation happens server-side in Convex (username > displayName > id)
      username: username || undefined,
      avatarUrl: image_url,
      email: primaryEmail,
    });

    

    // Create Stripe customer for new users (non-blocking)
    try {
      await fetchAction(api.users.createStripeCustomer, {
        clerkUserId: id,
        email: primaryEmail,
      });
      
    } catch (stripeError) {
      // Log Stripe customer creation failure but don't fail the webhook
      await logSecurityEvent({
        type: "stripe_customer_creation_failed",
        error: stripeError,
        timestamp: Date.now(),
        metadata: {
          clerkUserId: id,
          email: primaryEmail,
        },
      });
      // Don't fail the webhook - user sync succeeded
    }

    if (role === "artist") {
      await createArtistProfile(userId, id);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    // Log detailed error server-side
    await logSecurityEvent({
      type: "clerk_user_sync_failed",
      error,
      timestamp: Date.now(),
      metadata: {
        clerkUserId: id,
        role,
        hasEmail: !!primaryEmail,
      },
    });

    // Return generic error to client
    return new Response(GENERIC_ERROR_MESSAGES.WEBHOOK_PROCESSING_FAILED, { status: 500 });
  }
}

/**
 * Create artist profile (non-blocking)
 */
async function createArtistProfile(userId: Id<"users">, clerkUserId: string): Promise<void> {
  try {
    await fetchMutation(api.artists.createFromWebhook, { userId });
    
  } catch (artistError) {
    // Log artist profile creation failure but don't fail the webhook
    await logSecurityEvent({
      type: "artist_profile_creation_failed",
      error: artistError,
      timestamp: Date.now(),
      metadata: {
        userId,
        clerkUserId,
      },
    });
  }
}

/**
 * Normalize a Clerk timestamp (seconds, milliseconds, or ISO string) to ms.
 */
function toMillis(value: unknown): number | undefined {
  if (typeof value === "number") {
    // Heuristic: values below ~1e12 are seconds, convert to ms.
    return value < 1e12 ? value * 1000 : value;
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

/**
 * Handle Clerk Billing subscription events.
 * Events: subscription.created | subscription.active | subscription.updated | subscription.pastDue
 *
 * Clerk Billing is the source of truth; here we mirror the current subscription
 * onto the Convex `users` row so server-side mutations can enforce plan limits.
 * The premium/free decision is made in Convex (comparing plan ids to
 * CLERK_PLAN_PREMIUM_ID); this handler only extracts and forwards the raw facts.
 */
async function handleSubscriptionEvent(
  evt: WebhookEvent,
  eventId: string
): Promise<Response> {
  const data = evt.data as any;

  // Payer's Clerk user id — tolerate the few shapes Clerk has shipped.
  const clerkUserId: string | undefined =
    data?.payer?.user_id ?? data?.user_id ?? data?.payer_id;

  if (!clerkUserId) {
    // Organization-payer subscriptions have no user_id; nothing to mirror.
    return new Response("OK - No user payer", { status: 200 });
  }

  // Active subscription items → their plan ids (cplan_...).
  const items: any[] = data?.subscription_items ?? data?.items ?? [];
  const activeItems = items.filter(
    (it) => it?.status === "active" || it?.status === "trialing"
  );
  const activePlanIds: string[] = activeItems
    .map((it) => it?.plan?.id ?? it?.plan_id)
    .filter((id: unknown): id is string => typeof id === "string");

  // Period end: prefer an active item's period_end, else the subscription's.
  const rawPeriodEnd =
    activeItems[0]?.period_end ??
    data?.next_payment?.date ??
    data?.current_period_end ??
    data?.period_end;
  const currentPeriodEnd = toMillis(rawPeriodEnd);

  try {
    await fetchMutation(api.users.updateSubscriptionFromClerk, {
      clerkUserId,
      activePlanIds,
      rawStatus: typeof data?.status === "string" ? data.status : undefined,
      currentPeriodEnd,
      eventId,
    });
    return new Response("OK", { status: 200 });
  } catch (error) {
    await logSecurityEvent({
      type: "clerk_subscription_sync_failed",
      error,
      timestamp: Date.now(),
      metadata: { clerkUserId, eventType: evt.type },
    });
    return new Response(GENERIC_ERROR_MESSAGES.WEBHOOK_PROCESSING_FAILED, {
      status: 500,
    });
  }
}

/**
 * Handle user deleted events
 */
async function handleUserDeletion(evt: WebhookEvent): Promise<Response> {
  const data = evt.data as any;
  const id = data.id;

  if (!id) {
    
    return new Response("Error: Missing user ID", { status: 400 });
  }

  try {
    await fetchMutation(api.users.deleteByClerkId, { clerkUserId: id });
    
    return new Response("OK", { status: 200 });
  } catch (error) {
    // Log detailed error server-side
    await logSecurityEvent({
      type: "clerk_user_deletion_failed",
      error,
      timestamp: Date.now(),
      metadata: {
        clerkUserId: id,
      },
    });

    // Return generic error to client
    return new Response(GENERIC_ERROR_MESSAGES.WEBHOOK_PROCESSING_FAILED, { status: 500 });
  }
}

export async function POST(req: Request) {
  const evt = await verifyWebhook(req);

  if (evt instanceof Response) {
    return evt;
  }

  // Cast to string: Clerk's WebhookEvent union may not include Billing events.
  const eventType: string = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    return handleUserUpsert(evt);
  }

  if (eventType === "user.deleted") {
    return handleUserDeletion(evt);
  }

  // Clerk Billing subscription lifecycle → mirror plan onto Convex users row.
  if (
    eventType === "subscription.created" ||
    eventType === "subscription.active" ||
    eventType === "subscription.updated" ||
    eventType === "subscription.pastDue"
  ) {
    // svix-id is the unique webhook message id — use it for idempotency.
    const eventId = (await headers()).get("svix-id") ?? `${eventType}-${Date.now()}`;
    return handleSubscriptionEvent(evt, eventId);
  }

  return new Response("OK", { status: 200 });
}
