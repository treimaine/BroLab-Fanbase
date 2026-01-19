# Subscription Logic Verification Guide

## Overview

This document provides verification steps for the subscription logic implemented in `convex/subscriptions.ts`. These checks can be performed manually or integrated into your testing framework.

## Plan Limits Verification

### Free Plan Limits
```typescript
// Expected values from PLAN_LIMITS.free
{
  maxProducts: 3,
  maxEvents: 5,
  maxLinks: 5,
  canUploadVideo: false,
  maxFileSize: 10485760 // 10MB in bytes
}
```

**Verification Steps:**
1. Open Convex Dashboard
2. Navigate to Functions → subscriptions
3. Call `getCurrentSubscription` for a Free plan user
4. Verify limits match expected values

### Pro Plan Limits
```typescript
// Expected values from PLAN_LIMITS.pro
{
  maxProducts: 20,
  maxEvents: 20,
  maxLinks: 15,
  canUploadVideo: true,
  maxFileSize: 52428800 // 50MB in bytes
}
```

**Verification Steps:**
1. Call `getCurrentSubscription` for a Pro plan user
2. Verify limits match expected values
3. Verify `canUploadVideo` is `true`

### Premium Plan Limits
```typescript
// Expected values from PLAN_LIMITS.premium
{
  maxProducts: Infinity,
  maxEvents: Infinity,
  maxLinks: Infinity,
  canUploadVideo: true,
  maxFileSize: 209715200 // 200MB in bytes
}
```

**Verification Steps:**
1. Call `getCurrentSubscription` for a Premium plan user
2. Verify limits show "unlimited" in UI
3. Verify `canUploadVideo` is `true`

## Upgrade Scenarios

### Free → Pro Upgrade
**Expected Changes:**
- maxProducts: 3 → 20 (increase of 17)
- maxEvents: 5 → 20 (increase of 15)
- maxLinks: 5 → 15 (increase of 10)
- canUploadVideo: false → true
- maxFileSize: 10MB → 50MB (increase of 40MB)

**Verification:**
1. Query subscription before upgrade
2. Perform upgrade via Clerk Billing
3. Query subscription after upgrade
4. Verify all limits increased correctly

### Pro → Premium Upgrade
**Expected Changes:**
- maxProducts: 20 → Infinity
- maxEvents: 20 → Infinity
- maxLinks: 15 → Infinity
- canUploadVideo: true → true (no change)
- maxFileSize: 50MB → 200MB (increase of 150MB)

**Verification:**
1. Query subscription before upgrade
2. Perform upgrade via Clerk Billing
3. Query subscription after upgrade
4. Verify limits show "unlimited"

## Downgrade Scenarios

### Premium → Pro Downgrade
**Expected Changes:**
- maxProducts: Infinity → 20
- maxEvents: Infinity → 20
- maxLinks: Infinity → 15
- canUploadVideo: true → true (no change)
- maxFileSize: 200MB → 50MB (decrease of 150MB)

**Grandfathering Test:**
```
Scenario: User has 30 products on Premium, downgrades to Pro (20 limit)

Expected Behavior:
✅ All 30 products remain accessible
✅ Can view/edit/delete existing products
❌ Cannot create product #31 (over limit)
✅ After deleting 11 products (now at 19), can create new products
```

**Verification:**
1. Create 30 products on Premium plan
2. Downgrade to Pro plan
3. Verify `getCurrentUsage` returns `productsCount: 30`
4. Verify `canCreateProduct(ctx, 30)` returns `false`
5. Delete 11 products
6. Verify `canCreateProduct(ctx, 19)` returns `true`

### Pro → Free Downgrade
**Expected Changes:**
- maxProducts: 20 → 3
- maxEvents: 20 → 5
- maxLinks: 15 → 5
- canUploadVideo: true → false
- maxFileSize: 50MB → 10MB (decrease of 40MB)

**Video Upload Restriction Test:**
```
Scenario: User has 2 video products on Pro, downgrades to Free

Expected Behavior:
✅ Existing 2 video products remain accessible
✅ Can view/play existing videos
❌ Cannot create new video products
❌ Video upload option disabled in UI
```

**Verification:**
1. Create 2 video products on Pro plan
2. Downgrade to Free plan
3. Verify existing videos still accessible
4. Verify `canUploadVideo(ctx)` returns `false`
5. Attempt to create video product → should fail

## Server-Side Gating Verification

### Product Creation Limit
```typescript
// Test: Free plan user with 3 products tries to create 4th
const currentCount = 3;
const canCreate = await canCreateProduct(ctx, currentCount);
// Expected: false

enforceLimit(canCreate, "products");
// Expected: throws Error("You've reached the limit for products on your current plan")
```

**Manual Verification:**
1. Sign in as Free plan artist with 3 products
2. Open browser DevTools → Console
3. Attempt to call mutation directly:
```javascript
await convex.mutation("products:create", { /* args */ });
```
4. Verify mutation fails with limit error
5. Verify product is NOT created in database

### Video Upload Restriction
```typescript
// Test: Free plan user tries to upload video
const canUpload = await canUploadVideo(ctx);
// Expected: false

if (!canUpload) {
  throw new Error("Video uploads require Pro or Premium plan");
}
```

**Manual Verification:**
1. Sign in as Free plan artist
2. Navigate to Add Product dialog
3. Verify "Video" option is disabled/hidden
4. Attempt to upload video via API → should fail
5. Verify file is NOT uploaded to storage

### File Size Limit
```typescript
// Test: Pro plan user tries to upload 100MB file
const maxSize = await getMaxFileSize(ctx); // Returns 52428800 (50MB)
const fileSize = 104857600; // 100MB

if (fileSize > maxSize) {
  throw new Error("File size exceeds your plan limit of 50MB");
}
```

**Manual Verification:**
1. Sign in as Pro plan artist
2. Attempt to upload 100MB file
3. Verify error message shows correct limit
4. Verify file is NOT uploaded
5. Attempt to upload 40MB file → should succeed

## Subscription Status Logic

### Active Status Check
```typescript
// Test: User with "active" status
const status = "active";
const isActive = status === "active" || status === "trialing";
// Expected: true
```

### Trialing Status Check
```typescript
// Test: User with "trialing" status
const status = "trialing";
const isActive = status === "active" || status === "trialing";
// Expected: true
```

### Inactive Status Checks
```typescript
// Test: User with "canceled" status
const status = "canceled";
const isActive = status === "active" || status === "trialing";
// Expected: false

// Test: User with "past_due" status
const status = "past_due";
const isActive = status === "active" || status === "trialing";
// Expected: false

// Test: User with "none" status
const status = "none";
const isActive = status === "active" || status === "trialing";
// Expected: false
```

**Manual Verification:**
1. In Clerk Dashboard, set subscription status to each value
2. Call `getCurrentPlan(ctx)` for each status
3. Verify:
   - "active" → returns paid plan
   - "trialing" → returns paid plan
   - "canceled" → returns "free"
   - "past_due" → returns "free"
   - "none" → returns "free"

## File Size Calculations

### Verify Byte Conversions
```typescript
// Free plan: 10MB
10 * 1024 * 1024 = 10485760 bytes

// Pro plan: 50MB
50 * 1024 * 1024 = 52428800 bytes

// Premium plan: 200MB
200 * 1024 * 1024 = 209715200 bytes
```

### Test File Sizes
```typescript
// Test files
const file5MB = 5 * 1024 * 1024;      // 5242880 bytes
const file15MB = 15 * 1024 * 1024;    // 15728640 bytes
const file60MB = 60 * 1024 * 1024;    // 62914560 bytes
const file150MB = 150 * 1024 * 1024;  // 157286400 bytes

// Free plan (10MB limit)
file5MB <= 10485760   // true ✅
file15MB <= 10485760  // false ❌

// Pro plan (50MB limit)
file15MB <= 52428800  // true ✅
file60MB <= 52428800  // false ❌

// Premium plan (200MB limit)
file150MB <= 209715200 // true ✅
```

## Convex Query Testing

### Test getCurrentSubscription
```typescript
// Call from Convex Dashboard or client
const result = await convex.query("subscriptions:getCurrentSubscription");

// Expected structure
{
  plan: "free" | "pro" | "premium",
  status: "active" | "canceled" | "past_due" | "trialing" | "none",
  currentPeriodEnd?: number,
  limits: {
    maxProducts: number | "unlimited",
    maxEvents: number | "unlimited",
    maxLinks: number | "unlimited",
    canUploadVideo: boolean,
    maxFileSize: number
  }
}
```

### Test getCurrentUsage
```typescript
// Call from Convex Dashboard or client
const result = await convex.query("subscriptions:getCurrentUsage");

// Expected structure
{
  productsCount: number,
  eventsCount: number,
  linksCount: number
}
```

## Integration Testing Checklist

- [ ] Free plan limits enforced correctly
- [ ] Pro plan limits enforced correctly
- [ ] Premium plan limits enforced correctly
- [ ] Upgrade Free → Pro increases limits
- [ ] Upgrade Pro → Premium increases limits
- [ ] Downgrade Premium → Pro decreases limits
- [ ] Downgrade Pro → Free decreases limits
- [ ] Grandfathering works (over-limit items remain)
- [ ] Cannot create new items while over limit
- [ ] Can create new items after getting under limit
- [ ] Video upload restricted on Free plan
- [ ] Video upload allowed on Pro/Premium plans
- [ ] File size limits enforced per plan
- [ ] Server-side gating prevents bypass
- [ ] Subscription status logic correct
- [ ] Queries return correct data structure

## Debugging Tips

### Check Subscription Data in Clerk
1. Open Clerk Dashboard
2. Navigate to Users
3. Select test user
4. Check Public Metadata → subscription object
5. Verify structure:
```json
{
  "subscription": {
    "plan": "pro",
    "status": "active",
    "currentPeriodEnd": 1234567890
  }
}
```

### Check Convex Queries
1. Open Convex Dashboard
2. Navigate to Functions
3. Test queries with different user contexts
4. Verify return values match expected structure

### Check Server-Side Enforcement
1. Open browser DevTools → Network tab
2. Attempt to create item over limit
3. Verify mutation fails with 400/403 error
4. Verify error message is clear
5. Verify item is NOT created in database

---

**Last Updated:** January 18, 2026  
**Related Files:**
- `convex/subscriptions.ts` - Implementation
- `docs/SUBSCRIPTION-UPGRADE-DOWNGRADE-QA.md` - Full test plan
- `docs/SUBSCRIPTION-QA-MANUAL-TEST-SCRIPT.md` - Manual test script
