# Design Document: BroLab Fanbase

## Overview

BroLab Fanbase est une plateforme SaaS mobile-first permettant aux artistes de créer leur hub personnel et aux fans de suivre leurs artistes favoris. L'architecture suit le pattern moderne Next.js App Router avec une séparation claire entre les couches présentation, logique métier et données.

### Principes Architecturaux

- **Mobile-first**: UI optimisée pour mobile avec bottom nav, puis adaptée desktop avec sidebar
- **Server Components par défaut**: Utilisation maximale des RSC pour performance et SEO
- **Client Components ciblés**: Uniquement pour interactivité (forms, toggles, navigation state)
- **Type-safe end-to-end**: TypeScript strict + Convex schema validation + Zod pour forms
- **Separation of concerns**: Routes groupées par contexte (marketing, auth, fan, artist, public)

### Clarification RSC vs Client Components (MVP)

- **Marketing/Public pages** (Landing + Public Artist Hub) can be Server Components by default for SEO/perf.
- **Dashboards** (Fan/Artist) SHALL be primarily **Client Components** because they depend on:
  - Clerk client-side user context (role, session)
  - Convex React hooks (useQuery/useMutation)
  - Interactive UI (forms, upload, toggles, tabs, bottom nav state)

This prevents architecture drift and avoids fighting RSC boundaries during MVP.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL (Edge)                           │
├─────────────────────────────────────────────────────────────────┤
│  Next.js 14 App Router                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  (marketing)│  │   (auth)    │  │  (public)   │             │
│  │  Landing    │  │  Sign-in    │  │ [artistSlug]│             │
│  └─────────────┘  │  Sign-up    │  └─────────────┘             │
│                   └─────────────┘                               │
│  ┌─────────────────────────┐  ┌─────────────────────────┐      │
│  │        (fan)            │  │       (artist)          │      │
│  │  /me → redirect         │  │  /dashboard             │      │
│  │  /me/[username]/*       │  │  /dashboard/*           │      │
│  └─────────────────────────┘  └─────────────────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│                      MIDDLEWARE (Clerk)                         │
│  - Route protection based on auth + role                        │
│  - Redirect logic for /me → /me/[username]                      │
├─────────────────────────────────────────────────────────────────┤
│                         SERVICES                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │  CLERK   │  │  CONVEX  │  │  STRIPE  │                      │
│  │  Auth    │  │  Backend │  │ Checkout │                      │
│  │  Billing │  │  Storage │  │ Webhooks │                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

### Route Groups Structure

```
src/app/
├── (marketing)/
│   ├── layout.tsx          # Minimal navbar layout
│   └── page.tsx            # Landing page
├── (auth)/
│   ├── layout.tsx          # Centered auth layout
│   ├── sign-in/[[...sign-in]]/page.tsx
│   ├── sign-up/[[...sign-up]]/page.tsx
│   └── onboarding/page.tsx # Role selection
├── (fan)/
│   ├── layout.tsx          # AppShell with fan nav
│   └── me/
│       ├── page.tsx        # Redirect to /me/[username]
│       └── [username]/
│           ├── page.tsx    # Feed
│           ├── purchases/page.tsx
│           └── billing/page.tsx
├── (artist)/
│   ├── layout.tsx          # AppShell with artist nav
│   └── dashboard/
│       ├── page.tsx        # Overview
│       ├── profile/page.tsx
│       ├── links/page.tsx
│       ├── events/page.tsx
│       ├── products/page.tsx
│       └── billing/page.tsx
├── (public)/
│   └── [artistSlug]/page.tsx  # Public hub
├── api/
│   └── stripe/
│       ├── checkout/route.ts
│       └── webhook/route.ts
├── layout.tsx              # Root layout (providers)
└── globals.css             # Theme tokens
```

## Components and Interfaces

### Core Layout Components

```typescript
// src/components/layout/app-shell.tsx
interface AppShellProps {
  children: React.ReactNode;
  role: "fan" | "artist";
}

// Renders:
// - Desktop (>= lg): Sidebar + main content
// - Mobile (< lg): TopBar + main content + BottomNav
```

```typescript
// src/components/layout/sidebar.tsx
interface SidebarProps {
  role: "fan" | "artist";
  user: {
    name: string;
    avatar?: string;
    username: string;
  };
  currentPath: string;
}

// Navigation items based on role
const fanNavItems = [
  { href: "/me/{username}", icon: Home, label: "Feed" },
  { href: "/me/{username}/purchases", icon: ShoppingBag, label: "Purchases" },
  { href: "/me/{username}/billing", icon: CreditCard, label: "Billing" },
];

const artistNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/profile", icon: User, label: "Profile & Bio" },
  { href: "/dashboard/links", icon: Link, label: "Links" },
  { href: "/dashboard/events", icon: Calendar, label: "Events" },
  { href: "/dashboard/products", icon: Music, label: "Products" },
  { href: "/dashboard/billing", icon: Wallet, label: "Billing" },
];
```

```typescript
// src/components/layout/bottom-nav.tsx
interface BottomNavProps {
  role: "fan" | "artist";
  currentPath: string;
}

// Fixed bottom navigation for mobile
// **Icons + short labels** (app-like, iOS/Android)
// Max 4-5 items
```

```typescript
// src/components/layout/top-bar.tsx
interface TopBarProps {
  title?: string;
  showBurger?: boolean;
  onBurgerClick?: () => void;
  actions?: React.ReactNode;
}

// Mobile top bar with brand, burger menu, optional actions
```

### Page-Specific Components

```typescript
// Landing Page
// src/components/marketing/hero-section.tsx
interface HeroSectionProps {
  onJoinBeta: (email: string) => Promise<void>;
}

// src/components/marketing/feature-grid.tsx
interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}
```

```typescript
// Public Hub
// src/components/hub/hub-header.tsx
interface HubHeaderProps {
  artist: {
    name: string;
    bio: string;
    avatarUrl: string;
    coverUrl: string;
    socials: Social[];
  };
  isFollowing: boolean;
  onFollowToggle: () => void;
}

// src/components/hub/drops-list.tsx
interface Drop {
  id: string;
  title: string;
  type: "music" | "video" | "merch";
  imageUrl: string;
  price?: number;
  releaseDate: string;
}

// src/components/hub/events-list.tsx
interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  city: string;
  ticketUrl: string;
  imageUrl?: string;
  status: "upcoming" | "sold-out" | "past";
}
```

```typescript
// Artist Dashboard
// src/components/dashboard/stats-card.tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
}

// src/components/dashboard/setup-checklist.tsx
interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  href: string;
}

// src/components/dashboard/balance-card.tsx
interface BalanceCardProps {
  available: number;
  pending: number;
  lastPayout: number;
  currency: string;
}
```

```typescript
// Fan Dashboard
// src/components/feed/feed-card.tsx
interface FeedCardProps {
  post: {
    id: string;
    artist: { name: string; avatarUrl: string; slug: string };
    content: string;
    imageUrl?: string;
    type: "release" | "event" | "merch" | "update";
    createdAt: string;
    likes: number;
    comments: number;
  };
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

// src/components/feed/community-widget.tsx
interface CommunityWidgetProps {
  followingCount: number;
  eventsCount: number;
}
```

### Form Components

```typescript
// src/components/forms/profile-form.tsx
interface ProfileFormData {
  displayName: string;
  slug: string;
  bio: string;
  avatarUrl: string;
  socials: {
    platform: string;
    url: string;
    active: boolean;
  }[];
}

// src/components/forms/product-form.tsx
interface ProductFormData {
  title: string;
  description: string;
  type: "music" | "video";
  priceUSD: number;
  visibility: "public" | "private";
  coverImageUrl: string;
  file?: File;
}

// src/components/forms/event-form.tsx
interface EventFormData {
  title: string;
  date: string;
  venue: string;
  city: string;
  ticketUrl: string;
  imageUrl?: string;
}
```

## UI Fidelity Contract (SuperDesign)

The MVP UI MUST match the provided SuperDesign screenshots as closely as possible.

### Constraints

- Use **shadcn/ui** components as primitives (Button, Card, Input, Tabs, Sheet, Avatar, Switch, Separator, Badge).
- Theme tokens in `globals.css` are the single source of truth (light + dark).
- Do NOT introduce additional UI component libraries.
- Styling MUST keep:
  - generous radius (rounded-2xl / rounded-full where relevant)
  - subtle borders (`border-border/50`)
  - minimal shadows, hover elevation only
  - serif headings + clean sans body
  - accent lavender/purple for highlight + ring

### Component Defaults (MVP)

- Button: pill style as default for primary actions
- Card: soft border, rounded-2xl, hover shadow
- Input: rounded-full on landing, subtle bg, accent ring
- Tabs: editorial underline style
- Sheet: clean full-height drawer, no heavy shadow
- Switch: minimal toggle, consistent with SuperDesign

## Data Models

### Convex Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users synced from Clerk
  users: defineTable({
    clerkUserId: v.string(),
    role: v.union(v.literal("artist"), v.literal("fan")),
    displayName: v.string(),
    usernameSlug: v.string(),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkUserId"])
    .index("by_username", ["usernameSlug"]),

  // Waitlist for beta signups
  waitlist: defineTable({
    email: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  // Artist profiles
  artists: defineTable({
    ownerUserId: v.id("users"),
    artistSlug: v.string(),
    displayName: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    socials: v.array(
      v.object({
        platform: v.string(),
        url: v.string(),
        active: v.boolean(),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerUserId"])
    .index("by_slug", ["artistSlug"]),

  // Artist links (Linktree-style)
  links: defineTable({
    artistId: v.id("artists"),
    title: v.string(),
    url: v.string(),
    type: v.string(), // "latest-release", "instagram", "youtube", etc.
    active: v.boolean(),
    order: v.number(),
    createdAt: v.number(),
  }).index("by_artist", ["artistId"]),

  // Events/Tours
  events: defineTable({
    artistId: v.id("artists"),
    title: v.string(),
    date: v.number(), // timestamp
    venue: v.string(),
    city: v.string(),
    ticketUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    ticketsSold: v.number(),
    revenue: v.number(),
    status: v.union(
      v.literal("upcoming"),
      v.literal("sold-out"),
      v.literal("past")
    ),
    createdAt: v.number(),
  }).index("by_artist", ["artistId"]),

  // Digital products
  products: defineTable({
    artistId: v.id("artists"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("music"), v.literal("video")),
    priceUSD: v.number(),
    coverImageUrl: v.optional(v.string()),
    visibility: v.union(v.literal("public"), v.literal("private")),
    fileStorageId: v.optional(v.id("_storage")),
    contentType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_artist", ["artistId"]),

  // Fan follows
  follows: defineTable({
    fanUserId: v.id("users"),
    artistId: v.id("artists"),
    createdAt: v.number(),
  })
    .index("by_fan", ["fanUserId"])
    .index("by_artist", ["artistId"])
    .index("by_fan_artist", ["fanUserId", "artistId"]),

  // Orders
  orders: defineTable({
    fanUserId: v.id("users"),
    totalUSD: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    stripeSessionId: v.string(),
    createdAt: v.number(),
  })
    .index("by_fan", ["fanUserId"])
    .index("by_stripe_session", ["stripeSessionId"]),

  // Order items
  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.id("products"),
    type: v.union(v.literal("music"), v.literal("video")),
    priceUSD: v.number(),
    fileStorageId: v.optional(v.id("_storage")), // snapshot at purchase time
    createdAt: v.number(),
  }).index("by_order", ["orderId"]),

  // Stripe webhook idempotency
  processedEvents: defineTable({
    provider: v.literal("stripe"),
    eventId: v.string(),
    processedAt: v.number(),
  }).index("by_event", ["provider", "eventId"]),

  // Download logs (optional)
  downloads: defineTable({
    fanUserId: v.id("users"),
    productId: v.id("products"),
    orderId: v.id("orders"),
    timestamp: v.number(),
  }).index("by_fan", ["fanUserId"]),
});
```

### Reserved Slugs

```typescript
// src/lib/constants.ts
export const RESERVED_SLUGS = [
  "me",
  "dashboard",
  "sign-in",
  "sign-up",
  "api",
  "admin",
  "settings",
  "help",
  "support",
  "about",
  "terms",
  "privacy",
  "contact",
] as const;

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase() as any);
}
```

### TypeScript Types

```typescript
// src/types/index.ts
export type UserRole = "artist" | "fan";

export interface User {
  id: string;
  clerkUserId: string;
  role: UserRole;
  displayName: string;
  usernameSlug: string;
  avatarUrl?: string;
}

export interface Artist {
  id: string;
  ownerUserId: string;
  artistSlug: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  socials: Social[];
}

export interface Social {
  platform: string;
  url: string;
  active: boolean;
}

export interface Product {
  id: string;
  artistId: string;
  title: string;
  description?: string;
  type: "music" | "video";
  priceUSD: number;
  coverImageUrl?: string;
  visibility: "public" | "private";
  fileStorageId?: string;
}

export interface Order {
  id: string;
  fanUserId: string;
  totalUSD: number;
  status: "pending" | "paid" | "failed" | "refunded";
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  type: "music" | "video";
  priceUSD: number;
  fileStorageId?: string;
}
```

## File Upload & Download Flow (Convex Storage) — MVP

### Artist Upload Flow (Products)

MVP stores uploaded audio/video directly in **Convex File Storage**.

**Steps**
1. Artist creates a Product draft (title, type, price, visibility, coverImageUrl).
2. System requests an upload URL from Convex (upload URL flow is required for large files).
3. Client uploads the file to the returned upload URL.
4. Convex returns a `storageId` (`Id<"_storage">`).
5. System updates the product record with:
   - `fileStorageId = storageId`
   - `contentType`, `fileSize` (from file metadata or `_storage` lookup)

**Notes**
- Use upload URL flow to avoid request-size limits and support larger files.
- For MVP, allow only 1 file per product (no variants).

### Fan Download Flow (Ownership-gated)

Downloads MUST be protected by ownership verification.

**Steps**
1. Fan clicks "Download" on a purchased item.
2. System verifies:
   - fan is authenticated
   - order status = `paid`
   - an orderItem exists for (fanUserId, productId)
3. System generates a download URL from Convex File Storage using the stored `fileStorageId`.
4. System returns the URL to the client.
5. Client opens the URL to start the download.

**Security Rule**
- If verification fails, return 403 and DO NOT return any file URL.

### Stripe Connect / Payouts (MVP Scope)

**MVP Note:** Stripe Connect / payouts are out-of-scope for MVP. Billing pages show placeholders and future hooks only.

MVP implementation is limited to:
- showing subscription status (via Clerk Billing)
- showing transaction placeholders
- "Connect payouts" is a disabled CTA / Coming soon

## Auth, Role & Identity Rules (MVP)

### Clerk Integration (App Router - Current Best Practices)

**CRITICAL**: Always use the latest Clerk patterns for Next.js App Router.

#### Required Setup

1. **Middleware** (`middleware.ts` in `src/` or root):
   - Use `clerkMiddleware()` from `@clerk/nextjs/server`
   - **NEVER** use deprecated `authMiddleware()`

```typescript
// src/middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

2. **ClerkProvider** (wrap app in `app/layout.tsx`):
```typescript
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

3. **Clerk Components** (from `@clerk/nextjs`):
   - `<SignInButton>`, `<SignUpButton>`, `<UserButton>`
   - `<SignedIn>`, `<SignedOut>`
   - `<SignIn />`, `<SignUp />` for custom pages

4. **Server Functions** (from `@clerk/nextjs/server`):
   - `auth()` - get current user in Server Components/Route Handlers
   - `currentUser()` - get full user object

#### Environment Variables (Minimal)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
```

### Source of Truth

- Clerk is the source of truth for authentication and role:
  - role stored in `Clerk publicMetadata.role` ("fan" | "artist")
- Convex `users.role` is a synchronized mirror for querying and joins.

### Role Sync (MVP)

- On first sign-in or after onboarding, the system SHALL upsert a Convex `users` record:
  - clerkUserId
  - role (from Clerk publicMetadata.role)
  - displayName / usernameSlug / avatarUrl
- If role changes in Clerk, Convex SHALL be updated accordingly.

### Fan URL Identity Safety (Prevent IDOR)

- Even though routes include `/me/[username]`, the dashboard data MUST always be loaded using the authenticated Clerk userId.
- IF `[username]` in the URL does not match the authenticated user's usernameSlug:
  - THEN the system SHALL redirect to `/me/[authUsername]`.
- The `[username]` segment is for user-friendly URLs only and SHALL NOT authorize data access.

## Stripe Webhook Security (MVP)

- Webhook endpoint MUST verify Stripe signature before processing any event.
- Minimum supported event:
  - `checkout.session.completed` → create paid order + orderItems
- Idempotency MUST occur after signature verification and before order creation.
- No webhook payload data SHALL be trusted without verification.

## Secure Download URL Rules (MVP)

- Download URLs MUST be generated server-side (Convex action) after ownership verification.
- URLs MUST be short-lived and MUST NOT be stored in database.
- System SHALL NEVER return a file URL if ownership checks fail.

## Upload Limits (MVP)

To keep Convex storage/bandwidth under control during MVP:

- Accept only:
  - audio: mp3, wav
  - video: mp4
- Enforce max sizes:
  - audio <= 50MB
  - video <= 200MB
- If file exceeds limit, reject with a clear error message.
- Note: migrate large video storage to Cloudflare R2 later.



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Email Validation Rejects Invalid Formats

*For any* string that does not match a valid email format (missing @, invalid domain, etc.), submitting it to the waitlist form SHALL be rejected and no record SHALL be created in the database.

**Validates: Requirements 1.4**

### Property 2: Waitlist Email Round-Trip

*For any* valid email address, submitting it to the waitlist and then querying the waitlist SHALL return a record containing that exact email.

**Validates: Requirements 1.3**

### Property 3: Route Protection by Authentication and Role

*For any* protected route and user state combination:
- Unauthenticated users accessing /dashboard/* or /me/* SHALL be redirected to /sign-in
- Authenticated fans accessing /dashboard/* SHALL be redirected away
- Authenticated artists accessing /me/* (except public routes) SHALL be redirected away

**Validates: Requirements 2.5, 2.6, 2.8**

### Property 4: Role Selection Persistence

*For any* role selection ("artist" or "fan"), after a user selects a role, querying their Clerk publicMetadata SHALL return that exact role value.

**Validates: Requirements 2.4**

### Property 5: Artist Slug Resolution

*For any* valid artistSlug in the database, accessing /[artistSlug] SHALL return the corresponding artist's hub data. *For any* slug not in the database, accessing /[artistSlug] SHALL return a 404 response.

**Validates: Requirements 3.1, 3.7**

### Property 6: Follow Toggle Round-Trip

*For any* authenticated fan and artist pair, toggling follow status twice SHALL return to the original follow state (following → not following → following, or vice versa).

**Validates: Requirements 3.5**

### Property 7: Profile Data Round-Trip

*For any* valid profile data (displayName, slug, bio, socials), saving the profile and then fetching it SHALL return equivalent data.

**Validates: Requirements 5.4**

### Property 8: Slug Uniqueness Enforcement

*For any* artistSlug that already exists in the database, attempting to create or update another artist with the same slug SHALL fail with an error.

**Validates: Requirements 5.5**

### Property 9: Reserved Slug Rejection

*For any* slug in the reserved keywords list (me, dashboard, sign-in, sign-up, api, admin, settings), attempting to create an artist with that slug SHALL fail with an error.

**Validates: Requirements 15.7**

### Property 10: Fan Dashboard URL Contains Username

*For any* authenticated fan accessing /me, the redirect destination SHALL be /me/[username] where username matches the fan's usernameSlug.

**Validates: Requirements 9.1**

### Property 11: Theme Toggle Persistence

*For any* theme preference (light or dark), after toggling the theme, the preference SHALL be persisted and subsequent page loads SHALL apply that theme.

**Validates: Requirements 13.3**

### Property 12: File Upload Round-Trip

*For any* valid file uploaded via Convex File Storage, retrieving the file using the returned fileStorageId SHALL return the exact same file content.

**Validates: Requirements 16.4**

### Property 13: Product Record Contains FileStorageId After Upload

*For any* successful file upload, the associated product record SHALL contain a valid fileStorageId that can be used to retrieve the file.

**Validates: Requirements 16.5**

### Property 14: Download Ownership Verification

*For any* fan attempting to download a product:
- IF an orderItem exists linking the fan to the product with status "paid", THEN a valid file URL SHALL be returned
- IF no such orderItem exists, THEN no file URL SHALL be returned and a 403 error SHALL be shown

**Validates: Requirements 17.3, 17.4, 17.5**

### Property 15: Order Creation on Payment Success

*For any* Stripe webhook event with type "checkout.session.completed", an order record SHALL be created with status "paid" and corresponding orderItems.

**Validates: Requirements 18.2**

### Property 16: Webhook Idempotency

*For any* Stripe webhook event, processing the same eventId twice SHALL NOT create duplicate orders. The second processing SHALL be a no-op.

**Validates: Requirements 18.5**

## Error Handling

### Client-Side Errors

| Error Type | Handling Strategy | User Feedback |
|------------|-------------------|---------------|
| Form validation | Zod schema validation | Inline field errors via shadcn Form |
| Network timeout | Convex hooks + manual retry | Toast with retry button |
| 401 Unauthorized | Redirect to /sign-in | - |
| 403 Forbidden | Show error page | "You don't have access to this resource" |
| 404 Not Found | Show 404 page | "Page not found" |
| 500 Server Error | Show error boundary | "Something went wrong. Please try again." |

**Note (MVP):** No React Query for MVP. Convex hooks are the default data layer.

### Server-Side Errors

| Error Type | Handling Strategy | Logging |
|------------|-------------------|---------|
| Convex mutation failure | Return error object | Log to Convex dashboard |
| Stripe API error | Catch and return user-friendly message | Log with Stripe error code |
| Clerk auth error | Redirect to sign-in | Log auth failure reason |
| File upload failure | Return error with retry suggestion | Log file size and type |

### Webhook Error Handling

```typescript
// Stripe webhook error handling pattern
export async function POST(req: Request) {
  try {
    const event = await verifyStripeWebhook(req);
    
    // Check idempotency
    const processed = await ctx.db.query("processedEvents")
      .withIndex("by_event", q => q.eq("provider", "stripe").eq("eventId", event.id))
      .first();
    
    if (processed) {
      return new Response("Already processed", { status: 200 });
    }
    
    // Process event
    await handleStripeEvent(event);
    
    // Mark as processed
    await ctx.db.insert("processedEvents", {
      provider: "stripe",
      eventId: event.id,
      processedAt: Date.now(),
    });
    
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Webhook error", { status: 400 });
  }
}
```

## Testing Strategy

### Dual Testing Approach

This project uses both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all valid inputs

### Testing Framework

- **Unit/Integration Tests**: Vitest + React Testing Library
- **Property-Based Tests**: fast-check (JavaScript PBT library)
- **E2E Tests**: Playwright (optional, for critical flows)

### Property-Based Testing Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});

// Property test example
import { fc } from "fast-check";

describe("Email Validation", () => {
  // Feature: brolab-fanbase, Property 1: Email Validation Rejects Invalid Formats
  it("should reject all invalid email formats", () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => !isValidEmailFormat(s)),
        (invalidEmail) => {
          const result = validateEmail(invalidEmail);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Organization

```
src/
├── test/
│   ├── setup.ts              # Test setup and mocks
│   ├── utils.ts              # Test utilities
│   └── generators.ts         # fast-check generators
├── components/
│   └── __tests__/
│       ├── feed-card.test.tsx
│       └── stats-card.test.tsx
├── lib/
│   └── __tests__/
│       ├── slugify.test.ts
│       ├── slugify.property.test.ts
│       └── validation.property.test.ts
convex/
└── __tests__/
    ├── users.test.ts
    ├── artists.test.ts
    └── orders.property.test.ts
```

### Test Coverage Requirements

| Area | Unit Tests | Property Tests |
|------|------------|----------------|
| Slug validation | Edge cases (empty, special chars) | All reserved slugs rejected |
| Email validation | Common invalid formats | All invalid formats rejected |
| Follow toggle | Specific user/artist pairs | Round-trip for any pair |
| Profile save | Specific profile data | Round-trip for any valid data |
| Webhook idempotency | Duplicate event scenario | Any event processed once |
| Download auth | Owned/not-owned scenarios | Ownership verification for any pair |

### Minimum Test Iterations

- Property-based tests: **100 iterations minimum** per property
- Each property test must reference its design document property number
- Tag format: `Feature: brolab-fanbase, Property {number}: {property_text}`

### MVP Test Scope (Pragmatic)

For MVP, implement tests only for critical correctness:
- Reserved slug rejection (Property 9)
- /me → /me/[username] redirect (Property 10)
- Download ownership verification (Property 14)
- Webhook idempotency (Property 16)

Property-based tests are limited to these critical paths to keep velocity high.


## Media Player System (Audio/Video) — MVP

### Goals
- Provide a global, persistent audio player across routes (fan/artist/public).
- Match SuperDesign interactions (hover play overlay, featured track card).
- Keep implementation compatible with Next.js App Router + Clerk + Convex hooks.

### High-Level Architecture
- Client-only player state store (single source of truth).
- One <audio> element controlled by the store.
- Convex functions provide ephemeral playable URLs from fileStorageId.

### Key Components (DO NOT RENAME)
- `FeaturedTrackCard` (functional; controls global player)
- `MediaCardOverlayButton` (Play/Pause overlay used on drops/feed cards)
- `MiniPlayerBar` (optional MVP; persistent bottom bar on dashboards)
- `VideoModal` (MVP viewer for video products)

### Player State (Concept)
State fields:
- `currentTrack: { id, title, artistName, artworkUrl?, fileStorageId?, mediaType: "audio" | "video" } | null`
- `status: "idle" | "loading" | "playing" | "paused" | "error"`
- `currentTime`, `duration`
- `volume`, `muted`
- `queue: track[]` + `queueIndex`

Actions:
- `loadAndPlay(track)`
- `togglePlayPause()`
- `seek(timeSeconds)`
- `next()`, `prev()`
- `setVolume(v)`

### URL Resolution (Convex)
- Convex server function: `files.getPlayableUrl({ storageId }) -> string`
- For gated content:
  - `downloads.getDownloadUrl(...)` remains ownership-protected
- Public streaming uses `getPlayableUrl` only when visibility="public".

### UI Behavior Details

#### 1) Hover Play/Pause Overlay (Cards)
- Media cards (drops/feed/products) use `group` hover:
  - Overlay fades in on hover (desktop) and appears on tap (mobile)
  - If track is current and playing => show Pause icon
  - Else => show Play icon
- Overlay button is centered, rounded-full, slightly blurred background.

#### 2) FeaturedTrackCard (Functional)
- Must:
  - Display title + artist
  - Play/Pause button controls global player
  - Progress bar reflects current playback and supports seeking (MVP: clickable bar)
- Visual style: match SuperDesign gradient card; use theme tokens; keep typography contract.

#### 3) Video Playback
- Video items:
  - Open `VideoModal` with <video controls>
  - On open: pause global audio (MVP default)
  - On close: keep audio paused (simple rule)

### MVP Tradeoffs
- No waveform required for MVP (progress bar only).
- Queue can be 1-item initially, but API should support future expansion.

### Correctness Properties (Media Player)

#### Property MP1: Single Active Playback
*For any* two media items A and B, starting playback for item B SHALL automatically pause item A. Only one media item SHALL play at a time.

**Validates: Requirements 19.1**

#### Property MP2: FeaturedTrackCard Reflects Global State
*For any* track displayed in FeaturedTrackCard, IF that track is the current track AND status is "playing", THEN FeaturedTrackCard SHALL show Pause button. IF status is "paused" or track is not current, THEN it SHALL show Play button.

**Validates: Requirements 19.3**

#### Property MP3: Overlay Control Reflects State
*For any* media card with overlay controls, the overlay SHALL show Play when the item is not currently playing, and Pause when the item is currently playing.

**Validates: Requirements 19.3**
