/**
 * Stripe Checkout Route Handler
 * Requirements: 
 * - 18.1: Create Stripe Checkout session for product purchase
 * - R-CHECKOUT-CONNECT-1: Route payment to artist's Stripe Connect account
 * - R-CHECKOUT-CONNECT-2: No platform commission (application_fee_amount = 0)
 * - R-CHECKOUT-CONNECT-4: Return error if artist not connected
 *
 * This route creates a Stripe Checkout session for purchasing digital products.
 * Payments are routed directly to the artist's Stripe Connect account using
 * destination charges. The platform takes no commission on sales (revenue comes
 * from artist subscriptions via Clerk Billing).
 *
 * It includes metadata (fanUserId, productId, artistId) that will be used by 
 * the webhook to create the order after successful payment.
 */

import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout session for a product purchase.
 *
 * Request body:
 * - productId: Convex ID of the product to purchase
 *
 * Returns:
 * - url: Stripe Checkout session URL to redirect the user to
 *
 * Metadata included in session:
 * - fanUserId: Convex user ID of the purchaser
 * - productId: Convex product ID being purchased
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verify authentication
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // 3. Get user from Convex
    const user = await fetchQuery(api.users.getByClerkId, {
      clerkUserId,
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Verify user is a fan
    if (user.role !== "fan") {
      return NextResponse.json(
        { error: "Only fans can purchase products" },
        { status: 403 }
      );
    }

    // 4. Get product details from Convex
    const product = await fetchQuery(api.products.getById, {
      productId: productId as Id<"products">,
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Verify product is public
    if (product.visibility !== "public") {
      return NextResponse.json(
        { error: "Product is not available for purchase" },
        { status: 403 }
      );
    }

    // 5. Get artist details and verify Stripe Connect status
    // Requirements: R-CHECKOUT-CONNECT-1, R-CHECKOUT-CONNECT-4
    const artist = await fetchQuery(api.artists.getById, {
      artistId: product.artistId,
    });

    if (!artist) {
      return NextResponse.json(
        { error: "Artist not found" },
        { status: 404 }
      );
    }

    // Verify artist has connected Stripe account
    if (!artist.stripeConnectAccountId || artist.connectStatus !== "connected") {
      return NextResponse.json(
        { 
          error: "This artist has not set up payments yet. Please try again later or contact the artist.",
          details: "Artist must complete Stripe Connect onboarding to accept payments"
        },
        { status: 400 }
      );
    }

    // 6. Create Stripe Checkout session
    // Requirements: R-CHECKOUT-CONNECT-1, R-CHECKOUT-CONNECT-2
    // Route payment to artist's Stripe Connect account with no platform commission
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.title,
              description: product.description || undefined,
              images: product.coverImageUrl ? [product.coverImageUrl] : undefined,
            },
            unit_amount: Math.round(product.priceUSD * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      // Route payment to artist's Stripe Connect account (destination charges)
      payment_intent_data: {
        transfer_data: {
          destination: artist.stripeConnectAccountId,
        },
        // No platform commission (platform revenue comes from artist subscriptions)
        application_fee_amount: 0,
      },
      metadata: {
        fanUserId: user._id,
        productId: product._id,
        artistId: artist._id,
      },
      success_url: `${process.env.NEXT_PUBLIC_URL || req.nextUrl.origin}/me/${user.usernameSlug}/purchases?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || req.nextUrl.origin}/me/${user.usernameSlug}/purchases?canceled=true`,
    });

    // 7. Return checkout URL
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
