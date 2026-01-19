/**
 * Stripe Integration (Convex Actions)
 * Requirements: 18.2, 18.3, 18.4, 18.5, R-FAN-PM-1.2, R-FAN-PM-1.3, R-FAN-PM-2.1
 * 
 * Handles Stripe operations:
 * - Customer management (ensureCustomerForCurrentUser)
 * - SetupIntent creation for payment methods (createSetupIntent)
 * - Webhook event processing (handleWebhook)
 * 
 * Implements idempotency to prevent duplicate operations.
 */

import { v } from "convex/values";
import Stripe from "stripe";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { action, internalMutation, internalQuery } from "./_generated/server";

/**
 * Get Stripe client instance
 * Lazy initialization to avoid errors during Convex deployment analysis
 */
function getStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "Stripe is not configured. Please set STRIPE_SECRET_KEY in your Convex environment variables."
    );
  }
  
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-12-15.clover",
  });
}

/**
 * Internal helper: Get user by Clerk ID
 * Used by actions to fetch user data
 */
export const getUserByClerkId = internalQuery({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();
    
    return user;
  },
});

/**
 * Internal mutation: Update user's Stripe customer ID
 * Requirements: R-FAN-PM-1.2 - Store stripeCustomerId in Convex
 * 
 * Called by ensureCustomerForCurrentUser after creating a Stripe customer.
 * 
 * @param userId - Convex user ID
 * @param stripeCustomerId - Stripe customer ID
 */
export const updateUserStripeCustomerId = internalMutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      stripeCustomerId: args.stripeCustomerId,
    });
  },
});

/**
 * Ensure Stripe customer exists for current user
 * Requirements: R-FAN-PM-1.2, R-FAN-PM-1.3 - Stripe customer binding
 * 
 * Idempotent action that:
 * 1. Checks if user already has a stripeCustomerId
 * 2. If not, creates a Stripe customer with email + metadata
 * 3. Stores stripeCustomerId in Convex via internal mutation
 * 4. Returns { stripeCustomerId }
 * 
 * Metadata includes:
 * - convexUserId: For traceability
 * - clerkUserId: For cross-reference with Clerk
 * 
 * @returns Object with stripeCustomerId
 */
export const ensureCustomerForCurrentUser = action({
  args: {},
  handler: async (ctx): Promise<{ stripeCustomerId: string }> => {
    // Get authenticated user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from Convex
    const user = await ctx.runQuery(internal.stripe.getUserByClerkId, {
      clerkUserId: identity.subject,
    });

    if (!user) {
      console.error("User not found for Clerk ID:", identity.subject);
      throw new Error("User not found");
    }

    console.log("User found:", user._id, "Email:", identity.email, "Existing customer:", user.stripeCustomerId);

    // If user already has a Stripe customer ID, return it (idempotent)
    if (user.stripeCustomerId) {
      console.log("Returning existing Stripe customer:", user.stripeCustomerId);
      return { stripeCustomerId: user.stripeCustomerId };
    }

    // Create Stripe customer with email and metadata
    // Requirements: R-FAN-PM-1.3 - Customer created with email and metadata
    console.log("Creating new Stripe customer for user:", user._id);
    const stripe = getStripeClient();
    const customer = await stripe.customers.create({
      email: identity.email,
      metadata: {
        convexUserId: user._id,
        clerkUserId: identity.subject,
      },
    });

    console.log("Stripe customer created:", customer.id);

    // Store stripeCustomerId in Convex
    await ctx.runMutation(internal.stripe.updateUserStripeCustomerId, {
      userId: user._id,
      stripeCustomerId: customer.id,
    });

    console.log("Stripe customer ID saved to Convex");

    return { stripeCustomerId: customer.id };
  },
});

/**
 * Create Stripe Setup Intent for adding payment method
 * Requirements: R-FAN-PM-2.1 - SetupIntent creation
 * 
 * Creates a Stripe Setup Intent that allows users to save payment methods
 * for future purchases without charging them immediately.
 * 
 * Flow:
 * 1. Ensure Stripe customer exists (call ensureCustomerForCurrentUser)
 * 2. Create SetupIntent with customer, payment_method_types, usage
 * 3. Return clientSecret for Stripe Elements
 * 
 * Note on local development webhooks:
 * - Stripe does NOT automatically send webhooks for test mode SetupIntents
 * - Use `stripe listen --forward-to http://localhost:PORT/api/stripe/webhook` for local testing
 * - In production, webhooks are sent automatically to the configured endpoint
 * 
 * @returns Object with clientSecret for Stripe Elements
 */
export const createSetupIntent = action({
  args: {},
  handler: async (ctx): Promise<{ clientSecret: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Validate Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("placeholder")) {
      throw new Error(
        "Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables."
      );
    }

    // Ensure customer exists (idempotent)
    // Requirements: R-FAN-PM-2.1 - Ensure customer before creating SetupIntent
    const result: { stripeCustomerId: string } = await ctx.runAction(
      api.stripe.ensureCustomerForCurrentUser
    );
    const stripeCustomerId: string = result.stripeCustomerId;

    // Validate customer ID before creating SetupIntent
    if (!stripeCustomerId || stripeCustomerId.trim() === "") {
      throw new Error(
        "Failed to create or retrieve Stripe customer ID. Please try again or contact support."
      );
    }

    console.log("Creating SetupIntent for customer:", stripeCustomerId);

    // Create SetupIntent with Stripe API
    // Requirements: R-FAN-PM-2.1 - SetupIntent with customer, payment_method_types, usage
    const stripe = getStripeClient();
    const setupIntent: Stripe.SetupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      usage: "off_session", // Allow charging without customer present
    });

    console.log("SetupIntent created:", setupIntent.id, "with customer:", setupIntent.customer);

    if (!setupIntent.client_secret) {
      throw new Error("Failed to create SetupIntent: no client_secret returned");
    }

    return {
      clientSecret: setupIntent.client_secret,
    };
  },
});

/**
 * Set default payment method for customer
 * Requirements: R-FAN-PM-5.1, R-FAN-PM-5.2 - Set default payment method
 * 
 * Updates the customer's default payment method in Stripe.
 * The webhook (customer.updated) will sync the change to Convex.
 * 
 * @param stripePaymentMethodId - Stripe payment method ID to set as default
 * @returns Success status
 */
export const setDefaultPaymentMethod = action({
  args: {
    stripePaymentMethodId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from Convex
    const user = await ctx.runQuery(internal.stripe.getUserByClerkId, {
      clerkUserId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.stripeCustomerId) {
      throw new Error("User does not have a Stripe customer ID");
    }

    // Update customer's default payment method in Stripe
    // Requirements: R-FAN-PM-5.2 - Call stripe.customers.update with invoice_settings
    const stripe = getStripeClient();
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: args.stripePaymentMethodId,
      },
    });

    // Return success - webhook will sync the change to Convex
    // Requirements: R-FAN-PM-5.3 - Webhook reflects change via customer.updated
    return { ok: true };
  },
});

/**
 * Detach payment method from customer
 * Requirements: R-FAN-PM-6.1, R-FAN-PM-6.2 - Detach payment method
 * 
 * Detaches a payment method from the customer in Stripe.
 * The webhook (payment_method.detached) will sync the change to Convex.
 * 
 * @param stripePaymentMethodId - Stripe payment method ID to detach
 * @returns Success status
 */
export const detachPaymentMethod = action({
  args: {
    stripePaymentMethodId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify user is authenticated
    const user = await ctx.runQuery(internal.stripe.getUserByClerkId, {
      clerkUserId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Detach payment method from customer in Stripe
    // Requirements: R-FAN-PM-6.2 - Call stripe.paymentMethods.detach
    const stripe = getStripeClient();
    await stripe.paymentMethods.detach(args.stripePaymentMethodId);

    // Return success - webhook will sync the change to Convex
    // Requirements: R-FAN-PM-6.3 - Webhook reflects change via payment_method.detached
    return { ok: true };
  },
});

/**
 * Remove payment method from Stripe (DEPRECATED - use detachPaymentMethod)
 * Requirements: 11.3 - Remove payment method
 * 
 * @deprecated Use detachPaymentMethod instead
 */
export const removePaymentMethod = action({
  args: {
    paymentMethodId: v.string(),
  },
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    // Delegate to detachPaymentMethod
    const result: { ok: boolean } = await ctx.runAction(api.stripe.detachPaymentMethod, {
      stripePaymentMethodId: args.paymentMethodId,
    });
    return result;
  },
});

/**
 * Handle Stripe webhook event
 * Requirements: 18.2, 18.3, 18.4, 18.5
 * 
 * This action is called by the Next.js webhook route after signature verification.
 * It processes checkout.session.completed events and creates orders with entitlements.
 * 
 * Idempotency:
 * - Checks if event has been processed before creating order
 * - Safe to retry failed webhooks
 * - Returns existing order if event already processed
 * 
 * Entitlements:
 * - Creates order with status "paid"
 * - Creates orderItem linking fan to product
 * - Grants permanent download access via fileStorageId snapshot
 * 
 * @param eventId - Stripe event ID (for idempotency)
 * @param eventType - Stripe event type (e.g., "checkout.session.completed")
 * @param sessionId - Stripe checkout session ID
 * @param metadata - Custom metadata from checkout session (fanUserId, productId)
 * @param amountTotal - Total amount in cents
 * @param currency - Currency code (e.g., "usd")
 * 
 * @returns Object with success status and orderId if created
 */
export const handleWebhook = action({
  args: {
    eventId: v.string(),
    eventType: v.string(),
    sessionId: v.string(),
    metadata: v.object({
      fanUserId: v.string(),
      productId: v.string(),
    }),
    amountTotal: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`Processing webhook event ${args.eventId} (${args.eventType})`);

    // Only handle checkout.session.completed events
    if (args.eventType !== "checkout.session.completed") {
      console.log(`Event type ${args.eventType} not handled by this handler`);
      return {
        success: true,
        message: `Event type ${args.eventType} not handled`,
      };
    }

    // Step 1: Check idempotency - has this event been processed?
    // Requirements: 18.5 - Webhook idempotency
    const existingEvent = await ctx.runQuery(api.orders.isEventProcessed, {
      eventId: args.eventId,
    });

    if (existingEvent) {
      console.log(`Event ${args.eventId} already processed, skipping order creation`);
      return {
        success: true,
        message: "Event already processed",
        alreadyProcessed: true,
      };
    }

    // Step 2: Extract and validate metadata
    const { fanUserId, productId } = args.metadata;

    if (!fanUserId || !productId) {
      const error = "Missing required metadata: fanUserId and productId are required";
      console.error(error);
      throw new Error(error);
    }

    console.log(`Creating order for fan ${fanUserId}, product ${productId}`);

    // Convert string IDs to Convex IDs
    const fanUserIdTyped = fanUserId as Id<"users">;
    const productIdTyped = productId as Id<"products">;

    // Convert amount from cents to dollars
    const totalUSD = args.amountTotal / 100;

    console.log(`Order total: $${totalUSD} ${args.currency.toUpperCase()}`);

    // Step 3: Create order + orderItems + mark event as processed
    // Requirements: 18.2, 18.3 - Create order and orderItems
    // Requirements: 17.3, 17.4 - Write entitlement/download permissions
    // This mutation is idempotent and handles all three operations atomically
    try {
      const orderId: Id<"orders"> = await ctx.runMutation(api.orders.createFromStripe, {
        fanUserId: fanUserIdTyped,
        stripeSessionId: args.sessionId,
        totalUSD,
        currency: args.currency,
        productId: productIdTyped,
        eventId: args.eventId,
      });

      console.log(`✅ Order ${orderId} created successfully for event ${args.eventId}`);
      console.log(`   Session: ${args.sessionId}`);
      console.log(`   Fan: ${fanUserId}`);
      console.log(`   Product: ${productId}`);
      console.log(`   Amount: $${totalUSD} ${args.currency.toUpperCase()}`);
      console.log(`   Download entitlement: GRANTED`);

      return {
        success: true,
        message: "Order created successfully with download entitlement",
        orderId: orderId as string,
      };
    } catch (error) {
      console.error(`Failed to create order for event ${args.eventId}:`, error);
      throw error;
    }
  },
});

/**
 * Internal query: Check if event has been processed (idempotency)
 * Requirements: R-FAN-PM-4.1 - Webhook idempotency
 */
export const isEventProcessed = internalQuery({
  args: {
    eventId: v.string(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("processedEvents")
      .withIndex("by_event", (q) => 
        q.eq("provider", "stripe").eq("eventId", args.eventId)
      )
      .unique();
    
    return event !== null;
  },
});

/**
 * Internal mutation: Mark event as processed
 * Requirements: R-FAN-PM-4.1 - Webhook idempotency
 */
export const markEventProcessed = internalMutation({
  args: {
    eventId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("processedEvents", {
      provider: "stripe",
      eventId: args.eventId,
      processedAt: Date.now(),
    });
  },
});

/**
 * Helper: Extract payment method data from Stripe PaymentMethod object
 * Requirements: R-FAN-PM-4.4 - Extract card data and billing details
 */
interface PaymentMethodData {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  billingName?: string;
  billingEmail?: string;
}

async function extractPaymentMethodData(
  paymentMethod: Stripe.PaymentMethod
): Promise<PaymentMethodData> {
  if (!paymentMethod.card) {
    throw new Error("Payment method is not a card");
  }

  return {
    brand: paymentMethod.card.brand,
    last4: paymentMethod.card.last4,
    expMonth: paymentMethod.card.exp_month,
    expYear: paymentMethod.card.exp_year,
    billingName: paymentMethod.billing_details.name || undefined,
    billingEmail: paymentMethod.billing_details.email || undefined,
  };
}

/**
 * Helper: Check if payment method is default for customer
 */
async function isDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<boolean> {
  const stripe = getStripeClient();
  const customer = await stripe.customers.retrieve(customerId);
  return (
    !customer.deleted &&
    customer.invoice_settings?.default_payment_method === paymentMethodId
  );
}

/**
 * Helper: Extract customer ID from Stripe object
 */
function extractCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer): string {
  return typeof customer === "string" ? customer : customer.id;
}

/**
 * Helper: Extract payment method ID from Stripe object
 */
function extractPaymentMethodId(
  paymentMethod: string | Stripe.PaymentMethod
): string {
  return typeof paymentMethod === "string" ? paymentMethod : paymentMethod.id;
}

/**
 * Handle setup_intent.succeeded event
 * Requirements: R-FAN-PM-4.2 - setup_intent.succeeded → sync payment method
 */
async function handleSetupIntentSucceeded(
  ctx: any,
  eventId: string,
  setupIntent: Stripe.SetupIntent
) {
  if (!setupIntent.payment_method || !setupIntent.customer) {
    throw new Error("Missing payment_method or customer in setup_intent.succeeded");
  }

  const paymentMethodId = extractPaymentMethodId(setupIntent.payment_method);
  const customerId = extractCustomerId(setupIntent.customer);

  // Fetch full payment method details from Stripe
  const stripe = getStripeClient();
  const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
  const paymentMethodData = await extractPaymentMethodData(paymentMethod);

  // Find Convex user by stripeCustomerId
  const user = await ctx.runQuery(internal.stripe.getUserByStripeCustomerId, {
    stripeCustomerId: customerId,
  });

  if (!user) {
    throw new Error(`User not found for Stripe customer ${customerId}`);
  }

  // Check if this is the default payment method
  const isDefault = await isDefaultPaymentMethod(customerId, paymentMethodId);

  // Sync payment method to Convex
  await ctx.runMutation(internal.paymentMethods.upsertFromStripe, {
    userId: user._id,
    stripeCustomerId: customerId,
    stripePaymentMethodId: paymentMethodId,
    ...paymentMethodData,
    isDefault,
  });

  await ctx.runMutation(internal.stripe.markEventProcessed, { eventId });

  return {
    success: true,
    message: "Payment method synced from setup_intent.succeeded",
  };
}

/**
 * Handle payment_method.attached event
 * Requirements: R-FAN-PM-4.2 - payment_method.attached → sync payment method (fallback)
 */
async function handlePaymentMethodAttached(
  ctx: any,
  eventId: string,
  paymentMethod: Stripe.PaymentMethod
) {
  if (!paymentMethod.customer) {
    throw new Error("Missing customer in payment_method.attached");
  }

  const customerId = extractCustomerId(paymentMethod.customer);
  const paymentMethodData = await extractPaymentMethodData(paymentMethod);

  // Find Convex user by stripeCustomerId
  const user = await ctx.runQuery(internal.stripe.getUserByStripeCustomerId, {
    stripeCustomerId: customerId,
  });

  if (!user) {
    throw new Error(`User not found for Stripe customer ${customerId}`);
  }

  // Check if this is the default payment method
  const isDefault = await isDefaultPaymentMethod(customerId, paymentMethod.id);

  // Sync payment method to Convex
  await ctx.runMutation(internal.paymentMethods.upsertFromStripe, {
    userId: user._id,
    stripeCustomerId: customerId,
    stripePaymentMethodId: paymentMethod.id,
    ...paymentMethodData,
    isDefault,
  });

  await ctx.runMutation(internal.stripe.markEventProcessed, { eventId });

  return {
    success: true,
    message: "Payment method synced from payment_method.attached",
  };
}

/**
 * Handle payment_method.detached event
 * Requirements: R-FAN-PM-4.2 - payment_method.detached → delete payment method
 */
async function handlePaymentMethodDetached(
  ctx: any,
  eventId: string,
  paymentMethod: Stripe.PaymentMethod
) {
  await ctx.runMutation(internal.paymentMethods.removeByStripePaymentMethodId, {
    stripePaymentMethodId: paymentMethod.id,
  });

  await ctx.runMutation(internal.stripe.markEventProcessed, { eventId });

  return {
    success: true,
    message: "Payment method removed from payment_method.detached",
  };
}

/**
 * Handle customer.updated event
 * Requirements: R-FAN-PM-4.2 - customer.updated → sync default payment method
 */
async function handleCustomerUpdated(
  ctx: any,
  eventId: string,
  customer: Stripe.Customer
) {
  const defaultPaymentMethodId = customer.invoice_settings?.default_payment_method;

  if (!defaultPaymentMethodId) {
    await ctx.runMutation(internal.stripe.markEventProcessed, { eventId });
    return {
      success: true,
      message: "No default payment method to sync",
    };
  }

  const paymentMethodIdString = extractPaymentMethodId(defaultPaymentMethodId);

  await ctx.runMutation(internal.paymentMethods.setDefaultByCustomer, {
    stripeCustomerId: customer.id,
    stripePaymentMethodId: paymentMethodIdString,
  });

  await ctx.runMutation(internal.stripe.markEventProcessed, { eventId });

  return {
    success: true,
    message: "Default payment method synced from customer.updated",
  };
}

/**
 * Handle Stripe payment method webhook events
 * Requirements: R-FAN-PM-4.1, R-FAN-PM-4.2, R-FAN-PM-4.3, R-FAN-PM-4.4
 * 
 * This action is called by the Next.js webhook route after signature verification.
 * It processes payment method events and syncs them to Convex.
 * 
 * Supported events:
 * - setup_intent.succeeded: Extract payment_method + customer, call upsertFromStripe
 * - payment_method.attached: Extract payment_method + customer, call upsertFromStripe
 * - payment_method.detached: Extract payment_method id, call removeByStripePaymentMethodId
 * - customer.updated: Extract invoice_settings.default_payment_method, call setDefaultByCustomer
 * 
 * @param eventId - Stripe event ID (for idempotency)
 * @param eventType - Stripe event type
 * @param eventData - Stripe event data object
 * 
 * @returns Object with success status and message
 */
export const handlePaymentMethodWebhook = action({
  args: {
    eventId: v.string(),
    eventType: v.string(),
    eventData: v.any(), // Stripe event data object (varies by event type)
  },
  handler: async (ctx, args) => {
    // Check idempotency - has this event been processed?
    const alreadyProcessed = await ctx.runQuery(internal.stripe.isEventProcessed, {
      eventId: args.eventId,
    });

    if (alreadyProcessed) {
      console.log(`Event ${args.eventId} already processed, skipping`);
      return {
        success: true,
        message: "Event already processed",
        alreadyProcessed: true,
      };
    }

    // Route to appropriate handler based on event type
    switch (args.eventType) {
      case "setup_intent.succeeded":
        return handleSetupIntentSucceeded(
          ctx,
          args.eventId,
          args.eventData as Stripe.SetupIntent
        );

      case "payment_method.attached":
        return handlePaymentMethodAttached(
          ctx,
          args.eventId,
          args.eventData as Stripe.PaymentMethod
        );

      case "payment_method.detached":
        return handlePaymentMethodDetached(
          ctx,
          args.eventId,
          args.eventData as Stripe.PaymentMethod
        );

      case "customer.updated":
        return handleCustomerUpdated(
          ctx,
          args.eventId,
          args.eventData as Stripe.Customer
        );

      default:
        throw new Error(`Unsupported payment method event type: ${args.eventType}`);
    }
  },
});

/**
 * Internal query: Get user by Stripe customer ID
 * Used by payment method webhook handlers
 */
export const getUserByStripeCustomerId = internalQuery({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("stripeCustomerId"), args.stripeCustomerId))
      .unique();
    
    return user;
  },
});

/**
 * Handle Stripe Connect account.updated webhook event
 * Requirements: R-ART-CONNECT-3 - Update connect status from account.updated webhook
 * 
 * This action is called by the Next.js webhook route after signature verification.
 * It processes account.updated events and syncs Connect account status to Convex.
 * 
 * Idempotency:
 * - Checks if event has been processed before updating status
 * - Safe to retry failed webhooks
 * 
 * Flow:
 * 1. Check idempotency (processedEvents table)
 * 2. Call internal mutation to update artist Connect status
 * 3. Mark event as processed
 * 
 * @param eventId - Stripe event ID (for idempotency)
 * @param stripeConnectAccountId - Stripe Connect account ID
 * @param chargesEnabled - Whether charges are enabled
 * @param payoutsEnabled - Whether payouts are enabled
 * @param requirementsDue - Array of requirements that need to be completed
 * 
 * @returns Object with success status and message
 */
export const handleConnectAccountUpdated = action({
  args: {
    eventId: v.string(),
    stripeConnectAccountId: v.string(),
    chargesEnabled: v.boolean(),
    payoutsEnabled: v.boolean(),
    requirementsDue: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    console.log(`Processing Connect account.updated event ${args.eventId}`);
    console.log(`Account: ${args.stripeConnectAccountId}`);
    console.log(`Charges enabled: ${args.chargesEnabled}`);
    console.log(`Payouts enabled: ${args.payoutsEnabled}`);
    console.log(`Requirements due: ${args.requirementsDue.join(", ") || "none"}`);

    // Step 1: Check idempotency - has this event been processed?
    // Requirements: R-ART-CONNECT-3 - Idempotency via processedEvents table
    const alreadyProcessed = await ctx.runQuery(internal.stripe.isEventProcessed, {
      eventId: args.eventId,
    });

    if (alreadyProcessed) {
      console.log(`Event ${args.eventId} already processed, skipping status update`);
      return {
        success: true,
        message: "Event already processed",
        alreadyProcessed: true,
      };
    }

    // Step 2: Update artist Connect status via internal mutation
    // Requirements: R-ART-CONNECT-3 - Call stripeConnect.updateAccountStatus
    try {
      await ctx.runMutation(internal.stripeConnect.updateAccountStatus, {
        stripeConnectAccountId: args.stripeConnectAccountId,
        chargesEnabled: args.chargesEnabled,
        payoutsEnabled: args.payoutsEnabled,
        requirementsDue: args.requirementsDue,
      });

      console.log(`✅ Connect account status updated for ${args.stripeConnectAccountId}`);
    } catch (error) {
      console.error(`Failed to update Connect account status:`, error);
      throw error;
    }

    // Step 3: Mark event as processed
    await ctx.runMutation(internal.stripe.markEventProcessed, {
      eventId: args.eventId,
    });

    console.log(`Event ${args.eventId} marked as processed`);

    return {
      success: true,
      message: "Connect account status updated successfully",
    };
  },
});

/**
 * Handle Stripe balance.available webhook event (optional - Palier B)
 * Requirements: R-ART-BAL-2 - Balance data from deterministic read-model
 * 
 * This action is called by the Next.js webhook route after signature verification.
 * It processes balance.available events and creates balance snapshots in Convex.
 * 
 * Idempotency:
 * - Checks if event has been processed before creating snapshot
 * - Safe to retry failed webhooks
 * 
 * Flow:
 * 1. Check idempotency (processedEvents table)
 * 2. Call internal mutation to upsert balance snapshot
 * 3. Mark event as processed
 * 
 * Note: This is optional for MVP (Palier B). For MVP (Palier A), balance can be
 * calculated from orders/orderItems.
 * 
 * @param eventId - Stripe event ID (for idempotency)
 * @param stripeConnectAccountId - Stripe Connect account ID
 * @param availableUSD - Available balance in USD cents
 * @param pendingUSD - Pending balance in USD cents
 * @param currency - Currency code (e.g., "usd")
 * 
 * @returns Object with success status and message
 */
export const handleBalanceAvailable = action({
  args: {
    eventId: v.string(),
    stripeConnectAccountId: v.string(),
    availableUSD: v.number(),
    pendingUSD: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`Processing balance.available event ${args.eventId}`);
    console.log(`Account: ${args.stripeConnectAccountId}`);
    console.log(`Available: ${args.availableUSD} cents`);
    console.log(`Pending: ${args.pendingUSD} cents`);
    console.log(`Currency: ${args.currency}`);

    // Step 1: Check idempotency - has this event been processed?
    const alreadyProcessed = await ctx.runQuery(internal.stripe.isEventProcessed, {
      eventId: args.eventId,
    });

    if (alreadyProcessed) {
      console.log(`Event ${args.eventId} already processed, skipping balance snapshot`);
      return {
        success: true,
        message: "Event already processed",
        alreadyProcessed: true,
      };
    }

    // Step 2: Upsert balance snapshot via internal mutation
    // Requirements: R-ART-BAL-2 - Call stripeConnect.upsertBalanceSnapshot
    try {
      await ctx.runMutation(internal.stripeConnect.upsertBalanceSnapshot, {
        stripeConnectAccountId: args.stripeConnectAccountId,
        availableUSD: args.availableUSD,
        pendingUSD: args.pendingUSD,
        currency: args.currency,
      });

      console.log(`✅ Balance snapshot created for ${args.stripeConnectAccountId}`);
    } catch (error) {
      console.error(`Failed to create balance snapshot:`, error);
      throw error;
    }

    // Step 3: Mark event as processed
    await ctx.runMutation(internal.stripe.markEventProcessed, {
      eventId: args.eventId,
    });

    console.log(`Event ${args.eventId} marked as processed`);

    return {
      success: true,
      message: "Balance snapshot created successfully",
    };
  },
});

/**
 * Handle Stripe payout webhook events (optional - Palier B)
 * Requirements: R-ART-BAL-3 - Payout history tracking
 * 
 * This action is called by the Next.js webhook route after signature verification.
 * It processes payout.* events and syncs payout history to Convex.
 * 
 * Supported events:
 * - payout.paid: Payout successfully sent to bank
 * - payout.failed: Payout failed
 * - payout.canceled: Payout was canceled
 * 
 * Idempotency:
 * - Checks if event has been processed before upserting payout
 * - Safe to retry failed webhooks
 * 
 * Flow:
 * 1. Check idempotency (processedEvents table)
 * 2. Extract payout data from event
 * 3. Call internal mutation to upsert payout history
 * 4. Mark event as processed
 * 
 * Note: This is optional for MVP (Palier B). Can be implemented later for payout history tracking.
 * 
 * @param eventId - Stripe event ID (for idempotency)
 * @param eventType - Stripe event type (payout.paid, payout.failed, payout.canceled)
 * @param payout - Stripe payout object
 * 
 * @returns Object with success status and message
 */
export const handlePayoutWebhook = action({
  args: {
    eventId: v.string(),
    eventType: v.string(),
    payout: v.any(), // Stripe.Payout object
  },
  handler: async (ctx, args) => {
    console.log(`Processing payout event ${args.eventId} (${args.eventType})`);

    // Step 1: Check idempotency - has this event been processed?
    const alreadyProcessed = await ctx.runQuery(internal.stripe.isEventProcessed, {
      eventId: args.eventId,
    });

    if (alreadyProcessed) {
      console.log(`Event ${args.eventId} already processed, skipping payout sync`);
      return {
        success: true,
        message: "Event already processed",
        alreadyProcessed: true,
      };
    }

    // Step 2: Extract payout data
    // Payout events are sent to the Connect account, not the platform
    // The account field contains the Connect account ID
    const payout = args.payout;
    const stripeConnectAccountId = payout.destination || payout.account;

    if (!stripeConnectAccountId) {
      console.error("Missing account ID in payout event");
      throw new Error("Missing account ID in payout event");
    }

    // Map Stripe payout status to our schema
    // Stripe statuses: paid, pending, in_transit, canceled, failed
    let status: "paid" | "pending" | "in_transit" | "canceled" | "failed";
    switch (payout.status) {
      case "paid":
        status = "paid";
        break;
      case "pending":
        status = "pending";
        break;
      case "in_transit":
        status = "in_transit";
        break;
      case "canceled":
        status = "canceled";
        break;
      case "failed":
        status = "failed";
        break;
      default:
        console.warn(`Unknown payout status: ${payout.status}, defaulting to pending`);
        status = "pending";
    }

    console.log(
      "Payout details:",
      "ID:", payout.id,
      "Account:", stripeConnectAccountId,
      "Amount:", payout.amount,
      "Currency:", payout.currency,
      "Status:", status,
      "Arrival date:", payout.arrival_date
    );

    // Step 3: Upsert payout history via internal mutation
    // Requirements: R-ART-BAL-3 - Call stripeConnect.upsertPayoutHistory
    try {
      await ctx.runMutation(internal.stripeConnect.upsertPayoutHistory, {
        stripeConnectAccountId,
        stripePayoutId: payout.id,
        amount: payout.amount,
        currency: payout.currency,
        status,
        arrivalDate: payout.arrival_date * 1000, // Convert Unix timestamp to milliseconds
      });

      console.log(`✅ Payout history updated for ${stripeConnectAccountId}`);
    } catch (error) {
      console.error(`Failed to update payout history:`, error);
      throw error;
    }

    // Step 4: Mark event as processed
    await ctx.runMutation(internal.stripe.markEventProcessed, {
      eventId: args.eventId,
    });

    console.log(`Event ${args.eventId} marked as processed`);

    return {
      success: true,
      message: "Payout history updated successfully",
    };
  },
});
