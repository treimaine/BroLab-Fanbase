/**
 * Script to manually sync Stripe Connect account status to Convex
 * Usage: npx tsx scripts/sync-stripe-connect-status.ts <stripeConnectAccountId>
 */

import { ConvexHttpClient } from "convex/browser";
import Stripe from "stripe";
import { api } from "../convex/_generated/api";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function syncConnectStatus(accountId: string) {
  console.log(`Fetching Stripe Connect account: ${accountId}`);
  
  // Fetch account from Stripe
  const account = await stripe.accounts.retrieve(accountId);
  
  console.log("Account details:");
  console.log("- charges_enabled:", account.charges_enabled);
  console.log("- payouts_enabled:", account.payouts_enabled);
  console.log("- requirements.currently_due:", account.requirements?.currently_due);
  
  // Sync to Convex
  console.log("\nSyncing to Convex...");
  
  const result = await convex.action(api.stripe.handleConnectAccountUpdated, {
    eventId: `manual_sync_${Date.now()}`,
    stripeConnectAccountId: accountId,
    chargesEnabled: account.charges_enabled || false,
    payoutsEnabled: account.payouts_enabled || false,
    requirementsDue: account.requirements?.currently_due || [],
  });
  
  console.log("✅ Sync complete:", result);
}

// Get account ID from command line
const accountId = process.argv[2];

if (!accountId) {
  console.error("Usage: npx tsx scripts/sync-stripe-connect-status.ts <stripeConnectAccountId>");
  process.exit(1);
}

syncConnectStatus(accountId).catch((error) => {
  console.error("❌ Sync failed:", error);
  process.exit(1);
});
