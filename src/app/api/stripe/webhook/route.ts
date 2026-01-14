/**
 * Stripe Webhook Route Handler
 * Requirements: 18.2, 18.5 - Process Stripe webhooks with signature verification
 *
 * This route receives Stripe webhook events, verifies the signature,
 * and forwards valid events to the Convex action for processing.
 *
 * Security:
 * - Verifies Stripe signature to ensure webhook authenticity
 * - Only processes events from Stripe's servers
 *
 * Idempotency:
 * - Handled by Convex action (checks processedEvents table)
 * - Safe to retry failed webhooks
 */

import { api } from "@/../convex/_generated/api";
import { fetchAction } from "convex/nextjs";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Webhook secret for signature verification
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * POST /api/stripe/webhook
 *
 * Receives and processes Stripe webhook events.
 *
 * Flow:
 * 1. Verify Stripe signature (security)
 * 2. Extract event data
 * 3. Forward to Convex action for processing
 * 4. Return 200 on success, 400 on error
 *
 * Supported events:
 * - checkout.session.completed: Create order after successful payment
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Get raw body and signature
    const body = await req.text();
    const signature = headers().get("stripe-signature");

    if (!signature) {
      console.error("Missing stripe-signature header");
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // 2. Verify webhook signature
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err instanceof Error ? err.message : "Unknown error"}` },
        { status: 400 }
      );
    }

    console.log(`Received Stripe event: ${event.type} (${event.id})`);

    // 3. Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Extract metadata
      const metadata = session.metadata;

      if (!metadata?.fanUserId || !metadata?.productId) {
        console.error("Missing required metadata in checkout session");
        return NextResponse.json(
          { error: "Missing required metadata: fanUserId and productId" },
          { status: 400 }
        );
      }

      // Forward to Convex action for processing
      try {
        const result = await fetchAction(api.stripe.handleWebhook, {
          eventId: event.id,
          eventType: event.type,
          sessionId: session.id,
          metadata: {
            fanUserId: metadata.fanUserId,
            productId: metadata.productId,
          },
          amountTotal: session.amount_total || 0,
          currency: session.currency || "usd",
        });

        console.log("Webhook processed successfully:", result);

        return NextResponse.json({
          success: true,
          message: result.message,
        });
      } catch (convexError) {
        console.error("Convex action failed:", convexError);
        return NextResponse.json(
          { error: `Failed to process webhook: ${convexError instanceof Error ? convexError.message : "Unknown error"}` },
          { status: 500 }
        );
      }
    }

    // 4. Acknowledge other event types (not handled)
    console.log(`Event type ${event.type} not handled, acknowledging`);
    return NextResponse.json({
      success: true,
      message: `Event type ${event.type} acknowledged but not handled`,
    });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
