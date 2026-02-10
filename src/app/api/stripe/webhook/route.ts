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

// Lazy initialization of Stripe (avoid build-time errors)
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-12-15.clover" as any,
  });
}

// Webhook secret for signature verification
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Verify Stripe webhook signature
 */
async function verifyWebhookSignature(
  req: NextRequest
): Promise<{ event: Stripe.Event; body: string } | NextResponse> {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    console.error("Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    return { event, body };
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { 
        error: `Webhook signature verification failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }` 
      },
      { status: 400 }
    );
  }
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutCompleted(event: Stripe.Event): Promise<NextResponse> {
  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = session.metadata;

  if (!metadata?.fanUserId || !metadata?.productId) {
    console.error("Missing required metadata in checkout session");
    return NextResponse.json(
      { error: "Missing required metadata: fanUserId and productId" },
      { status: 400 }
    );
  }

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
      { 
        error: `Failed to process webhook: ${
          convexError instanceof Error ? convexError.message : "Unknown error"
        }` 
      },
      { status: 500 }
    );
  }
}

/**
 * Handle payment method events
 * Requirements: R-FAN-PM-4.1, R-FAN-PM-4.2, R-FAN-PM-4.3, R-FAN-PM-4.4
 */
async function handlePaymentMethodEvent(event: Stripe.Event): Promise<NextResponse> {
  try {
    const result = await fetchAction(api.stripe.handlePaymentMethodWebhook, {
      eventId: event.id,
      eventType: event.type,
      eventData: event.data.object,
    });

    console.log("Payment method webhook processed successfully:", result);
    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (convexError) {
    console.error("Payment method webhook failed:", convexError);
    return NextResponse.json(
      { 
        error: `Failed to process payment method webhook: ${
          convexError instanceof Error ? convexError.message : "Unknown error"
        }` 
      },
      { status: 500 }
    );
  }
}

/**
 * Handle Stripe Connect account.updated event
 * Requirements: R-ART-CONNECT-3 - Update connect status from account.updated webhook
 */
async function handleConnectAccountUpdated(event: Stripe.Event): Promise<NextResponse> {
  const account = event.data.object as Stripe.Account;
  const chargesEnabled = account.charges_enabled || false;
  const payoutsEnabled = account.payouts_enabled || false;
  const requirementsDue = account.requirements?.currently_due || [];

  console.log(
    "Processing account.updated event:",
    account.id,
    "Charges:",
    chargesEnabled,
    "Payouts:",
    payoutsEnabled,
    "Requirements:",
    requirementsDue
  );

  try {
    const result = await fetchAction(api.stripe.handleConnectAccountUpdated, {
      eventId: event.id,
      stripeConnectAccountId: account.id,
      chargesEnabled,
      payoutsEnabled,
      requirementsDue,
    });

    console.log("Connect account status updated successfully:", result);
    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (convexError) {
    console.error("Connect account webhook failed:", convexError);
    return NextResponse.json(
      { 
        error: `Failed to process Connect account webhook: ${
          convexError instanceof Error ? convexError.message : "Unknown error"
        }` 
      },
      { status: 500 }
    );
  }
}

/**
 * Handle balance.available event (optional - Palier B)
 * Requirements: R-ART-BAL-2 - Balance data from deterministic read-model
 */
async function handleBalanceAvailable(event: Stripe.Event): Promise<NextResponse> {
  const balance = event.data.object as Stripe.Balance;
  const usdAvailable = balance.available.find((b) => b.currency === "usd");
  const usdPending = balance.pending.find((b) => b.currency === "usd");

  if (!usdAvailable) {
    console.log("No USD balance found in balance.available event, skipping");
    return NextResponse.json({
      success: true,
      message: "No USD balance to sync",
    });
  }

  const stripeConnectAccountId = event.account;

  if (!stripeConnectAccountId) {
    console.error("Missing account ID in balance.available event");
    return NextResponse.json(
      { error: "Missing account ID in balance.available event" },
      { status: 400 }
    );
  }

  console.log(
    "Processing balance.available event:",
    stripeConnectAccountId,
    "Available:",
    usdAvailable.amount,
    "Pending:",
    usdPending?.amount || 0
  );

  try {
    const result = await fetchAction(api.stripe.handleBalanceAvailable, {
      eventId: event.id,
      stripeConnectAccountId,
      availableUSD: usdAvailable.amount,
      pendingUSD: usdPending?.amount || 0,
      currency: "usd",
    });

    console.log("Balance snapshot created successfully:", result);
    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (convexError) {
    console.error("Balance webhook failed:", convexError);
    return NextResponse.json(
      { 
        error: `Failed to process balance webhook: ${
          convexError instanceof Error ? convexError.message : "Unknown error"
        }` 
      },
      { status: 500 }
    );
  }
}

/**
 * Handle payout events (optional - Palier B)
 * Requirements: R-ART-BAL-3 - Payout history tracking
 */
async function handlePayoutEvent(event: Stripe.Event): Promise<NextResponse> {
  const payout = event.data.object as Stripe.Payout;

  console.log(
    "Processing payout event:",
    event.type,
    "Payout ID:",
    payout.id,
    "Amount:",
    payout.amount,
    "Status:",
    payout.status
  );

  try {
    const result = await fetchAction(api.stripe.handlePayoutWebhook, {
      eventId: event.id,
      eventType: event.type,
      payout: payout,
    });

    console.log("Payout webhook processed successfully:", result);
    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (convexError) {
    console.error("Payout webhook failed:", convexError);
    return NextResponse.json(
      { 
        error: `Failed to process payout webhook: ${
          convexError instanceof Error ? convexError.message : "Unknown error"
        }` 
      },
      { status: 500 }
    );
  }
}

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
 * - payment_method.*: Sync payment methods
 * - account.updated: Update Connect account status
 * - balance.available: Sync balance snapshots (Palier B)
 * - payout.*: Track payout history (Palier B)
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verify webhook signature
    const verificationResult = await verifyWebhookSignature(req);
    
    if (verificationResult instanceof NextResponse) {
      return verificationResult;
    }

    const { event } = verificationResult;
    console.log(`Received Stripe event: ${event.type} (${event.id})`);

    // 2. Route to appropriate handler based on event type
    switch (event.type) {
      case "checkout.session.completed":
        return handleCheckoutCompleted(event);

      case "setup_intent.succeeded":
      case "payment_method.attached":
      case "payment_method.detached":
      case "customer.updated":
        return handlePaymentMethodEvent(event);

      case "account.updated":
        return handleConnectAccountUpdated(event);

      case "balance.available":
        return handleBalanceAvailable(event);

      case "payout.paid":
      case "payout.failed":
      case "payout.canceled":
        return handlePayoutEvent(event);

      default:
        console.log(`Event type ${event.type} not handled, acknowledging`);
        return NextResponse.json({
          success: true,
          message: `Event type ${event.type} acknowledged but not handled`,
        });
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
