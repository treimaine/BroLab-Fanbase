# Subscription QA - Quick Reference Guide

## 🎯 Quick Start

1. **Read This First:** `SUBSCRIPTION-QA-SUMMARY.md`
2. **Detailed Test Cases:** `SUBSCRIPTION-UPGRADE-DOWNGRADE-QA.md`
3. **Step-by-Step Script:** `SUBSCRIPTION-QA-MANUAL-TEST-SCRIPT.md`

## 📊 Plan Limits at a Glance

| Feature | Free | Pro | Premium |
|---------|------|-----|---------|
| Products | 3 | 20 | Unlimited |
| Events | 5 | 20 | Unlimited |
| Links | 5 | 15 | Unlimited |
| Video Upload | ❌ | ✅ | ✅ |
| Max File Size | 10MB | 50MB | 200MB |

## 🔄 Upgrade Paths

```
Free → Pro → Premium
 ↓      ↓       ↓
(limits increase at each step)
```

## 📉 Downgrade Behavior

**Key Concept: Grandfathering**
- Existing items remain accessible
- Cannot create new items while over limit
- Must delete items to get under limit

**Example:**
```
Premium (30 products) → Pro (20 limit)
✅ All 30 products remain accessible
❌ Cannot create product #31
✅ Can edit/delete existing products
✅ After deleting 11 products (now at 19), can create new ones
```

## 🧪 Test Stripe Cards

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Decline |
| 4000 0000 0000 9995 | Insufficient Funds |

**Expiry:** Any future date (e.g., 12/34)  
**CVC:** Any 3 digits (e.g., 123)  
**ZIP:** Any 5 digits (e.g., 12345)

## 🔍 Quick Verification Checklist

### After Upgrade
- [ ] Plan badge updated
- [ ] Limits increased
- [ ] New features unlocked
- [ ] Can create more items
- [ ] File size limit increased

### After Downgrade
- [ ] Plan badge updated
- [ ] Limits decreased
- [ ] Over-limit items remain accessible
- [ ] Cannot create new items (if over limit)
- [ ] File size limit decreased

### Server-Side Gating
- [ ] Cannot bypass limits via API
- [ ] Error messages are clear
- [ ] Mutations enforce limits
- [ ] Queries return correct plan

## 🐛 Common Issues

### Issue: Plan doesn't update after payment
**Solution:** Wait 1-5 seconds for webhook processing. Check Clerk Dashboard for subscription status.

### Issue: Can't create items after downgrade
**Solution:** Check if over limit. Delete items to get under limit.

### Issue: Video upload still disabled after upgrade
**Solution:** Refresh page. Check Convex query returns `canUploadVideo: true`.

### Issue: File upload fails with size error
**Solution:** Check file size against plan limit. Verify plan is correct.

## 📝 Test Data Setup

### Test Accounts
```
Free Plan:  artist-free-test@example.com
Pro Plan:   artist-pro-test@example.com
Premium:    artist-premium-test@example.com
Password:   TestPass123!
```

### Seed Data
- **Free:** 2 products, 3 events, 4 links
- **Pro:** 15 products, 12 events, 10 links
- **Premium:** 30 products, 25 events, 20 links

## 🔧 DevTools Verification

### Check Subscription Status
1. Open DevTools → Network tab
2. Filter for Convex requests
3. Find `getCurrentSubscription` query
4. Verify response:
```json
{
  "plan": "pro",
  "status": "active",
  "limits": {
    "maxProducts": 20,
    "canUploadVideo": true,
    "maxFileSize": 52428800
  }
}
```

### Check Usage Counts
1. Find `getCurrentUsage` query
2. Verify response:
```json
{
  "productsCount": 15,
  "eventsCount": 12,
  "linksCount": 10
}
```

## 🎬 Quick Test Scenarios

### Scenario 1: Upgrade Free → Pro (5 min)
1. Sign in as Free plan artist
2. Try to create 4th product → blocked
3. Click "Upgrade to Pro"
4. Complete payment with test card
5. Verify can now create 20 products
6. Verify video upload enabled

### Scenario 2: Downgrade Premium → Pro (5 min)
1. Sign in as Premium artist (30 products)
2. Downgrade to Pro
3. Verify all 30 products still visible
4. Try to create product #31 → blocked
5. Delete 11 products (now at 19)
6. Verify can now create new products

### Scenario 3: Server-Side Gating (2 min)
1. Sign in as Free plan artist (3 products)
2. Open DevTools → Console
3. Try to bypass limit via API
4. Verify mutation fails with error
5. Verify product NOT created

## 📞 Support

**Questions?**
- Check detailed docs in `docs/` folder
- Review `convex/subscriptions.ts` for implementation
- Consult Clerk Billing documentation

**Issues?**
- Document in test results
- Include screenshots
- Note environment (local/staging/prod)

---

**Last Updated:** January 18, 2026  
**Version:** 1.0
