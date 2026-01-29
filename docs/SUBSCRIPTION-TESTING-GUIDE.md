# Subscription Testing Guide

## Quick Test Scenarios

### Scenario 1: Free Plan Limits (5 min)

**Setup:**
- Sign in as Free plan artist
- Verify dashboard shows "FREE" badge

**Test Steps:**
1. Navigate to Products
2. Create 5 products → Should succeed
3. Try to create 6th product → Should show error
4. Verify error message: "You've reached the limit for products on your current plan. Upgrade to create more."
5. Verify "Upgrade to Premium" button appears

**Expected Results:**
- ✅ Can create up to 5 products
- ✅ Cannot create 6th product
- ✅ Clear upgrade prompt shown

---

### Scenario 2: Video Upload Restriction (3 min)

**Setup:**
- Sign in as Free plan artist

**Test Steps:**
1. Navigate to Add Product dialog
2. Verify "Video" option is disabled or hidden
3. Try to upload video via API (if possible)
4. Verify error: "Video uploads require Premium plan"

**Expected Results:**
- ✅ Video option disabled in UI
- ✅ Server rejects video uploads
- ✅ Clear error message

---

### Scenario 3: File Size Limit (3 min)

**Setup:**
- Sign in as Free plan artist

**Test Steps:**
1. Try to upload 60MB audio file
2. Verify error: "File size exceeds your plan limit of 50MB"
3. Try to upload 40MB audio file
4. Verify upload succeeds

**Expected Results:**
- ✅ Files > 50MB rejected
- ✅ Files ≤ 50MB accepted
- ✅ Clear error message

---

### Scenario 4: Upgrade Free → Premium (10 min)

**Setup:**
- Sign in as Free plan artist with 5 products

**Test Steps:**
1. Navigate to Dashboard → Billing
2. Click "Upgrade to Premium - $19.99/month"
3. Verify Clerk Billing modal opens
4. Complete payment with test card: `4242 4242 4242 4242`
5. Verify success message
6. Verify dashboard shows "PREMIUM" badge
7. Try to create 6th product → Should succeed
8. Try to upload video → Should succeed
9. Try to upload 100MB file → Should succeed

**Expected Results:**
- ✅ Upgrade completes successfully
- ✅ Badge updates to "PREMIUM"
- ✅ Can create unlimited products
- ✅ Video uploads enabled
- ✅ File size limit increased to 500MB

---

### Scenario 5: Downgrade Premium → Free (10 min)

**Setup:**
- Sign in as Premium plan artist with 10 products

**Test Steps:**
1. Navigate to Dashboard → Billing
2. Click "Manage Subscription"
3. Verify Clerk Billing portal opens
4. Click "Cancel Subscription"
5. Confirm cancellation
6. Verify dashboard shows "FREE" badge
7. Verify all 10 products still accessible
8. Try to create 11th product → Should show error
9. Delete 6 products (now at 4 products)
10. Try to create new product → Should succeed

**Expected Results:**
- ✅ Downgrade completes successfully
- ✅ Badge updates to "FREE"
- ✅ Over-limit items remain accessible (grandfathering)
- ✅ Cannot create new items while over limit
- ✅ Can create new items after getting under limit

---

### Scenario 6: Server-Side Gating (5 min)

**Setup:**
- Sign in as Free plan artist with 5 products

**Test Steps:**
1. Open browser DevTools → Console
2. Try to bypass limit via direct API call:
   ```javascript
   await convex.mutation("products:create", { 
     title: "Bypass Test",
     type: "music",
     priceUSD: 10
   });
   ```
3. Verify mutation fails with error
4. Verify product is NOT created in database

**Expected Results:**
- ✅ Direct API calls are blocked
- ✅ Server-side gating prevents bypass
- ✅ Clear error message returned

---

## Test Data Setup

### Test Accounts

Create test accounts in Clerk Dashboard:

```
Free Plan Artist:
Email: artist-free-test@example.com
Password: TestPass123!
Role: Artist
Plan: Free

Premium Plan Artist:
Email: artist-premium-test@example.com
Password: TestPass123!
Role: Artist
Plan: Premium
```

### Seed Data

For Free plan artist:
- 4 products (1 away from limit)
- 3 events
- 4 custom links

For Premium plan artist:
- 10 products (mix of audio and video)
- 8 events
- 12 custom links

---

## Stripe Test Cards

Use these test cards in Clerk Billing:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |

**Expiry:** Any future date (e.g., 12/34)  
**CVC:** Any 3 digits (e.g., 123)  
**ZIP:** Any 5 digits (e.g., 12345)

---

## Verification Checklist

### Free Plan
- [ ] Max 5 products enforced
- [ ] Max 5 events enforced
- [ ] Max 5 links enforced
- [ ] Video uploads disabled
- [ ] 50MB file size limit enforced
- [ ] Upgrade prompts appear when at limit

### Premium Plan
- [ ] Unlimited products
- [ ] Unlimited events
- [ ] Unlimited links
- [ ] Video uploads enabled
- [ ] 500MB file size limit enforced

### Upgrade Flow
- [ ] Free → Premium upgrade works
- [ ] Limits update immediately
- [ ] Payment processed correctly
- [ ] Badge updates in UI

### Downgrade Flow
- [ ] Premium → Free downgrade works
- [ ] Grandfathering works (over-limit items remain)
- [ ] Cannot create new items while over limit
- [ ] Can create after getting under limit

### Server-Side Gating
- [ ] Cannot bypass via direct API calls
- [ ] All mutations check limits
- [ ] Clear error messages
- [ ] No items created when limit exceeded

---

## Debugging Tips

### Check Subscription in Clerk
1. Open Clerk Dashboard
2. Navigate to Users
3. Select test user
4. Check Public Metadata → subscription object:
   ```json
   {
     "subscription": {
       "plan": "premium",
       "status": "active",
       "currentPeriodEnd": 1234567890
     }
   }
   ```

### Check Convex Queries
1. Open Convex Dashboard
2. Navigate to Functions
3. Test `subscriptions:getCurrentSubscription`
4. Verify return values match expected plan

### Check Server-Side Enforcement
1. Open browser DevTools → Network tab
2. Attempt to create item over limit
3. Verify mutation fails with 400/403 error
4. Verify error message is clear
5. Verify item is NOT created in database

---

## Common Issues

### Issue: Upgrade doesn't reflect immediately
**Solution:** Wait 1-5 seconds for webhook processing. Refresh page.

### Issue: Video upload still disabled after upgrade
**Solution:** Check Clerk publicMetadata. Verify `plan: "premium"` and `status: "active"`.

### Issue: Can create more items than limit
**Solution:** Check server-side gating in mutations. Verify `canCreateProduct()` is called.

### Issue: File size validation not working
**Solution:** Check both client-side and server-side validation. Verify `getMaxFileSize()` returns correct value.

---

## Sign-Off

After completing all test scenarios:

- [ ] All Free plan limits enforced correctly
- [ ] All Premium plan features work correctly
- [ ] Upgrade flow works end-to-end
- [ ] Downgrade flow works with grandfathering
- [ ] Server-side gating prevents bypass
- [ ] UI shows accurate plan and usage information
- [ ] No TypeScript errors
- [ ] No console errors

**Tested By:** _______________  
**Date:** _______________  
**Status:** ☐ Pass | ☐ Fail  
**Notes:** _______________

---

**Last Updated:** January 2026  
**Plans:** Free ($0) | Premium ($19.99/month)
