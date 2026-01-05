# BroLab Fanbase - Backend PRD

## Project Overview

BroLab Fanbase is a mobile-first platform enabling artists to create their personal hub ("one link") to connect directly with fans.

**Tagline:** "Your career isn't an algorithm."

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 14.x |
| Language | TypeScript | 5.x |
| Auth | Clerk | 6.36.x |
| Backend/DB | Convex | latest |
| Payments | Stripe | latest |
| File Storage | Convex File Storage | latest |
| Hosting | Vercel | - |

## Authentication (Clerk)

### Configuration

**Environment Variables:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### User Metadata

Role is stored in Clerk `publicMetadata`:
```typescript
interface ClerkPublicMetadata {
  role: "artist" | "fan";
}
```

### Auth Flow

1. User signs up via Clerk
2. Redirected to `/onboarding`
3. Selects role (Artist or Fan)
4. Role stored in Clerk `publicMetadata.role` via API
5. User synced to Convex `users` table
6. Redirected to appropriate dashboard

## API Endpoints (Next.js Route Handlers)

### POST /api/onboarding/set-role

**Purpose:** Set user role after signup

**Request:**
```typescript
{
  role: "artist" | "fan"
}
```

**Response:**
```typescript
// Success (200)
{ success: true, role: "artist" | "fan" }

// Error (400)
{ message: "Invalid role. Must be 'artist' or 'fan'" }

// Error (401)
{ message: "Unauthorized" }
```

**Implementation:**
```typescript
// Verify user is authenticated via Clerk
// Validate role is "artist" or "fan"
// Update Clerk publicMetadata.role
// Return success
```

### POST /api/stripe/checkout

**Purpose:** Create Stripe Checkout session for product purchase

**Request:**
```typescript
{
  productId: string; // Convex product ID
}
```

**Response:**
```typescript
// Success (200)
{ url: string } // Stripe Checkout URL

// Error (400)
{ message: "Product not found" }

// Error (401)
{ message: "Unauthorized" }
```

**Implementation:**
```typescript
// Verify user is authenticated
// Fetch product from Convex
// Create Stripe Checkout session with metadata
// Return checkout URL
```

### POST /api/stripe/webhook

**Purpose:** Handle Stripe webhook events

**Headers:**
- `stripe-signature`: Stripe webhook signature

**Events Handled:**
- `checkout.session.completed` - Create order in Convex

**Implementation:**
```typescript
// Verify Stripe signature
// Parse event
// Forward to Convex action for processing
// Return 200 OK
```

## Convex Database Schema

### Tables

#### users
```typescript
defineTable({
  clerkId: v.string(),
  email: v.string(),
  username: v.optional(v.string()),
  role: v.union(v.literal("artist"), v.literal("fan")),
  createdAt: v.number(),
})
  .index("by_clerkId", ["clerkId"])
  .index("by_email", ["email"])
```

#### artists
```typescript
defineTable({
  userId: v.id("users"),
  slug: v.string(),
  displayName: v.string(),
  bio: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
  coverUrl: v.optional(v.string()),
  socialLinks: v.optional(v.object({
    instagram: v.optional(v.string()),
    twitter: v.optional(v.string()),
    spotify: v.optional(v.string()),
    youtube: v.optional(v.string()),
    tiktok: v.optional(v.string()),
  })),
  createdAt: v.number(),
})
  .index("by_slug", ["slug"])
  .index("by_userId", ["userId"])
```

#### links
```typescript
defineTable({
  artistId: v.id("artists"),
  title: v.string(),
  url: v.string(),
  type: v.union(v.literal("music"), v.literal("social"), v.literal("merch"), v.literal("other")),
  isActive: v.boolean(),
  order: v.number(),
  createdAt: v.number(),
})
  .index("by_artistId", ["artistId"])
```

#### events
```typescript
defineTable({
  artistId: v.id("artists"),
  title: v.string(),
  date: v.number(), // Unix timestamp
  city: v.string(),
  venue: v.string(),
  ticketUrl: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  status: v.union(v.literal("upcoming"), v.literal("soldout"), v.literal("cancelled")),
  createdAt: v.number(),
})
  .index("by_artistId", ["artistId"])
  .index("by_date", ["date"])
```

#### products
```typescript
defineTable({
  artistId: v.id("artists"),
  title: v.string(),
  description: v.optional(v.string()),
  type: v.union(v.literal("music"), v.literal("video")),
  priceUSD: v.number(), // Price in cents
  visibility: v.union(v.literal("public"), v.literal("private")),
  fileStorageId: v.id("_storage"),
  contentType: v.string(),
  fileSize: v.number(),
  coverUrl: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_artistId", ["artistId"])
  .index("by_visibility", ["visibility"])
```

#### follows
```typescript
defineTable({
  fanUserId: v.id("users"),
  artistId: v.id("artists"),
  createdAt: v.number(),
})
  .index("by_fan", ["fanUserId"])
  .index("by_artist", ["artistId"])
  .index("by_fan_artist", ["fanUserId", "artistId"])
```

#### orders
```typescript
defineTable({
  fanUserId: v.id("users"),
  stripeSessionId: v.string(),
  status: v.union(v.literal("pending"), v.literal("paid"), v.literal("failed")),
  totalUSD: v.number(),
  createdAt: v.number(),
})
  .index("by_fan", ["fanUserId"])
  .index("by_stripeSession", ["stripeSessionId"])
```

#### orderItems
```typescript
defineTable({
  orderId: v.id("orders"),
  productId: v.id("products"),
  priceUSD: v.number(),
})
  .index("by_order", ["orderId"])
  .index("by_product", ["productId"])
```

#### waitlist
```typescript
defineTable({
  email: v.string(),
  createdAt: v.number(),
})
  .index("by_email", ["email"])
```

#### processedEvents
```typescript
defineTable({
  eventId: v.string(), // Stripe event ID
  processedAt: v.number(),
})
  .index("by_eventId", ["eventId"])
```

#### downloads
```typescript
defineTable({
  fanUserId: v.id("users"),
  productId: v.id("products"),
  downloadedAt: v.number(),
})
  .index("by_fan", ["fanUserId"])
  .index("by_product", ["productId"])
```

## Convex Functions

### users.ts

#### Query: getByClerkId
```typescript
args: { clerkId: v.string() }
returns: User | null
```

#### Mutation: upsertFromClerk
```typescript
args: { clerkId, email, username, role }
returns: userId
// Create or update user from Clerk data
```

### artists.ts

#### Query: getBySlug
```typescript
args: { slug: v.string() }
returns: Artist | null
```

#### Query: getByUserId
```typescript
args: { userId: v.id("users") }
returns: Artist | null
```

#### Mutation: create
```typescript
args: { userId, slug, displayName, bio?, avatarUrl?, coverUrl? }
returns: artistId
// Validate slug uniqueness and reserved slugs
```

#### Mutation: update
```typescript
args: { artistId, displayName?, bio?, avatarUrl?, coverUrl?, socialLinks? }
returns: artistId
// Verify ownership before update
```

### links.ts

#### Query: getByArtist
```typescript
args: { artistId: v.id("artists") }
returns: Link[]
// Ordered by 'order' field
```

#### Mutation: create
```typescript
args: { artistId, title, url, type }
returns: linkId
```

#### Mutation: update
```typescript
args: { linkId, title?, url?, type?, isActive? }
returns: linkId
```

#### Mutation: delete
```typescript
args: { linkId }
returns: void
```

#### Mutation: reorder
```typescript
args: { linkIds: v.array(v.id("links")) }
returns: void
// Update order field for each link
```

### events.ts

#### Query: getByArtist
```typescript
args: { artistId: v.id("artists") }
returns: Event[]
```

#### Query: getUpcoming
```typescript
args: { artistId: v.id("artists") }
returns: Event[]
// Filter by date > now, status = upcoming
```

#### Mutation: create
```typescript
args: { artistId, title, date, city, venue, ticketUrl?, imageUrl? }
returns: eventId
```

#### Mutation: update
```typescript
args: { eventId, title?, date?, city?, venue?, ticketUrl?, imageUrl?, status? }
returns: eventId
```

#### Mutation: delete
```typescript
args: { eventId }
returns: void
```

### products.ts

#### Query: getByArtist
```typescript
args: { artistId: v.id("artists") }
returns: Product[]
```

#### Query: getPublicByArtist
```typescript
args: { artistId: v.id("artists") }
returns: Product[]
// Filter by visibility = public
```

#### Query: getById
```typescript
args: { productId: v.id("products") }
returns: Product | null
```

#### Mutation: create
```typescript
args: { artistId, title, description?, type, priceUSD, visibility, fileStorageId, contentType, fileSize, coverUrl? }
returns: productId
```

#### Mutation: update
```typescript
args: { productId, title?, description?, priceUSD?, visibility?, coverUrl? }
returns: productId
```

#### Mutation: delete
```typescript
args: { productId }
returns: void
// Also delete associated file from storage
```

### follows.ts

#### Query: isFollowing
```typescript
args: { fanUserId: v.id("users"), artistId: v.id("artists") }
returns: boolean
```

#### Query: getFollowedArtists
```typescript
args: { fanUserId: v.id("users") }
returns: Artist[]
```

#### Query: getFollowerCount
```typescript
args: { artistId: v.id("artists") }
returns: number
```

#### Mutation: toggle
```typescript
args: { fanUserId: v.id("users"), artistId: v.id("artists") }
returns: { isFollowing: boolean }
// Create or delete follow record
```

### orders.ts

#### Query: getByFan
```typescript
args: { fanUserId: v.id("users") }
returns: Order[]
```

#### Query: getOrderItems
```typescript
args: { orderId: v.id("orders") }
returns: OrderItem[]
```

#### Mutation: createFromStripe
```typescript
args: { stripeSessionId, eventId, fanUserId, items: [{ productId, priceUSD }] }
returns: orderId
// Called from webhook handler
```

### waitlist.ts

#### Mutation: submit
```typescript
args: { email: v.string() }
returns: { success: boolean }
// Validate email format
// Check for duplicates
```

### files.ts

#### Action: generateUploadUrl
```typescript
args: {}
returns: string // Upload URL
// Verify user is authenticated
// Generate Convex storage upload URL
```

### downloads.ts

#### Action: getDownloadUrl
```typescript
args: { productId: v.id("products") }
returns: string | null

// Verification steps:
// 1. User is authenticated
// 2. User has orderItem for this product
// 3. Order status is "paid"
// If valid: generate file URL from fileStorageId
// If invalid: throw 403 error
// Optionally: log download
```

### stripe.ts

#### Action: handleWebhook
```typescript
args: { eventId, eventType, sessionId, metadata }
returns: { success: boolean }

// Idempotency check:
// 1. Query processedEvents by eventId
// 2. If exists, return early (already processed)
// 3. Process event (create order, orderItems)
// 4. Insert into processedEvents
```

## Stripe Integration

### Environment Variables
```env
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

### Checkout Session Creation
```typescript
const session = await stripe.checkout.sessions.create({
  mode: "payment",
  line_items: [{
    price_data: {
      currency: "usd",
      product_data: { name: product.title },
      unit_amount: product.priceUSD,
    },
    quantity: 1,
  }],
  metadata: {
    fanUserId: user._id,
    productId: product._id,
  },
  success_url: `${baseUrl}/me/${username}/purchases?success=true`,
  cancel_url: `${baseUrl}/${artistSlug}?cancelled=true`,
});
```

### Webhook Signature Verification
```typescript
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

### Idempotency Pattern
```typescript
// In Convex action:
// 1. Check if eventId exists in processedEvents
const existing = await ctx.runQuery(internal.stripe.isProcessed, { eventId });
if (existing) return { success: true, message: "Already processed" };

// 2. Process the event
await ctx.runMutation(internal.orders.createFromStripe, { ... });

// 3. Mark as processed
await ctx.runMutation(internal.stripe.markProcessed, { eventId });
```

## File Upload Flow

### Client-Side Validation
```typescript
// Before upload:
// 1. Check file type (mp3, wav, mp4)
// 2. Check file size (audio ≤50MB, video ≤200MB)
// 3. Show error if invalid
```

### Upload Process
```typescript
// 1. Request upload URL from Convex
const uploadUrl = await generateUploadUrl();

// 2. Upload file to URL
const response = await fetch(uploadUrl, {
  method: "POST",
  headers: { "Content-Type": file.type },
  body: file,
});

// 3. Get storageId from response
const { storageId } = await response.json();

// 4. Create product with storageId
await createProduct({ ..., fileStorageId: storageId });
```

## Download Flow (Ownership-Gated)

### Verification Steps
1. User is authenticated (Clerk)
2. Query orderItems where productId matches
3. Verify order status is "paid"
4. If all pass: generate download URL
5. If any fail: return 403 Forbidden

### Implementation
```typescript
// In Convex action:
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Unauthorized");

const user = await ctx.runQuery(internal.users.getByClerkId, { 
  clerkId: identity.subject 
});

const orderItem = await ctx.runQuery(internal.orders.getOrderItemByProduct, {
  fanUserId: user._id,
  productId: args.productId,
});

if (!orderItem) throw new Error("Not purchased");

const order = await ctx.runQuery(internal.orders.getById, { 
  orderId: orderItem.orderId 
});

if (order.status !== "paid") throw new Error("Payment not completed");

// Generate download URL
const product = await ctx.runQuery(internal.products.getById, { 
  productId: args.productId 
});
const url = await ctx.storage.getUrl(product.fileStorageId);

return url;
```

## Security Considerations

### Authentication
- All protected routes require valid Clerk session
- Role verification in middleware
- API routes verify auth before processing

### Authorization
- Artists can only modify their own data
- Fans can only access their own purchases
- Downloads require ownership verification

### Data Validation
- Zod schemas for all inputs
- Convex validators for all function args
- Reserved slug protection

### Webhook Security
- Stripe signature verification required
- Idempotency to prevent duplicate processing

## Error Handling

### API Responses
```typescript
// Success
{ success: true, data: ... }

// Client Error (400)
{ message: "Validation error description" }

// Unauthorized (401)
{ message: "Unauthorized" }

// Forbidden (403)
{ message: "Access denied" }

// Not Found (404)
{ message: "Resource not found" }

// Server Error (500)
{ message: "Internal server error" }
```

### Convex Errors
- Throw descriptive errors
- Client catches and displays via toast
- Log errors for debugging
