# Stripe Webhooks - Local Development Debugging

## Problem
Payment methods added via Stripe Elements don't appear in the UI after successful `stripe.confirmSetup()`.

## Root Cause
Stripe webhooks (`setup_intent.succeeded`) are not being received by the local Next.js server.

## Solution Steps

### 1. Verify Stripe CLI is Running

```bash
# Check if Stripe CLI is installed
stripe --version

# Start forwarding webhooks to localhost
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

**Expected output:**
```
> Ready! Your webhook signing secret is whsec_xxxxx (^C to quit)
```

### 2. Update Webhook Secret in .env.local

Copy the webhook signing secret from Stripe CLI output and update `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Important:** Restart `npm run dev` after changing `.env.local`

### 3. Verify Events are Being Sent

After adding a payment method, check Stripe CLI terminal for logs:

```
2026-01-18 12:34:56   --> setup_intent.succeeded [evt_xxxxx]
2026-01-18 12:34:56   <--  [200] POST http://localhost:3000/api/stripe/webhook [evt_xxxxx]
```

### 4. Check Next.js Server Logs

In the terminal running `npm run dev`, you should see:

```
Received Stripe event: setup_intent.succeeded (evt_xxxxx)
Payment method webhook processed successfully: { success: true, message: '...' }
```

### 5. List Recent Stripe Events

```bash
stripe events list --limit 5
```

Look for `setup_intent.succeeded` events with your SetupIntent ID.

### 6. Manually Trigger Webhook (if needed)

If the event exists but wasn't forwarded:

```bash
stripe events resend evt_xxxxx
```

## Common Issues

### Issue 1: Webhook Secret Mismatch
**Symptom:** `Webhook signature verification failed`

**Solution:** 
- Copy the exact secret from `stripe listen` output
- Update `STRIPE_WEBHOOK_SECRET` in `.env.local`
- Restart `npm run dev`

### Issue 2: Wrong Port
**Symptom:** Stripe CLI shows `connection refused`

**Solution:**
- Verify Next.js is running on port 3000
- Update forward URL: `stripe listen --forward-to http://localhost:3000/api/stripe/webhook`

### Issue 3: Event Not Created
**Symptom:** No `setup_intent.succeeded` in `stripe events list`

**Solution:**
- Verify `stripe.confirmSetup()` succeeded (check browser console)
- Check Stripe Dashboard → Developers → Events

### Issue 4: Convex Not Syncing
**Symptom:** Webhook received but payment method not in Convex

**Solution:**
- Check Convex logs: `npx convex logs`
- Verify `handlePaymentMethodWebhook` action is called
- Check `processedEvents` table for idempotency issues

## Testing Flow

1. **Start services:**
   ```bash
   # Terminal 1
   npm run dev
   
   # Terminal 2
   npx convex dev
   
   # Terminal 3
   stripe listen --forward-to http://localhost:3000/api/stripe/webhook
   ```

2. **Add payment method:**
   - Navigate to `/me/[username]/billing`
   - Click "Add Your First Payment Method"
   - Fill card: `4242 4242 4242 4242`, exp: `12/28`, CVC: `123`
   - Click "Save Payment Method"

3. **Verify webhook:**
   - Check Stripe CLI terminal for `setup_intent.succeeded`
   - Check Next.js terminal for "Payment method webhook processed"
   - Refresh page - payment method should appear

## Architecture

```
Client (Browser)
  ↓ stripe.confirmSetup()
Stripe API
  ↓ setup_intent.succeeded webhook
Stripe CLI (local)
  ↓ forward to localhost:3000
Next.js /api/stripe/webhook
  ↓ verify signature
  ↓ call Convex action
Convex handlePaymentMethodWebhook
  ↓ sync to paymentMethods table
Convex DB
  ↓ reactive query
Client UI updates
```

## Files Involved

- `src/app/api/stripe/webhook/route.ts` - Webhook handler
- `convex/stripe.ts` - `handlePaymentMethodWebhook` action
- `convex/paymentMethods.ts` - Internal mutations for syncing
- `src/components/fan/add-payment-method-dialog.tsx` - UI component

## References

- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Testing Webhooks Locally](https://stripe.com/docs/webhooks/test)
