# Subscription Upgrade/Downgrade - Manual Test Script

## Prerequisites

- [ ] Clerk Dashboard access (test environment)
- [ ] Application running locally or on staging
- [ ] Stripe test mode enabled
- [ ] Test artist accounts created (see below)
- [ ] Browser DevTools open (Network tab)

## Test Environment Setup

### 1. Create Test Artist Accounts

```bash
# Account 1: Free Plan Artist
Email: artist-free-test@example.com
Password: TestPass123!
Role: Artist
Plan: Free (default)
```

```bash
# Account 2: Pro Plan Artist (will upgrade manually)
Email: artist-pro-test@example.com
Password: TestPass123!
Role: Artist
Plan: Free (will upgrade to Pro)
```

```bash
# Account 3: Premium Plan Artist (will upgrade manually)
Email: artist-premium-test@example.com
Password: TestPass123!
Role: Artist
Plan: Free (will upgrade to Premium)
```

### 2. Seed Test Data

For each artist account, create test content:

**Free Plan Artist (artist-free-test@example.com):**
- 2 products (audio only)
- 3 events
- 4 custom links

**Pro Plan Artist (artist-pro-test@example.com):**
- 15 products (mix of audio and video)
- 12 events
- 10 custom links

**Premium Plan Artist (artist-premium-test@example.com):**
- 30 products (mix of audio and video)
- 25 events
- 20 custom links

---

## Test 1: Upgrade Free → Pro

### Setup
- [ ] Sign in as `artist-free-test@example.com`
- [ ] Verify dashboard shows "Free" plan badge
- [ ] Navigate to `/dashboard/billing` or subscription settings

### Test Steps

#### Step 1: Verify Free Plan Limits
1. [ ] Navigate to `/dashboard/products`
2. [ ] Verify UI shows "2/3 products" or similar
3. [ ] Try to create 3rd product → Should succeed
4. [ ] Try to create 4th product → Should show upgrade prompt
5. [ ] Verify error message: "You've reached the limit for products on your current plan"

#### Step 2: Verify Video Upload Restriction
1. [ ] Navigate to `/dashboard/products`
2. [ ] Click "Add Product"
3. [ ] Verify "Video" option is disabled or hidden
4. [ ] Verify helper text: "Video uploads require Pro or Premium plan"

#### Step 3: Initiate Upgrade
1. [ ] Navigate to `/dashboard/billing`
2. [ ] Click "Upgrade to Pro" button
3. [ ] Verify Clerk Billing modal opens
4. [ ] Verify Pro plan details are displayed
5. [ ] Verify pricing information is correct

#### Step 4: Complete Payment
1. [ ] Enter test card: `4242 4242 4242 4242`
2. [ ] Enter expiry: `12/34`
3. [ ] Enter CVC: `123`
4. [ ] Enter ZIP: `12345`
5. [ ] Click "Subscribe" or "Pay"
6. [ ] Wait for payment processing

#### Step 5: Verify Upgrade Success
1. [ ] Verify success message appears
2. [ ] Verify modal closes
3. [ ] Verify dashboard shows "Pro" plan badge
4. [ ] Open DevTools → Network tab
5. [ ] Verify Convex query for `getCurrentSubscription` returns:
   ```json
   {
     "plan": "pro",
     "status": "active",
     "limits": {
       "maxProducts": 20,
       "maxEvents": 20,
       "maxLinks": 15,
       "canUploadVideo": true,
       "maxFileSize": 52428800
     }
   }
   ```

#### Step 6: Verify New Limits
1. [ ] Navigate to `/dashboard/products`
2. [ ] Verify UI shows "3/20 products"
3. [ ] Try to create 4th product → Should succeed
4. [ ] Verify "Video" option is now enabled
5. [ ] Try to upload a video file → Should succeed
6. [ ] Navigate to `/dashboard/events`
7. [ ] Verify UI shows "3/20 events"
8. [ ] Navigate to `/dashboard/links`
9. [ ] Verify UI shows "4/15 links"

#### Step 7: Verify File Size Limit
1. [ ] Navigate to `/dashboard/products`
2. [ ] Click "Add Product"
3. [ ] Try to upload a 60MB file → Should fail
4. [ ] Verify error: "File size exceeds your plan limit of 50MB"
5. [ ] Try to upload a 40MB file → Should succeed

### Expected Results
- ✅ Upgrade completes successfully
- ✅ Plan badge updates to "Pro"
- ✅ Product limit increases to 20
- ✅ Event limit increases to 20
- ✅ Link limit increases to 15
- ✅ Video uploads are enabled
- ✅ File size limit is 50MB
- ✅ Server-side queries return correct plan

---

## Test 2: Upgrade Pro → Premium

### Setup
- [ ] Sign in as `artist-pro-test@example.com`
- [ ] Verify dashboard shows "Pro" plan badge
- [ ] Verify 15 products, 12 events, 10 links exist

### Test Steps

#### Step 1: Verify Pro Plan Limits
1. [ ] Navigate to `/dashboard/products`
2. [ ] Verify UI shows "15/20 products"
3. [ ] Create 5 more products to reach 20
4. [ ] Try to create 21st product → Should show upgrade prompt

#### Step 2: Initiate Upgrade
1. [ ] Navigate to `/dashboard/billing`
2. [ ] Click "Upgrade to Premium" button
3. [ ] Verify Clerk Billing modal opens
4. [ ] Verify Premium plan details are displayed

#### Step 3: Complete Payment
1. [ ] Enter test card: `4242 4242 4242 4242`
2. [ ] Complete payment flow
3. [ ] Wait for processing

#### Step 4: Verify Upgrade Success
1. [ ] Verify dashboard shows "Premium" plan badge
2. [ ] Verify Convex query returns:
   ```json
   {
     "plan": "premium",
     "status": "active",
     "limits": {
       "maxProducts": "unlimited",
       "maxEvents": "unlimited",
       "maxLinks": "unlimited",
       "canUploadVideo": true,
       "maxFileSize": 209715200
     }
   }
   ```

#### Step 5: Verify Unlimited Limits
1. [ ] Navigate to `/dashboard/products`
2. [ ] Verify UI shows "20/unlimited products"
3. [ ] Create 30 more products → Should all succeed
4. [ ] Verify no limit errors
5. [ ] Try to upload a 150MB file → Should succeed
6. [ ] Try to upload a 250MB file → Should fail (exceeds 200MB)

### Expected Results
- ✅ Upgrade completes successfully
- ✅ Plan badge updates to "Premium"
- ✅ All limits show "unlimited"
- ✅ Can create 50+ products
- ✅ File size limit is 200MB
- ✅ Server-side queries return correct plan

---

## Test 3: Downgrade Premium → Pro

### Setup
- [ ] Sign in as `artist-premium-test@example.com`
- [ ] Verify dashboard shows "Premium" plan badge
- [ ] Verify 30 products, 25 events, 20 links exist (over Pro limits)

### Test Steps

#### Step 1: Verify Current State
1. [ ] Navigate to `/dashboard/products`
2. [ ] Verify UI shows "30/unlimited products"
3. [ ] Navigate to `/dashboard/events`
4. [ ] Verify UI shows "25/unlimited events"
5. [ ] Navigate to `/dashboard/links`
6. [ ] Verify UI shows "20/unlimited links"

#### Step 2: Initiate Downgrade
1. [ ] Navigate to `/dashboard/billing`
2. [ ] Click "Manage Subscription" button
3. [ ] Verify Clerk Billing portal opens
4. [ ] Click "Change Plan" or "Downgrade"
5. [ ] Select "Pro" plan
6. [ ] Verify warning message about over-limit items
7. [ ] Confirm downgrade

#### Step 3: Verify Downgrade Success
1. [ ] Verify dashboard shows "Pro" plan badge
2. [ ] Verify Convex query returns:
   ```json
   {
     "plan": "pro",
     "status": "active",
     "limits": {
       "maxProducts": 20,
       "maxEvents": 20,
       "maxLinks": 15,
       "canUploadVideo": true,
       "maxFileSize": 52428800
     }
   }
   ```

#### Step 4: Verify Grandfathering (Over-Limit Items Remain)
1. [ ] Navigate to `/dashboard/products`
2. [ ] Verify UI shows "30/20 products" (over limit)
3. [ ] Verify all 30 products are still visible
4. [ ] Verify all 30 products are still accessible
5. [ ] Try to create 31st product → Should fail
6. [ ] Verify error: "You've reached the limit for products on your current plan"

#### Step 5: Verify Cannot Create New Items
1. [ ] Navigate to `/dashboard/products`
2. [ ] Try to create new product → Should show upgrade prompt
3. [ ] Navigate to `/dashboard/events`
4. [ ] Verify UI shows "25/20 events" (over limit)
5. [ ] Try to create new event → Should show upgrade prompt
6. [ ] Navigate to `/dashboard/links`
7. [ ] Verify UI shows "20/15 links" (over limit)
8. [ ] Try to create new link → Should show upgrade prompt

#### Step 6: Verify Can Edit/Delete Existing Items
1. [ ] Navigate to `/dashboard/products`
2. [ ] Edit an existing product → Should succeed
3. [ ] Delete a product (now at 29) → Should succeed
4. [ ] Verify UI shows "29/20 products"
5. [ ] Try to create new product → Should still fail (still over limit)

#### Step 7: Get Under Limit
1. [ ] Delete 9 more products (now at 20)
2. [ ] Verify UI shows "20/20 products"
3. [ ] Try to create new product → Should still fail (at limit, not under)
4. [ ] Delete 1 more product (now at 19)
5. [ ] Verify UI shows "19/20 products"
6. [ ] Try to create new product → Should succeed!

#### Step 8: Verify File Size Limit Reduced
1. [ ] Navigate to `/dashboard/products`
2. [ ] Try to upload a 100MB file → Should fail
3. [ ] Verify error: "File size exceeds your plan limit of 50MB"
4. [ ] Try to upload a 40MB file → Should succeed

### Expected Results
- ✅ Downgrade completes successfully
- ✅ Plan badge updates to "Pro"
- ✅ Over-limit items are grandfathered (remain accessible)
- ✅ Cannot create new items while over limit
- ✅ Can edit/delete existing items
- ✅ Can create new items after getting under limit
- ✅ File size limit reduced to 50MB
- ✅ Server-side gating enforced

---

## Test 4: Downgrade Pro → Free

### Setup
- [ ] Sign in as `artist-pro-test@example.com`
- [ ] Verify dashboard shows "Pro" plan badge
- [ ] Verify 10 products (2 videos), 8 events, 7 links exist

### Test Steps

#### Step 1: Verify Current State
1. [ ] Navigate to `/dashboard/products`
2. [ ] Verify 2 video products exist
3. [ ] Verify video upload option is enabled

#### Step 2: Initiate Downgrade (Cancel Subscription)
1. [ ] Navigate to `/dashboard/billing`
2. [ ] Click "Manage Subscription"
3. [ ] Click "Cancel Subscription"
4. [ ] Verify warning about losing Pro features
5. [ ] Confirm cancellation

#### Step 3: Verify Downgrade Success
1. [ ] Verify dashboard shows "Free" plan badge
2. [ ] Verify Convex query returns:
   ```json
   {
     "plan": "free",
     "status": "none",
     "limits": {
       "maxProducts": 3,
       "maxEvents": 5,
       "maxLinks": 5,
       "canUploadVideo": false,
       "maxFileSize": 10485760
     }
   }
   ```

#### Step 4: Verify Grandfathering
1. [ ] Navigate to `/dashboard/products`
2. [ ] Verify UI shows "10/3 products" (over limit)
3. [ ] Verify all 10 products are still visible
4. [ ] Verify 2 video products are still accessible
5. [ ] Try to create new product → Should fail

#### Step 5: Verify Video Upload Disabled
1. [ ] Navigate to `/dashboard/products`
2. [ ] Click "Add Product"
3. [ ] Verify "Video" option is disabled/hidden
4. [ ] Verify helper text: "Video uploads require Pro or Premium plan"
5. [ ] Try to create audio product → Should fail (over limit)

#### Step 6: Verify File Size Limit Reduced
1. [ ] Try to upload a 20MB audio file → Should fail
2. [ ] Verify error: "File size exceeds your plan limit of 10MB"
3. [ ] Try to upload a 5MB audio file → Should fail (over product limit)

#### Step 7: Get Under Limit
1. [ ] Delete 7 products (now at 3)
2. [ ] Verify UI shows "3/3 products"
3. [ ] Delete 1 more product (now at 2)
4. [ ] Verify UI shows "2/3 products"
5. [ ] Try to create audio product → Should succeed
6. [ ] Try to create video product → Should fail (plan restriction)

### Expected Results
- ✅ Downgrade completes successfully
- ✅ Plan badge updates to "Free"
- ✅ Over-limit items are grandfathered
- ✅ Existing video products remain accessible
- ✅ Cannot create new video products
- ✅ File size limit reduced to 10MB
- ✅ Can create new items after getting under limit
- ✅ Server-side gating enforced

---

## Test 5: Edge Cases

### Test 5.1: Past Due Status

#### Setup
- [ ] Sign in as Pro plan artist
- [ ] Navigate to Clerk Dashboard
- [ ] Simulate payment failure

#### Test Steps
1. [ ] In Clerk Dashboard, mark subscription as "past_due"
2. [ ] Refresh application
3. [ ] Verify warning banner: "Payment failed - update payment method"
4. [ ] Verify Pro features still work (grace period)
5. [ ] Wait for grace period to expire (or manually expire)
6. [ ] Verify plan downgrades to Free
7. [ ] Verify features are restricted

### Test 5.2: Canceled (End of Period)

#### Setup
- [ ] Sign in as Pro plan artist
- [ ] Cancel subscription with "at period end" option

#### Test Steps
1. [ ] Verify subscription status is "canceled"
2. [ ] Verify dashboard shows "Cancels on [date]"
3. [ ] Verify Pro features still work until period end
4. [ ] Manually advance time to period end (or wait)
5. [ ] Verify plan downgrades to Free
6. [ ] Verify features are restricted

### Test 5.3: Server-Side Bypass Attempt

#### Setup
- [ ] Sign in as Free plan artist (3 products)
- [ ] Open browser DevTools → Console

#### Test Steps
1. [ ] Attempt to call Convex mutation directly:
   ```javascript
   // In browser console
   const convex = window.convex;
   await convex.mutation("products:create", {
     title: "Bypass Test",
     type: "music",
     priceUSD: 10,
     // ... other fields
   });
   ```
2. [ ] Verify mutation fails with error
3. [ ] Verify error message: "You've reached the limit for products on your current plan"
4. [ ] Verify product is NOT created in database
5. [ ] Verify server-side gating prevented bypass

---

## Test Completion Checklist

### Upgrade Flows
- [ ] Free → Pro upgrade tested and passing
- [ ] Pro → Premium upgrade tested and passing
- [ ] Limits increase correctly after upgrade
- [ ] Features unlock correctly after upgrade

### Downgrade Flows
- [ ] Premium → Pro downgrade tested and passing
- [ ] Pro → Free downgrade tested and passing
- [ ] Grandfathering works correctly
- [ ] Cannot create new items while over limit
- [ ] Can create new items after getting under limit

### Server-Side Gating
- [ ] Product creation gated by plan
- [ ] Event creation gated by plan
- [ ] Link creation gated by plan
- [ ] Video upload gated by plan
- [ ] File size gated by plan
- [ ] Cannot bypass via direct API calls

### Edge Cases
- [ ] Past due status handled correctly
- [ ] Canceled (end of period) handled correctly
- [ ] Webhook delays handled gracefully
- [ ] UI updates reactively

### UI/UX
- [ ] Plan badge displays correctly
- [ ] Usage counts display correctly
- [ ] Upgrade prompts appear when needed
- [ ] Error messages are clear
- [ ] Loading states work correctly

---

## Sign-Off

**Tester:** _________________  
**Date:** _________________  
**Environment:** _________________  
**All Tests Passed:** [ ] Yes [ ] No  
**Issues Found:** _________________  
**Notes:** _________________
