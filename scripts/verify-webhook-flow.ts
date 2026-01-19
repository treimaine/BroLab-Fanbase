/**
 * Manual Verification Script for Webhook Flow
 * Requirements: R-CHECKOUT-CONNECT-3
 * 
 * This script verifies that the checkout.session.completed webhook
 * still creates orders and grants entitlements after Stripe Connect changes.
 * 
 * Usage:
 * 1. Ensure Convex dev is running: npx convex dev
 * 2. Run: npx tsx scripts/verify-webhook-flow.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Error: CONVEX_URL not found in environment variables");
  console.error("Please set NEXT_PUBLIC_CONVEX_URL or CONVEX_URL");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function main() {
  console.log("=== Webhook Flow Verification Script ===\n");
  console.log(`Convex URL: ${CONVEX_URL}\n`);

  // Step 1: Get a test user and product
  console.log("[Step 1] Finding test data...");
  
  // You need to replace these with actual IDs from your database
  // You can find these by running: npx convex dashboard
  const TEST_FAN_USER_ID = process.env.TEST_FAN_USER_ID;
  const TEST_PRODUCT_ID = process.env.TEST_PRODUCT_ID;

  if (!TEST_FAN_USER_ID || !TEST_PRODUCT_ID) {
    console.error("\n❌ Error: Test data not configured");
    console.error("\nPlease set environment variables:");
    console.error("  TEST_FAN_USER_ID=<user_id>");
    console.error("  TEST_PRODUCT_ID=<product_id>");
    console.error("\nYou can find these IDs in the Convex dashboard:");
    console.error("  npx convex dashboard");
    process.exit(1);
  }

  console.log(`✓ Fan User ID: ${TEST_FAN_USER_ID}`);
  console.log(`✓ Product ID: ${TEST_PRODUCT_ID}`);

  // Step 2: Run the test
  console.log("\n[Step 2] Running webhook flow test...\n");
  
  try {
    const result = await client.action(api.test_webhook_flow.testWebhookFlow, {
      fanUserId: TEST_FAN_USER_ID as any,
      productId: TEST_PRODUCT_ID as any,
    });

    console.log("\n✅ VERIFICATION PASSED");
    console.log("\nResults:");
    console.log(`  Order ID: ${result.orderId}`);
    console.log(`  Order Status: ${result.orderStatus}`);
    console.log(`  Order Total: $${result.orderTotal}`);
    console.log(`  Order Items: ${result.orderItemsCount}`);
    console.log(`  File Storage ID: ${result.fileStorageId}`);
    console.log(`  Event Processed: ${result.eventProcessed}`);
    console.log(`\n${result.message}`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ VERIFICATION FAILED");
    console.error("\nError:", error);
    process.exit(1);
  }
}

// Use top-level await instead of calling async function
await main();
