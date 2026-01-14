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
│                   │  Onboarding │                               │
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
│  - Role-based access control (artist vs fan)                    │
├─────────────────────────────────────────────────────────────────┤
│                         SERVICES                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │  CLERK   │  │  CONVEX  │  │  STRIPE  │                      │
│  │  Auth    │  │  Backend │  │ Checkout │                      │
│  │  Billing │  │  Storage │  │ Webhooks │                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

### Route Groups Structure (Implemented)

```
src/app/
├── (marketing)/
│   ├── layout.tsx          # Minimal navbar layout
│   └── page.tsx            # Landing page with waitlist
├── (auth)/
│   ├── sign-in/[[...sign-in]]/page.tsx
│   ├── sign-up/[[...sign-up]]/page.tsx
│   └── onboarding/page.tsx # Role selection (Artist/Fan)
├── (fan)/
│   └── me/
│       └── [username]/
│           ├── page.tsx    # Feed (placeholder)
│           ├── purchases/  # (planned)
│           └── billing/    # (planned)
├── (artist)/
│   ├── layout.tsx          # AppShell with artist nav
│   └── dashboard/
│       ├── page.tsx        # Overview with stats
│       ├── profile/page.tsx # Profile & Bio management
│       └── links/page.tsx  # Custom Links management
├── (public)/
│   └── [artistSlug]/page.tsx  # Public hub
├── api/
│   ├── onboarding/
│   │   └── set-role/route.ts  # Role assignment API
│   └── stripe/
│       ├── checkout/route.ts  # (planned)
│       └── webhook/route.ts   # (planned)
├── layout.tsx              # Root layout (providers)
├── page.tsx                # Redirect to (marketing)
└── globals.css             # Theme tokens
```

## Components (Implemented)

### Layout Components

```
src/components/layout/
├── app-shell.tsx       # Main layout (sidebar desktop / topbar+bottomnav mobile)
├── sidebar.tsx         # Desktop navigation sidebar
├── top-bar.tsx         # Mobile top bar with burger menu
├── bottom-nav.tsx      # Mobile bottom navigation
├── mobile-drawer.tsx   # Sheet drawer for mobile navigation
├── theme-provider.tsx  # next-themes provider
└── theme-toggle.tsx    # Light/dark mode toggle
```

### Marketing Components

```
src/components/marketing/
├── hero-section.tsx      # Landing hero with waitlist form
├── feature-grid.tsx      # 3-column feature showcase
├── footer.tsx            # Site footer
└── marketing-navbar.tsx  # Landing page navbar
```

### Hub Components (Public Artist Page)

```
src/components/hub/
├── hub-header.tsx        # Cover, avatar, bio, follow button, social icons
├── drops-list.tsx        # Latest Drops tab content
├── events-list.tsx       # Tour Dates tab content
└── artist-links-list.tsx # (DEPRECATED - not displayed on public hub)
```

### Dashboard Components

```
src/components/dashboard/
├── stats-card.tsx         # Metric display card
├── setup-checklist.tsx    # Onboarding progress checklist
├── create-content-card.tsx # Quick actions card
└── link-item.tsx          # Link row in links management
```

### Form Components

```
src/components/forms/
├── profile-form.tsx       # Artist profile editing
├── social-links-list.tsx  # Social links toggle list
└── add-link-dialog.tsx    # Dialog for adding custom links
```

### Player Components (Media Playback)

```
src/components/player/
├── global-player-provider.tsx  # Audio element manager (singleton)
├── featured-track-card.tsx     # Featured track with controls (DO NOT RENAME)
├── media-card-overlay.tsx      # Play/pause overlay for cards
├── video-modal.tsx             # Video playback modal
└── player-demo.tsx             # Demo/test component
```

### UI Components (shadcn/ui)

```
src/components/ui/
├── avatar.tsx      ├── badge.tsx       ├── button.tsx
├── card.tsx        ├── dialog.tsx      ├── dropdown-menu.tsx
├── form.tsx        ├── input.tsx       ├── label.tsx
├── select.tsx      ├── separator.tsx   ├── sheet.tsx
├── skeleton.tsx    ├── sonner.tsx      ├── switch.tsx
└── tabs.tsx
```

### Providers

```
src/components/providers/
└── convex-client-provider.tsx  # ConvexProviderWithClerk wrapper
```

## Public Hub — Layout (UPDATED)

> **IMPORTANT**: Linktree-style links display has been REMOVED from Public Hub.

### Placement in page hierarchy
Public Hub layout order:
1. HubHeader (cover/avatar/follow/social icon pills from `artists.socials[]`)
2. Tabs: Latest Drops / Tour Dates
3. Tab content

### Social Icons
- Social icon pills are driven by `artists.socials[]` (managed in Profile & Bio → Social Links)
- NO separate links list is displayed on the Public Hub

## Dashboard — Custom Links

### Purpose
The `/dashboard/links` page manages "Custom Links" for merch, booking, press kit, newsletter, etc.
These links are NOT displayed on the Public Hub (reserved for future use).

### UI Copy
- Page title: "Custom Links"
- Helper text: "Use this for merch, booking, press kit, newsletter, etc. Social platforms are managed in Profile & Bio → Social Links."

### URL Domain Validation (Anti-Duplicate)
The system SHALL reject URLs pointing to social/streaming platforms already managed in Social Links.

**Blocked domains (defined in `src/lib/constants.ts`):**
- instagram.com
- x.com, twitter.com
- youtube.com, youtu.be
- spotify.com, open.spotify.com
- tiktok.com
- soundcloud.com
- music.apple.com
- facebook.com
- twitch.tv

**Error message:** "Manage social links in Profile & Bio → Social Links."

### Validation Flow
1. **UI (client-side)**: `isSocialPlatformUrl()` from constants.ts
2. **Backend (Convex mutation)**: Re-validate URL domain before insert/update
3. **Feedback**: Toast error with redirect suggestion

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

### Convex Schema (Implemented)

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

  // Artist custom links (NOT displayed on Public Hub)
  links: defineTable({
    artistId: v.id("artists"),
    title: v.string(),
    url: v.string(),
    type: v.string(),
    active: v.boolean(),
    order: v.number(),
    createdAt: v.number(),
  }).index("by_artist", ["artistId"]),

  // Events/Tours
  events: defineTable({
    artistId: v.id("artists"),
    title: v.string(),
    date: v.number(),
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
    fileStorageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  }).index("by_order", ["orderId"]),

  // Stripe webhook idempotency
  processedEvents: defineTable({
    provider: v.literal("stripe"),
    eventId: v.string(),
    processedAt: v.number(),
  }).index("by_event", ["provider", "eventId"]),

  // Download logs
  downloads: defineTable({
    fanUserId: v.id("users"),
    productId: v.id("products"),
    orderId: v.id("orders"),
    timestamp: v.number(),
  }).index("by_fan", ["fanUserId"]),
});
```

### Convex Functions (Implemented)

| File | Functions | Status |
|------|-----------|--------|
| `users.ts` | upsertFromClerk, getByClerkId, getCurrentUser | ✅ |
| `waitlist.ts` | add, getAll | ✅ |
| `artists.ts` | getBySlug, getByOwner, getCurrentArtist, create, update, checkSlugAvailability | ✅ |
| `links.ts` | getByArtist, getActiveByArtist, getCurrentArtistLinks, create, update, remove, reorder, toggleActive | ✅ |
| `events.ts` | getByArtist, getUpcomingByArtist | ✅ |
| `products.ts` | getByArtist, getPublicByArtist | ✅ |
| `follows.ts` | toggle, isFollowing, getFollowedArtists, getFollowerCount, getFollowingCount | ✅ |
| `files.ts` | generateUploadUrl, getPlayableUrl | ✅ |
| `seed.ts` | seedDemoData | ✅ (dev only) |

### Reserved Slugs (Implemented)

```typescript
// src/lib/constants.ts
export const RESERVED_SLUGS = [
  "me", "dashboard", "sign-in", "sign-up",
  "api", "admin", "settings", "help",
  "support", "about", "terms", "privacy", "contact",
] as const;
```

## Auth, Role & Identity Rules (MVP)

### Clerk Integration (Implemented)

**Middleware** (`src/middleware.ts`):
- Uses `clerkMiddleware()` from `@clerk/nextjs/server`
- Route matchers for public, artist, and fan routes
- Role-based redirects
- `/me` → `/me/[username]` redirect

**Provider Setup** (`src/app/layout.tsx`):
```tsx
<ClerkProvider>
  <ConvexClientProvider>
    <ThemeProvider>
      <GlobalPlayerProvider>
        {children}
      </GlobalPlayerProvider>
    </ThemeProvider>
  </ConvexClientProvider>
</ClerkProvider>
```

### Source of Truth

- **Clerk**: Authentication + role (`publicMetadata.role`)
- **Convex**: Synchronized mirror for queries and joins

### Role Sync Flow

1. User signs up via Clerk
2. Onboarding page → select role (Artist/Fan)
3. API route `/api/onboarding/set-role` updates Clerk metadata
4. Convex `users.upsertFromClerk` syncs user record

### Fan URL Identity Safety (IDOR Prevention)

- Dashboard data loaded using authenticated Clerk userId
- URL `[username]` is cosmetic only
- Mismatch redirects to correct `/me/[authUsername]`

## Media Player System (Audio/Video) — MVP

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  GlobalPlayerProvider                    │
│  - Singleton <audio> element                            │
│  - Event listeners → Zustand store                      │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    player-store.ts                       │
│  - currentTrack, status, currentTime, duration          │
│  - volume, isMuted, queue, queueIndex                   │
│  - Actions: loadAndPlay, togglePlayPause, seek, etc.    │
└─────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    FeaturedTrackCard  MediaCardOverlay  VideoModal
```

### Player State (Zustand Store)

```typescript
interface PlayerState {
  currentTrack: Track | null;
  status: "idle" | "loading" | "playing" | "paused" | "error";
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  queue: Track[];
  queueIndex: number;
  error: string | null;
}
```

### Key Components

| Component | Purpose | Requirements |
|-----------|---------|--------------|
| `GlobalPlayerProvider` | Audio element manager, event wiring | 19.1 |
| `FeaturedTrackCard` | Featured track with controls (DO NOT RENAME) | 19.3 |
| `MediaCardOverlay` | Play/pause overlay for cards | 19.3 |
| `VideoModal` | Video playback modal | 19.4 |

### URL Resolution

- `files.getPlayableUrl({ storageId })` → ephemeral URL
- Public products: streamable
- Purchased content: ownership-gated via `downloads.getDownloadUrl`

### Accessibility (19.6)

- Keyboard: Space toggles play/pause when focused
- Error handling: Toast + reset state on failed URLs

## File Upload & Download Flow

### Artist Upload Flow

1. Artist creates Product draft
2. Request upload URL from Convex (`files.generateUploadUrl`)
3. Client uploads file to URL
4. Convex returns `storageId`
5. Update product with `fileStorageId`, `contentType`, `fileSize`

### Fan Download Flow (Ownership-gated)

1. Fan clicks "Download"
2. Verify: authenticated + order paid + orderItem exists
3. Generate download URL from `fileStorageId`
4. Return URL (or 403 if verification fails)

### Upload Limits

- Audio: mp3, wav (≤ 50MB)
- Video: mp4 (≤ 200MB)

## Stripe Integration (Planned)

### Webhook Security

- Verify signature before processing
- Idempotency via `processedEvents` table
- Supported event: `checkout.session.completed`

### MVP Scope

- Stripe Connect / payouts: OUT OF SCOPE
- Billing pages show placeholders only

## Error Handling

### Client-Side

| Error Type | Strategy | Feedback |
|------------|----------|----------|
| Form validation | Zod schema | Inline FormMessage |
| Network timeout | Convex hooks + retry | Toast with retry |
| 401 Unauthorized | Redirect to /sign-in | - |
| 403 Forbidden | Error page | "Access denied" |
| 404 Not Found | 404 page | "Page not found" |
| 500 Server Error | Error boundary | "Something went wrong" |

### Server-Side

| Error Type | Strategy | Logging |
|------------|----------|---------|
| Convex mutation failure | Return error object | Convex dashboard |
| Stripe API error | User-friendly message | Stripe error code |
| File upload failure | Retry suggestion | File size/type |

## Correctness Properties

### Core Properties

| # | Property | Validates |
|---|----------|-----------|
| 1 | Email validation rejects invalid formats | Req 1.4 |
| 2 | Waitlist email round-trip | Req 1.3 |
| 3 | Route protection by auth + role | Req 2.5, 2.6, 2.8 |
| 4 | Role selection persistence | Req 2.4 |
| 5 | Artist slug resolution | Req 3.1, 3.7 |
| 6 | Follow toggle round-trip | Req 3.5 |
| 7 | Profile data round-trip | Req 5.4 |
| 8 | Slug uniqueness enforcement | Req 5.5 |
| 9 | Reserved slug rejection | Req 15.7 |
| 10 | Fan dashboard URL contains username | Req 9.1 |
| 11 | Theme toggle persistence | Req 13.3 |
| 12 | File upload round-trip | Req 16.4 |
| 13 | Product record contains fileStorageId | Req 16.5 |
| 14 | Download ownership verification | Req 17.3-17.5 |
| 15 | Order creation on payment success | Req 18.2 |
| 16 | Webhook idempotency | Req 18.5 |

### Media Player Properties

| # | Property | Validates |
|---|----------|-----------|
| MP1 | Single active playback | Req 19.1 |
| MP2 | FeaturedTrackCard reflects global state | Req 19.3 |
| MP3 | Overlay control reflects state | Req 19.3 |

## Testing Strategy

### Framework

- Unit/Integration: Vitest + React Testing Library
- Property-Based: fast-check
- E2E: Playwright (optional)

### MVP Test Scope (Critical Paths Only)

- Reserved slug rejection (Property 9)
- /me → /me/[username] redirect (Property 10)
- Download ownership verification (Property 14)
- Webhook idempotency (Property 16)

## Implementation Status

### ✅ Completed

- Landing page with waitlist
- Authentication (Clerk) + role selection
- Middleware with role-based routing
- Public Artist Hub (header, tabs, drops, events)
- Artist Dashboard (overview, profile, links)
- Follow/unfollow functionality
- Theme system (light/dark)
- Global audio player
- FeaturedTrackCard component

### 🚧 In Progress

- Products management page
- Events management page

### 📋 Planned

- Fan Dashboard (feed, purchases, billing)
- Artist Billing page
- Stripe checkout integration
- Stripe webhooks
- Download system with ownership verification
