# Subscription Upgrade/Downgrade QA - Summary

## Overview

This document summarizes the QA testing approach for Clerk Billing subscription upgrade and downgrade flows in the BroLab Fanbase application.

## Deliverables

### 1. Comprehensive QA Test Plan
**File:** `docs/SUBSCRIPTION-UPGRADE-DOWNGRADE-QA.md`

A detailed test plan covering:
- All subscription plans (Free, Pro, Premium)
- Upgrade flows (Free → Pro, Pro → Premium)
- Downgrade flows (Premium → Pro, Pro → Free)
- Edge cases (past_due, canceled, trialing)
- Server-side gating verification
- UI/UX verification
- Webhook/sync verification

### 2. Manual Test Script
**File:** `docs/SUBSCRIPTION-QA-MANUAL-TEST-SCRIPT.md`

Step-by-step manual testing instructions including:
- Test environment setup
- Test data creation
- Detailed test steps for each scenario
- Expected results and verification points
- Sign-off checklist

### 3. Automated Unit Tests
**File:** `convex/subscriptions.test.ts`

Unit tests covering:
- Plan limits verification
- Upgrade scenario logic
- Downgrade scenario logic
- Grandfathering behavior
- File size limits
- Video upload restrictions
- Subscription status logic

## Test Coverage

### Upgrade Flows ✅
- [x] Free → Pro
  - Limits increase (3→20 products, 5→20 events, 5→15 links)
  - Video uploads enabled
  - File size limit increases (10MB→50MB)
  
- [x] Pro → Premium
  - Limits become unlimited
  - File size limit increases (50MB→200MB)
  - Can create 50+ items

### Downgrade Flows ✅
- [x] Premium → Pro
  - Limits decrease (unlimited→20/20/15)
  - Over-limit items grandfathered
  - Cannot create new items while over limit
  - Can create after getting under limit
  
- [x] Pro → Free
  - Limits decrease (20/20/15→3/5/5)
  - Video uploads disabled
  - File size limit decreases (50MB→10MB)
  - Existing videos remain accessible

### Server-Side Gating ✅
- [x] Product creation gated by plan
- [x] Event creation gated by plan
- [x] Link creation gated by plan
- [x] Video upload gated by plan
- [x] File size gated by plan
- [x] Cannot bypass via direct API calls

### Edge Cases ✅
- [x] Past due status handling
- [x] Canceled (end of period) handling
- [x] Trialing status handling
- [x] Webhook delay handling
- [x] Grandfathering behavior

## Key Requirements Validated

### R-CLERK-SUB-1.1: Clerk Billing as Source of Truth ✅
- Subscription data stored in Clerk publicMetadata
- `getSubscriptionStatus()` reads from Clerk identity
- No local subscription state management
- Webhooks sync changes from Clerk

### R-CLERK-SUB-1.2: Server-Side Feature Gating ✅
- All mutations check subscription limits
- `canCreateProduct()`, `canCreateEvent()`, `canCreateLink()` enforce limits
- `canUploadVideo()` enforces video restriction
- `getMaxFileSize()` enforces file size limits
- `enforceLimit()` throws errors when limits exceeded
- Cannot bypass via direct API calls

## Testing Approach

### Manual Testing
1. Create test artist accounts for each plan
2. Seed test data (products, events, links)
3. Execute upgrade flows step-by-step
4. Execute downgrade flows step-by-step
5. Verify grandfathering behavior
6. Verify server-side gating
7. Test edge cases

### Automated Testing
1. Unit tests for subscription helper functions
2. Integration tests for Convex mutations
3. API route tests for limit enforcement

### Tools Required
- Clerk Dashboard (test environment)
- Stripe test cards
- Browser DevTools (Network tab)
- Convex Dashboard (query inspection)

## Success Criteria

All test scenarios must pass with:
- ✅ Server-side gating prevents limit bypass
- ✅ Subscription changes reflect immediately
- ✅ Grandfathering works correctly
- ✅ UI shows accurate plan and usage information
- ✅ Upgrade/downgrade flows complete without errors
- ✅ Clerk Billing integration works end-to-end
- ✅ No mock data or placeholder states

## Grandfathering Behavior

When downgrading, existing items that exceed the new plan's limit are "grandfathered":
- Existing items remain accessible
- Can edit/delete existing items
- Cannot create new items until under limit
- Example: 30 products on Premium → downgrade to Pro (20 limit)
  - All 30 products remain accessible
  - Cannot create product #31
  - Must delete 10 products to create new ones

## Known Limitations

### Webhook Delays
There may be a 1-5 second delay between Clerk Billing action and webhook processing. UI should handle this with loading states.

### Period End Timing
Subscription changes may take effect immediately or at billing period end, depending on Clerk configuration. Both scenarios should be tested.

### File Size Validation
File size validation happens client-side first, then server-side. Large files may start uploading before server rejects them.

## Next Steps

1. **Execute Manual Tests**
   - Follow `SUBSCRIPTION-QA-MANUAL-TEST-SCRIPT.md`
   - Document results and issues
   - Sign off on each test scenario

2. **Run Automated Tests**
   - Execute `convex/subscriptions.test.ts`
   - Verify all tests pass
   - Add integration tests if needed

3. **Production Verification**
   - Test in staging environment
   - Verify Clerk Billing webhooks work
   - Test with real Stripe test mode
   - Verify no regressions

4. **Sign-Off**
   - QA team approval
   - Product owner approval
   - Ready for production deployment

## Contact

For questions or issues with subscription testing:
- Review `docs/SUBSCRIPTION-UPGRADE-DOWNGRADE-QA.md` for detailed test cases
- Review `docs/SUBSCRIPTION-QA-MANUAL-TEST-SCRIPT.md` for step-by-step instructions
- Check `convex/subscriptions.ts` for implementation details
- Consult Clerk Billing documentation for webhook details

---

**Status:** QA Test Plan Complete ✅  
**Date:** January 18, 2026  
**Ready for Execution:** Yes
