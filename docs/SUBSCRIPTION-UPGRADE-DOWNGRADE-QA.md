# Subscription Upgrade/Downgrade QA Test Plan

## Overview

This document outlines the QA testing procedures for Clerk Billing subscription upgrade and downgrade flows for artist accounts. The subscription system uses Clerk Billing as the source of truth (R-CLERK-SUB-1.1) with server-side feature gating (R-CLERK-SUB-1.2).

## Subscription Plans

### Free Plan
- Max 3 products
- Max 5 events
- Max 5 custom links
- No video uploads (audio only)
- Max file size: 10MB

### Pro Plan
- Max 20 products
- Max 20 events
- Max 15 custom links
- Video uploads enabled
- Max file size: 50MB

### Premium Plan
- Unlimited products
- Unlimited events
- Unlimited custom links
- Video uploads enabled
- Max file size: 200MB

## Test Scenarios

### 1. Upgrade Flow: Free → Pro

#### 1.1 Pre-Upgrade State
- [ ] Artist is on Free plan
- [ ] Artist has 2 products (under limit)
- [ ] Artist has 3 events (under limit)
- [ ] Artist has 4 links (under limit)
- [ ] Video upload option is disabled/hidden
- [ ] File upload shows 10MB limit

#### 1.2 Upgrade Process
- [ ] Navigate to Billing/Subscription page
- [ ] Click "Upgrade to Pro" button
- [ ] Clerk Billing modal opens
- [ ] Complete payment flow (use test card)
- [ ] Subscription status updates in Clerk
- [ ] Webhook/sync updates publicMetadata.subscription

#### 1.3 Post-Upgrade Verification
- [ ] Dashboard shows "Pro" plan badge
- [ ] Product limit increased to 20 (can create 18 more)
- [ ] Event limit increased to 20 (can create 17 more)
- [ ] Link limit increased to 15 (can create 11 more)
- [ ] Video upload option is now enabled
- [ ] File upload shows 50MB limit
- [ ] Can successfully create a video product
- [ ] Can upload files up to 50MB
- [ ] Server-side: `getCurrentPlan()` returns "pro"
- [ ] Server-side: `canUploadVideo()` returns true

### 2. Upgrade Flow: Pro → Premium

#### 2.1 Pre-Upgrade State
- [ ] Artist is on Pro plan
- [ ] Artist has 15 products
- [ ] Artist has 12 events
- [ ] Artist has 10 links
- [ ] Video uploads are enabled
- [ ] File upload shows 50MB limit

#### 2.2 Upgrade Process
- [ ] Navigate to Billing/Subscription page
- [ ] Click "Upgrade to Premium" button
- [ ] Clerk Billing modal opens
- [ ] Complete payment flow (use test card)
- [ ] Subscription status updates in Clerk
- [ ] Webhook/sync updates publicMetadata.subscription

#### 2.3 Post-Upgrade Verification
- [ ] Dashboard shows "Premium" plan badge
- [ ] Product limit shows "Unlimited"
- [ ] Event limit shows "Unlimited"
- [ ] Link limit shows "Unlimited"
- [ ] Video upload option remains enabled
- [ ] File upload shows 200MB limit
- [ ] Can create 50+ products (test unlimited)
- [ ] Can upload files up to 200MB
- [ ] Server-side: `getCurrentPlan()` returns "premium"
- [ ] Server-side: `getFeatureLimits()` returns Infinity for counts

### 3. Downgrade Flow: Premium → Pro

#### 3.1 Pre-Downgrade State
- [ ] Artist is on Premium plan
- [ ] Artist has 25 products (over Pro limit)
- [ ] Artist has 22 events (over Pro limit)
- [ ] Artist has 16 links (over Pro limit)
- [ ] Video uploads are enabled
- [ ] File upload shows 200MB limit

#### 3.2 Downgrade Process
- [ ] Navigate to Billing/Subscription page
- [ ] Click "Manage Subscription" button
- [ ] Clerk Billing portal opens
- [ ] Select "Downgrade to Pro" option
- [ ] Confirm downgrade (may be immediate or at period end)
- [ ] Subscription status updates in Clerk
- [ ] Webhook/sync updates publicMetadata.subscription

#### 3.3 Post-Downgrade Verification (Immediate)
- [ ] Dashboard shows "Pro" plan badge
- [ ] Product limit shows 20 (but 25 exist - grandfathered)
- [ ] Event limit shows 20 (but 22 exist - grandfathered)
- [ ] Link limit shows 15 (but 16 exist - grandfathered)
- [ ] Cannot create NEW products (at limit)
- [ ] Cannot create NEW events (at limit)
- [ ] Cannot create NEW links (at limit)
- [ ] Can still edit/delete existing items
- [ ] Video upload option remains enabled
- [ ] File upload shows 50MB limit (reduced from 200MB)
- [ ] Server-side: `getCurrentPlan()` returns "pro"
- [ ] Server-side: `canCreateProduct()` returns false (25 >= 20)
- [ ] Server-side: `canCreateEvent()` returns false (22 >= 20)
- [ ] Server-side: `canCreateLink()` returns false (16 >= 15)

#### 3.4 Post-Downgrade Verification (After Cleanup)
- [ ] Artist deletes 5 products (now at 20)
- [ ] Artist deletes 2 events (now at 20)
- [ ] Artist deletes 1 link (now at 15)
- [ ] Can now create NEW products (at limit, not over)
- [ ] Can now create NEW events (at limit, not over)
- [ ] Can now create NEW links (at limit, not over)

### 4. Downgrade Flow: Pro → Free

#### 4.1 Pre-Downgrade State
- [ ] Artist is on Pro plan
- [ ] Artist has 10 products (over Free limit)
- [ ] Artist has 8 events (over Free limit)
- [ ] Artist has 7 links (over Free limit)
- [ ] Artist has 2 video products
- [ ] Video uploads are enabled
- [ ] File upload shows 50MB limit

#### 4.2 Downgrade Process
- [ ] Navigate to Billing/Subscription page
- [ ] Click "Manage Subscription" button
- [ ] Clerk Billing portal opens
- [ ] Select "Cancel Subscription" option
- [ ] Confirm cancellation (may be immediate or at period end)
- [ ] Subscription status updates in Clerk to "canceled" or "none"
- [ ] Webhook/sync updates publicMetadata.subscription

#### 4.3 Post-Downgrade Verification (Immediate)
- [ ] Dashboard shows "Free" plan badge
- [ ] Product limit shows 3 (but 10 exist - grandfathered)
- [ ] Event limit shows 5 (but 8 exist - grandfathered)
- [ ] Link limit shows 5 (but 7 exist - grandfathered)
- [ ] Cannot create NEW products (at limit)
- [ ] Cannot create NEW events (at limit)
- [ ] Cannot create NEW links (at limit)
- [ ] Video upload option is disabled/hidden
- [ ] Existing video products remain accessible
- [ ] Cannot create NEW video products
- [ ] File upload shows 10MB limit (reduced from 50MB)
- [ ] Server-side: `getCurrentPlan()` returns "free"
- [ ] Server-side: `canUploadVideo()` returns false
- [ ] Server-side: `canCreateProduct()` returns false (10 >= 3)

#### 4.4 Post-Downgrade Verification (After Cleanup)
- [ ] Artist deletes 7 products (now at 3)
- [ ] Artist deletes 3 events (now at 5)
- [ ] Artist deletes 2 links (now at 5)
- [ ] Can now create NEW products (at limit, not over)
- [ ] Can now create NEW events (at limit, not over)
- [ ] Can now create NEW links (at limit, not over)
- [ ] Still cannot create video products (plan restriction)

### 5. Subscription Status Edge Cases

#### 5.1 Past Due Status
- [ ] Simulate payment failure (Clerk test mode)
- [ ] Subscription status changes to "past_due"
- [ ] Artist retains current plan features temporarily
- [ ] Warning banner shows "Payment failed - update payment method"
- [ ] After grace period, plan downgrades to Free
- [ ] Server-side: `getCurrentPlan()` returns "free" when past_due

#### 5.2 Canceled Status (End of Period)
- [ ] Cancel subscription with "at period end" option
- [ ] Subscription status changes to "canceled"
- [ ] Artist retains current plan features until period end
- [ ] Dashboard shows "Cancels on [date]"
- [ ] After period end, plan downgrades to Free
- [ ] Server-side: `getCurrentPlan()` returns current plan until period end

#### 5.3 Trialing Status
- [ ] Start trial subscription (if available)
- [ ] Subscription status is "trialing"
- [ ] Artist has full plan features during trial
- [ ] Dashboard shows "Trial ends on [date]"
- [ ] Server-side: `hasActiveSubscription()` returns true
- [ ] After trial ends without payment, downgrades to Free

### 6. Server-Side Gating Verification

#### 6.1 Product Creation Gating
- [ ] Artist on Free plan with 3 products
- [ ] Attempt to create 4th product via API/mutation
- [ ] Server returns error: "You've reached the limit for products on your current plan"
- [ ] Product is NOT created in database
- [ ] UI shows upgrade prompt

#### 6.2 Video Upload Gating
- [ ] Artist on Free plan
- [ ] Attempt to upload video file via API
- [ ] Server returns error: "Video uploads require Pro or Premium plan"
- [ ] File is NOT uploaded to storage
- [ ] UI shows upgrade prompt

#### 6.3 File Size Gating
- [ ] Artist on Pro plan (50MB limit)
- [ ] Attempt to upload 100MB file via API
- [ ] Server returns error: "File size exceeds your plan limit of 50MB"
- [ ] File is NOT uploaded to storage
- [ ] UI shows file size error

### 7. UI/UX Verification

#### 7.1 Plan Display
- [ ] Current plan badge visible in dashboard header
- [ ] Plan limits shown in settings/billing page
- [ ] Usage counts shown alongside limits (e.g., "3/20 products")
- [ ] Progress bars for usage (optional)

#### 7.2 Upgrade Prompts
- [ ] When at limit, "Upgrade" button appears
- [ ] Upgrade button opens Clerk Billing modal
- [ ] Clear messaging about what upgrading unlocks
- [ ] Pricing information visible

#### 7.3 Downgrade Warnings
- [ ] When downgrading, show warning about over-limit items
- [ ] Explain grandfathering (existing items remain, but can't create new)
- [ ] Suggest deleting items to get under new limit
- [ ] Confirm downgrade action

### 8. Webhook/Sync Verification

#### 8.1 Subscription Created
- [ ] Clerk webhook fires on subscription creation
- [ ] publicMetadata.subscription is updated
- [ ] Convex queries reflect new plan immediately
- [ ] No manual refresh required

#### 8.2 Subscription Updated
- [ ] Clerk webhook fires on plan change
- [ ] publicMetadata.subscription is updated
- [ ] Convex queries reflect new plan immediately
- [ ] UI updates reactively (Convex reactivity)

#### 8.3 Subscription Canceled
- [ ] Clerk webhook fires on cancellation
- [ ] publicMetadata.subscription status changes to "canceled"
- [ ] Plan remains active until period end
- [ ] After period end, plan changes to "free"

## Test Data Setup

### Test Artist Accounts

#### Artist 1: Free Plan
- Email: artist-free@test.com
- Products: 2
- Events: 3
- Links: 4

#### Artist 2: Pro Plan
- Email: artist-pro@test.com
- Products: 15
- Events: 12
- Links: 10

#### Artist 3: Premium Plan
- Email: artist-premium@test.com
- Products: 30
- Events: 25
- Links: 20

### Clerk Test Cards

Use Clerk's test mode with Stripe test cards:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- Insufficient funds: 4000 0000 0000 9995

## Automated Test Coverage

### Unit Tests (Convex Functions)
- [ ] `getSubscriptionStatus()` returns correct plan from metadata
- [ ] `getCurrentPlan()` returns "free" for inactive subscriptions
- [ ] `canCreateProduct()` respects plan limits
- [ ] `canCreateEvent()` respects plan limits
- [ ] `canCreateLink()` respects plan limits
- [ ] `canUploadVideo()` returns false for Free plan
- [ ] `getMaxFileSize()` returns correct limit per plan
- [ ] `enforceLimit()` throws error when limit exceeded

### Integration Tests (API Routes)
- [ ] Product creation blocked when at limit
- [ ] Event creation blocked when at limit
- [ ] Link creation blocked when at limit
- [ ] Video upload blocked on Free plan
- [ ] File size validation enforced per plan

## Success Criteria

All test scenarios must pass with:
- ✅ Server-side gating prevents limit bypass
- ✅ Subscription changes reflect immediately
- ✅ Grandfathering works correctly (existing items remain)
- ✅ UI shows accurate plan and usage information
- ✅ Upgrade/downgrade flows complete without errors
- ✅ Clerk Billing integration works end-to-end
- ✅ No mock data or placeholder states

## Known Issues / Edge Cases

### Grandfathering Behavior
When downgrading, existing items that exceed the new plan's limit are "grandfathered" (they remain accessible but new items cannot be created until under the limit).

**Example:**
- Artist on Premium with 30 products downgrades to Pro (20 limit)
- All 30 products remain accessible
- Cannot create product #31 until deleting 10 products

### Period End Timing
Subscription changes may take effect immediately or at the end of the billing period, depending on Clerk Billing configuration. Test both scenarios.

### Webhook Delays
There may be a slight delay (1-5 seconds) between Clerk Billing action and webhook processing. UI should handle this gracefully with loading states.

## QA Sign-Off

- [ ] All upgrade flows tested and passing
- [ ] All downgrade flows tested and passing
- [ ] Server-side gating verified
- [ ] Edge cases handled correctly
- [ ] UI/UX meets requirements
- [ ] No regressions in existing features

**Tested by:** _________________  
**Date:** _________________  
**Sign-off:** _________________
