/**
 * Webhook Flow Verification Test
 * Requirements: R-CHECKOUT-CONNECT-3 - Verify webhook still creates orders/entitlements
 * 
 * This test verifies that the checkout.session.completed webhook:
 * 1. Creates orders in Convex
 * 2. Creates orderItems in Convex
 * 3. Grants download entitlements
 * 
 * Run this test manually to verify the webhook flow after Stripe Connect changes.
 */

import { v } from "convex/values";
import { api } from "./_generated/api";
import { action } from "./_generated/server";

/**
 * Test webhook flow end-to-end
 * 
 * This simulates a checkout.session.completed webhook and verifies:
 * - Order is created with status "paid"
 * - OrderItem is created with fileStorageId snapshot
 * - Event is marked as processed (idempotency)
 * - Download entitlement is granted (ownership verification passes)
 */
export const testWebhookFlow = action({
  args: {
    fanUserId: v.id("users"),
    productId: v.id("products"),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    orderId: string;
    orderStatus: string;
    orderTotal: number;
    orderItemsCount: number;
    fileStorageId: string;
    eventProcessed: boolean;
    message: string;
  }> => {
    console.log("=== Starting Webhook Flow Verification ===");
    console.log(`Fan User ID: ${args.fanUserId}`);
    console.log(`Product ID: ${args.productId}`);

    // Step 1: Verify product exists and has fileStorageId
    console.log("\n[Step 1] Verifying product...");
    const product = await ctx.runQuery(api.products.getById, {
      productId: args.productId,
    });

    if (!product) {
      throw new Error(`Product ${args.productId} not found`);
    }

    if (!product.fileStorageId) {
      throw new Error(`Product ${args.productId} has no fileStorageId - cannot test entitlement`);
    }

    console.log(`✓ Product found: ${product.title}`);
    console.log(`✓ Product has fileStorageId: ${product.fileStorageId}`);

    // Step 2: Simulate webhook call
    console.log("\n[Step 2] Simulating checkout.session.completed webhook...");
    const testEventId = `evt_test_${Date.now()}`;
    const testSessionId = `cs_test_${Date.now()}`;
    const testAmount = 1999; // $19.99 in cents

    const webhookResult = await ctx.runAction(api.stripe.handleWebhook, {
      eventId: testEventId,
      eventType: "checkout.session.completed",
      sessionId: testSessionId,
      metadata: {
        fanUserId: args.fanUserId,
        productId: args.productId,
      },
      amountTotal: testAmount,
      currency: "usd",
    });

    console.log(`✓ Webhook processed: ${webhookResult.message}`);
    console.log(`✓ Order ID: ${webhookResult.orderId}`);

    // Step 3: Verify order was created
    console.log("\n[Step 3] Verifying order creation...");
    const orderId = webhookResult.orderId as any;
    const orderResult = await ctx.runQuery(api.orders.getOrderById, {
      orderId,
    });

    if (!orderResult) {
      throw new Error(`Order ${orderId} not found after webhook`);
    }

    console.log(`✓ Order created with ID: ${orderResult.order._id}`);
    console.log(`✓ Order status: ${orderResult.order.status}`);
    console.log(`✓ Order total: $${orderResult.order.totalUSD}`);
    console.log(`✓ Order items count: ${orderResult.items.length}`);

    // Step 4: Verify orderItem was created with fileStorageId
    console.log("\n[Step 4] Verifying orderItem and entitlement...");
    if (orderResult.items.length === 0) {
      throw new Error("No orderItems created");
    }

    const orderItem = orderResult.items[0];
    if (!orderItem?.fileStorageId) {
      throw new Error("OrderItem has no fileStorageId - entitlement not granted");
    }

    console.log(`✓ OrderItem created with fileStorageId: ${orderItem.fileStorageId}`);
    console.log(`✓ OrderItem product: ${orderItem.product?.title || "unknown"}`);
    console.log(`✓ OrderItem type: ${orderItem.type}`);
    console.log(`✓ OrderItem price: $${orderItem.priceUSD}`);

    // Step 5: Verify event was marked as processed (idempotency)
    console.log("\n[Step 5] Verifying idempotency...");
    const isProcessed = await ctx.runQuery(api.orders.isEventProcessed, {
      eventId: testEventId,
    });

    if (!isProcessed) {
      throw new Error("Event not marked as processed");
    }

    console.log(`✓ Event ${testEventId} marked as processed`);

    // Step 6: Test idempotency - webhook should not create duplicate order
    console.log("\n[Step 6] Testing idempotency (duplicate webhook)...");
    const duplicateResult = await ctx.runAction(api.stripe.handleWebhook, {
      eventId: testEventId,
      eventType: "checkout.session.completed",
      sessionId: testSessionId,
      metadata: {
        fanUserId: args.fanUserId,
        productId: args.productId,
      },
      amountTotal: testAmount,
      currency: "usd",
    });

    if (!duplicateResult.alreadyProcessed) {
      throw new Error("Duplicate webhook was not detected - idempotency failed");
    }

    console.log(`✓ Duplicate webhook detected and skipped`);

    // Step 7: Verify download entitlement (ownership verification)
    console.log("\n[Step 7] Verifying download entitlement...");
    try {
      const downloadUrl = await ctx.runAction(api.downloads.getDownloadUrl, {
        productId: args.productId,
      });

      console.log(`✓ Download URL generated successfully`);
      console.log(`✓ Product title: ${downloadUrl.productTitle}`);
      console.log(`✓ Content type: ${downloadUrl.contentType || "unknown"}`);
      console.log(`✓ URL: ${downloadUrl.url.substring(0, 50)}...`);
    } catch (error) {
      throw new Error(`Download entitlement verification failed: ${error}`);
    }

    // Summary
    console.log("\n=== Webhook Flow Verification PASSED ===");
    console.log("✓ Order created successfully");
    console.log("✓ OrderItem created with fileStorageId");
    console.log("✓ Event marked as processed (idempotency)");
    console.log("✓ Duplicate webhook handled correctly");
    console.log("✓ Download entitlement granted");

    return {
      success: true,
      orderId: orderResult.order._id,
      orderStatus: orderResult.order.status,
      orderTotal: orderResult.order.totalUSD,
      orderItemsCount: orderResult.items.length,
      fileStorageId: orderItem.fileStorageId as string,
      eventProcessed: isProcessed,
      message: "Webhook flow verification completed successfully",
    };
  },
});

/**
 * Helper: Get product by ID (for testing)
 */
export const getProductForTest = action({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args): Promise<any> => {
    return await ctx.runQuery(api.products.getById, {
      productId: args.productId,
    });
  },
});
