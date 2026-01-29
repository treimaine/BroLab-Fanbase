# Subscription Plans - BroLab Fanbase

## Overview

BroLab Fanbase offers 2 subscription plans for artists: **Free** and **Premium**.

Subscription management is handled by **Clerk Billing** (source of truth), with server-side feature gating in Convex.

---

## Plans Comparison

| Feature | Free | Premium |
|---------|------|---------|
| **Price** | $0/month | $19.99/month |
| **Products** | 5 | Unlimited |
| **Events** | 5 | Unlimited |
| **Custom Links** | 5 | Unlimited |
| **Video Uploads** | ❌ Audio only | ✅ Enabled |
| **Max File Size** | 50MB | 500MB |
| **Support** | Community | Priority |

---

## Free Plan

**Perfect for getting started**

### Limits
- Max 5 products
- Max 5 events
- Max 5 custom links
- Audio uploads only (no video)
- Max file size: 50MB

### Use Cases
- New artists testing the platform
- Artists with small catalogs
- Audio-only content creators

---

## Premium Plan ($19.99/month)

**For serious artists**

### Features
- **Unlimited products** - No limit on digital products
- **Unlimited events** - Create as many events as needed
- **Unlimited custom links** - Full Linktree-style flexibility
- **Video uploads enabled** - Upload music videos, behind-the-scenes, etc.
- **500MB max file size** - High-quality video support
- **Priority support** - Faster response times
- **Advanced analytics** - Coming soon

### Use Cases
- Professional artists with large catalogs
- Artists selling video content
- Artists with frequent events/tours
- Artists needing extensive link management

---

## Upgrade Flow

### Free → Premium

**What Changes:**
- Products: 5 → Unlimited
- Events: 5 → Unlimited
- Links: 5 → Unlimited
- Video uploads: ❌ → ✅
- File size: 50MB → 500MB

**How to Upgrade:**
1. Navigate to Dashboard → Billing
2. Click "Upgrade to Premium - $19.99/month"
3. Complete payment via Clerk Billing
4. Limits update immediately

---

## Downgrade Flow

### Premium → Free

**What Changes:**
- Products: Unlimited → 5
- Events: Unlimited → 5
- Links: Unlimited → 5
- Video uploads: ✅ → ❌
- File size: 500MB → 50MB

**Grandfathering:**
- Existing items beyond the limit remain accessible
- Can view/edit/delete existing items
- Cannot create new items until under limit
- Example: 10 products on Premium → downgrade to Free
  - All 10 products remain accessible
  - Cannot create product #11
  - Must delete 5 products to create new ones

**How to Downgrade:**
1. Navigate to Dashboard → Billing
2. Click "Manage Subscription"
3. Select "Cancel Subscription" in Clerk portal
4. Confirm cancellation

---

## Server-Side Gating

All limits are enforced server-side in Convex mutations to prevent bypass.

### Product Creation
```typescript
// convex/products.ts
const existingProducts = await ctx.db.query("products")...
const canCreate = await canCreateProduct(ctx, existingProducts.length);
enforceLimit(canCreate, "products");
```

### Video Upload
```typescript
if (args.type === "video") {
  const canUpload = await canUploadVideo(ctx);
  if (!canUpload) {
    throw new Error("Video uploads require Premium plan");
  }
}
```

### File Size
```typescript
const maxSize = await getMaxFileSize(ctx);
if (args.fileSize > maxSize) {
  throw new Error(`File size exceeds your plan limit`);
}
```

---

## Implementation Details

### Source of Truth
- **Clerk Billing** stores subscription data in `publicMetadata.subscription`
- Convex reads this data via `ctx.auth.getUserIdentity()`
- No local subscription state management

### Data Structure
```typescript
// Clerk publicMetadata.subscription
{
  plan: "free" | "premium",
  status: "active" | "canceled" | "past_due" | "trialing" | "none",
  currentPeriodEnd?: number // timestamp
}
```

### Plan Limits (convex/subscriptions.ts)
```typescript
export const PLAN_LIMITS = {
  free: {
    maxProducts: 5,
    maxEvents: 5,
    maxLinks: 5,
    canUploadVideo: false,
    maxFileSize: 50 * 1024 * 1024, // 50MB
  },
  premium: {
    maxProducts: Infinity,
    maxEvents: Infinity,
    maxLinks: Infinity,
    canUploadVideo: true,
    maxFileSize: 500 * 1024 * 1024, // 500MB
  },
}
```

---

## Testing

### Manual Testing Checklist

**Free Plan:**
- [ ] Can create up to 5 products
- [ ] Cannot create 6th product (shows upgrade prompt)
- [ ] Can create up to 5 events
- [ ] Cannot create 6th event
- [ ] Can create up to 5 links
- [ ] Cannot create 6th link
- [ ] Video upload option is disabled
- [ ] Can upload files up to 50MB
- [ ] Cannot upload files > 50MB

**Premium Plan:**
- [ ] Can create unlimited products
- [ ] Can create unlimited events
- [ ] Can create unlimited links
- [ ] Video upload option is enabled
- [ ] Can upload files up to 500MB
- [ ] Cannot upload files > 500MB

**Upgrade Flow:**
- [ ] Free → Premium upgrade completes successfully
- [ ] Limits update immediately after upgrade
- [ ] Can create items beyond previous limits
- [ ] Video upload becomes available

**Downgrade Flow:**
- [ ] Premium → Free downgrade completes
- [ ] Over-limit items remain accessible (grandfathering)
- [ ] Cannot create new items while over limit
- [ ] Can create new items after getting under limit

---

## FAQ

### Can I cancel anytime?
Yes, you can cancel your Premium subscription at any time from your account settings. No questions asked.

### What happens to my content if I downgrade?
All existing content remains accessible. You just can't create new items until you're under the Free plan limits.

### Do I lose video uploads if I downgrade?
You can't upload new videos on the Free plan, but existing videos remain accessible to your fans.

### Is there a trial period?
Check Clerk Billing settings for trial period availability.

### How do I upgrade?
Click "Upgrade to Premium" in your dashboard billing section. Payment is processed securely via Clerk Billing.

---

## Support

For subscription issues:
- Check Clerk Dashboard for subscription status
- Review `convex/subscriptions.ts` for implementation details
- Contact support via the dashboard

---

**Last Updated:** January 2026  
**Plans:** Free ($0) | Premium ($19.99/month)
