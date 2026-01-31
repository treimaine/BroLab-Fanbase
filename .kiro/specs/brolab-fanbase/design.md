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

## Dashboard Overview — Stats Cards (Real Data)

### Stats Cards Layout
3 cards in responsive grid (sm:grid-cols-2 lg:grid-cols-3):

1. **Followers**
   - Icon: Users
   - Value: Integer count (e.g., "127")
   - Source: `follows.countByArtist(artistId)`
   - Format: `count.toString()`

2. **Revenue**
   - Icon: DollarSign
   - Value: Currency (e.g., "$1,234.56")
   - Source: `artistBilling.getSummary()` → `available + pending`
   - Format: `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`

3. **Upcoming Events**
   - Icon: Calendar
   - Value: Integer count (e.g., "3")
   - Source: `events.countUpcomingByArtist(artistId)` (date >= now)
   - Format: `count.toString()`

### Loading States
- **Skeleton**: Display `<Skeleton className="h-28 rounded-xl" />` during fetch
- **Duration**: Until all 3 queries resolve
- **Partial loading**: Show skeletons for pending queries, real data for resolved

### Empty States
- **Followers**: "0" (not "—" or "N/A")
- **Revenue**: "$0.00" (not "$—")
- **Events**: "0" (not "—")

### Error States (Optional V1)
- Display error card with retry button
- Fallback to "0" or "$0.00" if query fails

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

## Dashboard — Custom Links (Business-Only)

### Purpose
The `/dashboard/links` page manages "Business Links" for merch, booking, press kit, newsletter, etc.
These links are NOT displayed on the Public Hub (reserved for future use).

### UI Copy
- **Page title**: "Business Links" or "Custom Links"
- **Helper text**: "Add links for merch, booking, press kit, newsletter, etc. For social media, use Profile & Bio → Social Links."
- **Dialog title**: "Add Business Link"
- **Dialog description**: "Add a business link to your hub. For social media, use Social Links."

### Type Dropdown (Business Types Only)
Available types:
- `merch` - Merch Store
- `tickets` - Tickets
- `website` - Website
- `booking` - Booking
- `presskit` - Press Kit
- `newsletter` - Newsletter
- `donate` - Donate
- `other` - Custom Link

**Removed types** (managed in Social Links):
- ~~instagram~~ ~~youtube~~ ~~spotify~~ ~~apple-music~~

### URL Domain Validation (Unchanged)
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
- Video: mp4 (≤ 500MB)

## Stripe Integration (Planned)

### Webhook Security

- Verify signature before processing
- Idempotency via `processedEvents` table
- Supported event: `checkout.session.completed`

### MVP Scope (Updated - Stripe Connect In Scope)

- **Stripe Connect**: IN SCOPE (Express onboarding, automatic payouts)
- **Artist Billing**: Real data (no placeholders), deterministic read-model
- **Fan → Artist payments**: Routed via destination charges (application_fee = 0)
- **Platform revenue**: Artist subscriptions only (Clerk Billing)

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


## Fan Billing — Saved Payment Methods (Stripe Elements)

### UX Goals
- Remplacer tout "Coming soon" et supprimer toute donnée mock.
- Le fan voit une liste réelle de cartes enregistrées (brand/last4/expiry) + default.
- Ajout de carte via un **Dialog** Stripe Elements (PaymentElement).

### Page: /fan/me/[username]/billing

#### Section "Payment methods"
States:
1) **Loading**: skeleton list avec `<Loader2>` + "Loading payment methods…"
2) **Empty**: message "No payment method saved yet." + button "Add payment method"
3) **List**:
   - cartes en list items (brand icon + last4 + expiry)
   - badge "Default" sur la carte `isDefault === true`
   - actions:
     - "Set as default" button (optionnel V1, caché si déjà default)
     - "Remove" button (destructive variant)
   - loading state individuel pendant actions (busyId)

#### Add Payment Method Flow (Dialog)
1. Button "Add payment method" → call Convex action `stripe.createSetupIntent()`
2. Ouvre un Dialog (`sm:max-w-[520px]`) avec:
   - Title: "Add a payment method"
   - Loading state: "Initializing Stripe…" (pendant fetch clientSecret)
   - `<Elements key={key} stripe={stripePromise} options={{ clientSecret }}>`
   - `<PaymentElement />` (Stripe hosted UI)
   - Footer: Cancel button + Save button (disabled si !stripe || !elements)
   - Security notice: "Your full card details are never stored on our servers."
3. Confirm button → `stripe.confirmSetup({ elements, redirect: "if_required" })`
4. Après succès:
   - Toast "Payment method added — Your card has been saved."
   - Close dialog (reset Elements state via key increment)
   - La liste se met à jour automatiquement via query Convex (webhook-driven)
5. Après erreur:
   - Toast destructive avec `result.error.message`

#### Components Architecture
```
AddPaymentMethodDialog (wrapper)
  ├─ Dialog state management (open/onOpenChange)
  ├─ clientSecret prop
  ├─ Elements key reset on close
  └─ <Elements> wrapper
      └─ PaymentMethodForm (isolated)
          ├─ useStripe() + useElements()
          ├─ <PaymentElement />
          ├─ confirmSetup logic
          └─ Cancel/Save buttons
```

### Data model used by UI (deterministic)
- Query `api.paymentMethods.listForCurrentUser()` → returns `PaymentMethod[]`
  - Sorted: default first, then by createdAt desc
- Actions:
  - `api.stripe.createSetupIntent()` → `{ clientSecret: string }`
  - `api.stripe.setDefaultPaymentMethod({ stripePaymentMethodId })` → `{ ok: true }`
  - `api.stripe.detachPaymentMethod({ stripePaymentMethodId })` → `{ ok: true }`
- Update events viennent de Stripe webhooks → Convex table `paymentMethods`

### Stripe Elements Integration Notes
- Use `@stripe/stripe-js` + `@stripe/react-stripe-js`
- `stripePromise = loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)`
- `<Elements options={{ clientSecret }}>` wraps `<PaymentElement />`
- Confirm with `stripe.confirmSetup({ elements, confirmParams: { return_url? }, redirect: "if_required" })`
- After success: rely on webhooks to update Convex `paymentMethods`
- UI refetches automatically via Convex reactivity

### Security / Privacy
- Jamais stocker PAN complet / CVC.
- Stocker uniquement: brand, last4, expMonth, expYear, stripePaymentMethodId, isDefault, billingName, billingEmail.
- Stripe Elements collecte les données sensibles (PCI-compliant).

### UX Micro-details
- Après `confirmSetup`, afficher "Saved — syncing…" (car update dépend du webhook)
- Ajouter texte helper: "It may take a few seconds to appear."
- Pendant "Set default" ou "Remove", afficher `<Loader2>` sur le bouton concerné (pas toute la liste)
- Sort payment methods: default first, then newest first

---

## Fan Feed — Real content

### Page: /fan/me/[username]
- Affiche un feed réel basé sur les follows:
  - items = drops/releases (products)
- States: loading / empty (no follows) / list / error
- Pagination "Load more"

### Fan Feed — Pagination UX

#### Behavior
- Feed items are fetched page-by-page (limit: 10 items per page)
- Client accumulates pages in state (`allFeedItems`) for continuous scroll experience
- Deduplication by `_id` prevents duplicate items if user navigates back/forward

#### "Load More" Button
- **Visible**: When `nextCursor` is present (more items available)
- **Hidden**: When `nextCursor` is null (end of feed reached)
- **Disabled**: During fetch operation (prevents race conditions)
- **Label**: "Load more" (default) or "Loading..." (during fetch)

#### States
1. **Loading (Initial)**: Skeleton cards (3x) + sidebar skeletons
2. **Empty**: "Your feed is empty" message + "Start following artists" CTA + Suggested Artists widget
3. **List**: Feed cards + "Load more" button (if hasMore)
4. **End of Feed**: Feed cards + "You've reached the end of your feed" message

#### Refresh Behavior
- Page refresh resets to first page (cursor = undefined)
- Navigation back/forward preserves scroll position (browser default)

#### Deduplication Logic
```typescript
// Prevent duplicates when accumulating pages
const existingIds = new Set(prev.map(item => item._id));
const newItems = feedResult.items.filter(item => !existingIds.has(item._id));
return [...prev, ...newItems];
```

---

## Artist Billing — Stripe Connect + Automatic Payouts (Production)

### Business Model
- **Fan → Artist**: Direct payments via Stripe Connect (destination charges)
- **Platform Revenue**: Artist subscriptions (Clerk Billing: Free/Pro/Premium)
- **Commission**: 0% on sales (`application_fee_amount = 0`)
- **Payouts**: Automatic (Stripe schedule), no manual withdraw

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FAN CHECKOUT FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│  Fan clicks "Buy" → Stripe Checkout Session                    │
│  ├─ payment_intent_data.transfer_data.destination = artist_acct│
│  ├─ application_fee_amount = 0                                  │
│  └─ metadata: { fanUserId, productId, artistId }               │
├─────────────────────────────────────────────────────────────────┤
│  Webhook: checkout.session.completed                           │
│  ├─ Verify signature + idempotency (processedEvents)           │
│  ├─ Create order + orderItems (Convex)                         │
│  ├─ Grant download entitlement                                 │
│  └─ Funds go directly to artist's Stripe Connect account       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 ARTIST CONNECT FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│  Artist clicks "Connect Stripe"                                │
│  ├─ Convex action: stripeConnect.createAccount (Express)       │
│  ├─ Store stripeConnectAccountId in artists table              │
│  └─ Redirect to Stripe onboarding (account link)               │
├─────────────────────────────────────────────────────────────────┤
│  Webhook: account.updated                                      │
│  ├─ Update connectStatus, chargesEnabled, payoutsEnabled       │
│  ├─ Update requirementsDue (KYC, bank, etc.)                   │
│  └─ Idempotency via processedEvents                            │
├─────────────────────────────────────────────────────────────────┤
│  Automatic Payouts (Stripe managed)                            │
│  ├─ Webhook: payout.paid → update payout history (optional V1) │
│  └─ Artist manages schedule via Express dashboard              │
└─────────────────────────────────────────────────────────────────┘
```

### Data Model (Convex Schema Updates)

#### `artists` table (add Connect fields)
```typescript
artists: defineTable({
  // ... existing fields ...
  stripeConnectAccountId: v.optional(v.string()),
  connectStatus: v.union(
    v.literal("not_connected"),
    v.literal("pending"),
    v.literal("connected")
  ),
  chargesEnabled: v.optional(v.boolean()),
  payoutsEnabled: v.optional(v.boolean()),
  requirementsDue: v.optional(v.array(v.string())),
  connectUpdatedAt: v.optional(v.number()),
})
```

#### `artistBalanceSnapshots` table (optional - for balance history)
```typescript
artistBalanceSnapshots: defineTable({
  artistId: v.id("artists"),
  stripeConnectAccountId: v.string(),
  availableUSD: v.number(),
  pendingUSD: v.number(),
  currency: v.string(), // "usd"
  snapshotAt: v.number(),
}).index("by_artist", ["artistId"])
```

#### `artistPayouts` table (optional - for payout history)
```typescript
artistPayouts: defineTable({
  artistId: v.id("artists"),
  stripePayoutId: v.string(),
  amount: v.number(),
  currency: v.string(),
  status: v.union(
    v.literal("paid"),
    v.literal("pending"),
    v.literal("in_transit"),
    v.literal("canceled"),
    v.literal("failed")
  ),
  arrivalDate: v.number(),
  createdAt: v.number(),
})
  .index("by_artist", ["artistId"])
  .index("by_stripe_payout", ["stripePayoutId"])
```

### Page: /dashboard/billing (Artist)

#### UI States

**State 1: Not Connected**
```
┌─────────────────────────────────────────────────────────────┐
│  Earnings & Payouts                                         │
├─────────────────────────────────────────────────────────────┤
│  ⚠️  Connect Stripe to Receive Payments                     │
│                                                             │
│  Fans pay you directly via Stripe. Payouts are automatic.  │
│                                                             │
│  [Connect Stripe Account] (primary CTA)                    │
└─────────────────────────────────────────────────────────────┘
```

**State 2: Pending (Requirements Due)**
```
┌─────────────────────────────────────────────────────────────┐
│  Earnings & Payouts                                         │
├─────────────────────────────────────────────────────────────┤
│  ⚠️  Action Required                                        │
│                                                             │
│  Complete these steps to activate payments:                │
│  • Verify your identity                                    │
│  • Add bank account                                        │
│                                                             │
│  [Continue Stripe Setup] (primary CTA)                     │
└─────────────────────────────────────────────────────────────┘
```

**State 3: Connected**
```
┌─────────────────────────────────────────────────────────────┐
│  Earnings & Payouts                                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Balance Card (gradient)                            │   │
│  │  Available: $1,234.56                               │   │
│  │  Pending: $89.00                                    │   │
│  │  Last Payout: $500.00 on Dec 15, 2024              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │  Payout Method      │  │  Recent Transactions        │  │
│  │  ✅ Connected       │  │  • Midnight Dreams EP       │  │
│  │  Payouts: Automatic │  │    +$9.99 (Dec 13)         │  │
│  │                     │  │  • Summer Tour Ticket       │  │
│  │  [Manage on Stripe] │  │    +$125.00 (Dec 15)       │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### Components Architecture

**BalanceCard** (updated)
- Props: `availableBalance`, `pendingBalance`, `lastPayout` (real data from Convex)
- Fallback: If balance webhooks not implemented, show transaction totals

**PayoutMethodCard** (updated)
- Props: `connectStatus`, `chargesEnabled`, `payoutsEnabled`, `expressLoginUrl`
- States:
  - `not_connected`: CTA "Connect Stripe"
  - `pending`: Show requirements + CTA "Continue Setup"
  - `connected`: Show status + link "Manage Payouts on Stripe"
- NO "Withdraw Funds" button

**TransactionsList** (updated)
- Data source: Convex query `artistBilling.getTransactions()`
- Query: `orders` → `orderItems` → `products` (filter by `artistId`)
- Empty state: "No sales yet. Share your products with fans!"
- NO placeholder/mock transactions

### Convex Functions (New)

#### Queries (Deterministic)

```typescript
// convex/artistBilling.ts

export const getSummary = query({
  args: {},
  handler: async (ctx) => {
    // Get current artist
    // Return: {
    //   connectStatus, chargesEnabled, payoutsEnabled, requirementsDue,
    //   availableBalance, pendingBalance, lastPayout
    // }
  }
});

export const getTransactions = query({
  args: { limit: v.optional(v.number()), cursor: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Get current artist
    // Query orders → orderItems → products (filter by artistId)
    // Return paginated transactions with product details
  }
});
```

#### Actions (Stripe API Calls)

```typescript
// convex/stripeConnect.ts

export const createAccount = action({
  args: {},
  handler: async (ctx) => {
    // Create Stripe Connect Express account
    // Store stripeConnectAccountId in artists table
    // Return account ID
  }
});

export const createAccountLink = action({
  args: { type: v.union(v.literal("onboarding"), v.literal("refresh")) },
  handler: async (ctx, args) => {
    // Create Stripe account link for onboarding/refresh
    // Return URL for redirect
  }
});

export const createLoginLink = action({
  args: {},
  handler: async (ctx) => {
    // Create Stripe Express dashboard login link
    // Return URL for "Manage Payouts on Stripe"
  }
});
```

#### Internal Mutations (Webhook-driven)

```typescript
// convex/stripeConnect.ts

export const updateAccountStatus = internalMutation({
  args: {
    stripeConnectAccountId: v.string(),
    connectStatus: v.string(),
    chargesEnabled: v.boolean(),
    payoutsEnabled: v.boolean(),
    requirementsDue: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Update artists table with Connect status
    // Called by webhook account.updated
  }
});

export const upsertBalanceSnapshot = internalMutation({
  args: {
    artistId: v.id("artists"),
    availableUSD: v.number(),
    pendingUSD: v.number(),
  },
  handler: async (ctx, args) => {
    // Upsert balance snapshot
    // Called by webhook balance.available (optional V1)
  }
});

export const upsertPayoutHistory = internalMutation({
  args: {
    artistId: v.id("artists"),
    stripePayoutId: v.string(),
    amount: v.number(),
    status: v.string(),
    arrivalDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Upsert payout history
    // Called by webhook payout.* (optional V1)
  }
});
```

### Webhooks (Extended)

#### Existing: `src/app/api/stripe/webhook/route.ts`

Add support for Connect events:

```typescript
// Handle Connect events
if (event.type === "account.updated") {
  const account = event.data.object as Stripe.Account;
  await fetchMutation(api.stripeConnect.updateAccountStatus, {
    stripeConnectAccountId: account.id,
    connectStatus: account.charges_enabled && account.payouts_enabled 
      ? "connected" 
      : "pending",
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    requirementsDue: account.requirements?.currently_due || [],
  });
}

// Optional V1: Balance webhooks
if (event.type === "balance.available") {
  // Update balance snapshot
}

// Optional V1: Payout webhooks
if (event.type.startsWith("payout.")) {
  // Update payout history
}
```

### Checkout Flow (Updated)

#### `src/app/api/stripe/checkout/route.ts`

```typescript
// Get artist's Stripe Connect account
const product = await fetchQuery(api.products.getById, { productId });
const artist = await fetchQuery(api.artists.getById, { artistId: product.artistId });

if (!artist.stripeConnectAccountId || artist.connectStatus !== "connected") {
  return NextResponse.json(
    { error: "Artist not connected to Stripe" },
    { status: 400 }
  );
}

// Create Checkout Session with destination charge
const session = await stripe.checkout.sessions.create({
  mode: "payment",
  line_items: [...],
  payment_intent_data: {
    transfer_data: {
      destination: artist.stripeConnectAccountId, // Route to artist
    },
    application_fee_amount: 0, // No platform commission
  },
  metadata: {
    fanUserId,
    productId,
    artistId: artist._id,
  },
  success_url: `${process.env.NEXT_PUBLIC_URL}/me/purchases?success=true`,
  cancel_url: `${process.env.NEXT_PUBLIC_URL}/products/${productId}`,
});
```

### Implementation Phases

**Palier A (Indispensable - Core Connect)**
- ✅ Stripe Connect onboarding + status tracking
- ✅ Checkout routed to connected account (destination charges)
- ✅ Orders/entitlements continue to work in Convex
- ✅ Artist Billing page: not_connected/pending/connected states
- ✅ "Manage Payouts on Stripe" link (Express login)
- ✅ Real transactions list from Convex orders

**Palier B (Nice-to-have - Balance Display)**
- ⚙️ Webhooks `balance.available` + `payout.*`
- ⚙️ Read-model balance + payout history in Convex
- ⚙️ Display available/pending/last payout in UI
- ⚙️ Balance snapshots table for history

### Security & Compliance

- **PCI Compliance**: Stripe handles all payment data
- **Connect Verification**: Stripe handles KYC/identity verification
- **Idempotency**: All webhooks checked via `processedEvents` table
- **Authorization**: Only artist owner can access their billing data
- **No Manual Payouts**: Prevents fraud, Stripe manages schedule

### Error Handling

| Error | Strategy | User Feedback |
|-------|----------|---------------|
| Artist not connected | Block checkout | "This artist hasn't set up payments yet" |
| Connect onboarding incomplete | Show requirements | "Complete these steps: [list]" |
| Webhook processing failure | Retry (Stripe automatic) | Log error, no user impact |
| Balance fetch failure | Show transaction totals | "Balance unavailable, showing sales total" |

---

## Landing/Home — UX Specification (Conversion-First)

### Design Philosophy

**Goal:** Convert visitors to artist sign-ups within 5 seconds of landing.

**Approach:**
- Artist-first messaging (not fan-first)
- Clear value prop: "Fans pay you directly"
- Minimal friction: "Start free" CTA above fold
- Trust indicators: Stripe, 0% fee, automatic payouts
- Mobile-first hierarchy

### Information Architecture

#### Page Structure (6 Sections Max)

```
┌─────────────────────────────────────────────────────────────┐
│  1. HERO (Above Fold)                                       │
│     - Headline + Subheadline                                │
│     - Primary CTA: "Start free as an Artist"                │
│     - Trust line: "0% platform fee • Stripe secured"        │
├─────────────────────────────────────────────────────────────┤
│  2. PROOF BAR (3 Trust Indicators)                          │
│     - Direct payouts                                        │
│     - 0% sales fee                                          │
│     - Stripe secured                                        │
├─────────────────────────────────────────────────────────────┤
│  3. HOW IT WORKS (3 Steps)                                  │
│     - Sign up → Connect Stripe → Share link                │
├─────────────────────────────────────────────────────────────┤
│  4. USE CASES (3 Cards)                                     │
│     - Music (sell tracks/albums)                            │
│     - Merch (sell physical goods)                           │
│     - Tickets (sell event access)                           │
├─────────────────────────────────────────────────────────────┤
│  5. SOCIAL PROOF (Minimal - Optional V1)                    │
│     - Testimonial OR stats (if available)                   │
│     - Omit if no real data                                  │
├─────────────────────────────────────────────────────────────┤
│  6. FAQ (5 Questions Max)                                   │
│     - How do I get paid?                                    │
│     - What fees do you charge?                              │
│     - How long does setup take?                             │
│     - Can I sell internationally?                           │
│     - What payment methods do fans use?                     │
└─────────────────────────────────────────────────────────────┘
```

### Copy Guidelines (English)

#### Tone & Voice
- **Premium but clear**: Not cryptic or overly clever
- **Direct and benefit-focused**: "You earn more" not "We have features"
- **Artist-first perspective**: "Your earnings" not "Our platform"
- **Active voice**: "Fans pay you" not "Payments are received"

#### Headline Style
- **Length**: ≤10 words
- **Benefit-driven**: Focus on outcome, not feature
- **Emotional hook**: Tap into artist pain points (control, fairness, transparency)

#### Example Copy (Reference)

**Hero Section:**
```
Headline: "Fans pay you directly."
Subheadline: "Sell music, merch, and tickets with Stripe Connect payouts. 
              We earn from your subscription—not your sales."
Trust Line: "0% platform fee on sales • Automatic payouts • No credit card required"
Primary CTA: "Start free as an Artist"
Secondary CTA: "Explore artists"
```

**Proof Bar:**
```
1. "Direct Payouts"
   "Funds go straight to your bank. No waiting, no middleman."

2. "0% Sales Fee"
   "We earn from subscriptions, not your hard work."

3. "Stripe Secured"
   "Industry-leading payment security and compliance."
```

**How It Works:**
```
Step 1: "Sign up in 60 seconds"
        "Choose your unique link and create your hub."

Step 2: "Connect Stripe"
        "Set up automatic payouts to your bank account."

Step 3: "Share your link"
        "Post on Instagram, YouTube, or anywhere fans find you."
```

**Use Cases:**
```
Music:
  "Sell tracks, albums, and exclusive releases"
  "Fans download instantly after purchase"

Merch:
  "Sell physical goods with custom links"
  "Manage orders and fulfillment your way"

Tickets:
  "Sell event access and tour tickets"
  "Fans get instant confirmation"
```

**FAQ:**
```
Q: "How do I get paid?"
A: "Stripe automatically deposits earnings to your bank account. 
    You control the payout schedule (daily, weekly, or monthly)."

Q: "What fees do you charge?"
A: "0% on sales. We earn from artist subscriptions ($0-$29/month). 
    Stripe charges standard processing fees (~2.9% + 30¢)."

Q: "How long does setup take?"
A: "5 minutes. Sign up, connect Stripe, and you're live."

Q: "Can I sell internationally?"
A: "Yes. Stripe supports 135+ currencies and global payments."

Q: "What payment methods do fans use?"
A: "Credit/debit cards, Apple Pay, Google Pay, and more via Stripe."
```

### Visual & Interaction Design

#### Hero Section (Above Fold)

**Layout (Desktop):**
```
┌─────────────────────────────────────────────────────────────┐
│  Navbar: Logo | Sign In | Start free (CTA)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Left 50%]                        [Right 50%]             │
│  Headline (serif, 48px)            Hero Image/Video        │
│  Subheadline (sans, 18px)          (Artist using app)      │
│  Trust line (14px, muted)                                  │
│                                                             │
│  [Start free as an Artist] (pill)                          │
│  [Explore artists] (ghost)                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Layout (Mobile):**
```
┌─────────────────────────────────────────────────────────────┐
│  Navbar: Logo | Burger Menu                                 │
├─────────────────────────────────────────────────────────────┤
│  Headline (serif, 32px)                                     │
│  Subheadline (sans, 16px)                                   │
│  Trust line (12px, muted)                                   │
│                                                             │
│  [Start free as an Artist] (full-width pill)                │
│  [Explore artists] (ghost, centered)                        │
│                                                             │
│  Hero Image (below fold)                                    │
└─────────────────────────────────────────────────────────────┘
```

**Typography:**
- Headline: Playfair Display (serif), 700 weight, lavender gradient on key word
- Subheadline: Inter (sans), 400 weight, foreground color
- Trust line: Inter, 400 weight, muted color

**CTA Styling:**
- Primary: Pill button, lavender gradient background, white text, shadow on hover
- Secondary: Ghost button, border only, hover fill

**Animations:**
- Headline: Fade in + slide up (0.5s ease-out)
- Subheadline: Fade in + slide up (0.6s ease-out, 0.1s delay)
- CTAs: Fade in + slide up (0.7s ease-out, 0.2s delay)
- Hero image: Fade in (0.8s ease-out, 0.3s delay)

#### Proof Bar

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Icon] Direct Payouts    [Icon] 0% Sales Fee    [Icon] Stripe Secured │
│  Description text         Description text        Description text      │
└─────────────────────────────────────────────────────────────┘
```

**Styling:**
- 3 columns (desktop), stacked (mobile)
- Icons: Lucide React, 32px, lavender accent
- Title: Inter 600, 16px
- Description: Inter 400, 14px, muted

#### How It Works

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Step 1                   Step 2                   Step 3   │
│  [Number Badge]           [Number Badge]           [Number Badge] │
│  Title                    Title                    Title    │
│  Description              Description              Description │
│  [Arrow →]                [Arrow →]                          │
└─────────────────────────────────────────────────────────────┘
```

**Styling:**
- Number badges: Circle, lavender gradient, white text
- Arrows: Subtle, muted color
- Cards: Soft border, rounded-2xl, hover shadow

#### Use Cases

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Music Card]             [Merch Card]             [Tickets Card] │
│  Icon                     Icon                     Icon     │
│  Title                    Title                    Title    │
│  Description              Description              Description │
│  [Learn more →]           [Learn more →]           [Learn more →] │
└─────────────────────────────────────────────────────────────┘
```

**Styling:**
- Cards: Glass effect (bg-white/80 dark:bg-black/80), border, rounded-2xl
- Icons: Lucide React, 48px, lavender accent
- Hover: Lift effect (translateY -4px), shadow increase

#### FAQ

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Q: How do I get paid?                                      │
│  [Expand Icon]                                              │
│  ────────────────────────────────────────────────────────── │
│  A: Stripe automatically deposits...                        │
│                                                             │
│  Q: What fees do you charge?                                │
│  [Expand Icon]                                              │
└─────────────────────────────────────────────────────────────┘
```

**Interaction:**
- Accordion pattern (shadcn Accordion component)
- Expand/collapse with smooth animation
- Only one open at a time (optional)

### States & Interactions

#### Navbar States

**SignedOut:**
- Logo (left)
- "Sign In" link (right)
- "Start free" button (right, primary)

**SignedIn (Artist):**
- Logo (left)
- "Dashboard" link (right)
- User avatar + dropdown (right)

**SignedIn (Fan):**
- Logo (left)
- "Feed" link (right)
- User avatar + dropdown (right)

#### CTA Click Tracking (PostHog)

**PostHog Initialization:**
```typescript
// app/providers.tsx (or instrumentation-client.ts for Next.js 15.3+)
'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users
      capture_pageview: false, // Disable automatic pageview capture (we'll do it manually)
    })
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
```

**Events to track:**
```typescript
// Option 1: Direct import (client components)
import posthog from 'posthog-js'

// Primary CTA
onClick={() => {
  posthog.capture('start_as_artist_click', {
    location: 'hero',
    timestamp: Date.now(),
  });
  router.push('/sign-up');
}}

// Secondary CTA
onClick={() => {
  posthog.capture('explore_artists_click', {
    location: 'hero',
    timestamp: Date.now(),
  });
  router.push('/explore'); // or /artists
}}

// Option 2: React hook (client components)
import { usePostHog } from 'posthog-js/react'

function HeroSection() {
  const posthog = usePostHog()
  
  return (
    <Button onClick={() => {
      posthog.capture('start_as_artist_click', { location: 'hero' })
      router.push('/sign-up')
    }}>
      Start free as an Artist
    </Button>
  )
}
```

**Note:** PostHog autocapture can automatically track clicks and pageviews. Manual tracking provides more control over event names and properties.

### Accessibility Requirements

#### WCAG 2.1 AA Compliance

**Color Contrast:**
- Text on background: ≥4.5:1
- Large text (≥18px): ≥3:1
- Interactive elements: ≥3:1

**Focus Indicators:**
- Visible on all interactive elements
- 2px solid ring, lavender accent
- Offset 2px from element

**Semantic HTML:**
```html
<header>
  <nav aria-label="Main navigation">
    <a href="/" aria-label="BroLab Fanbase home">Logo</a>
    <a href="/sign-in">Sign In</a>
    <button>Start free as an Artist</button>
  </nav>
</header>

<main>
  <section aria-labelledby="hero-heading">
    <h1 id="hero-heading">Fans pay you directly.</h1>
    <p>Sell music, merch, and tickets...</p>
  </section>

  <section aria-labelledby="proof-heading">
    <h2 id="proof-heading" class="sr-only">Why choose BroLab Fanbase</h2>
    <!-- Proof bar content -->
  </section>

  <!-- More sections -->
</main>
```

**Keyboard Navigation:**
- Tab order follows visual order
- Skip to main content link
- All interactive elements reachable via keyboard
- Enter/Space activates buttons

**Screen Reader Support:**
- Alt text for all images
- ARIA labels for icon-only buttons
- ARIA live regions for dynamic content
- Proper heading hierarchy (h1 → h2 → h3)

### Performance Optimization

#### Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/hero-artist.jpg"
  alt="Artist using BroLab Fanbase on mobile"
  width={600}
  height={800}
  priority // Above fold
  quality={85}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

#### Code Splitting

```tsx
// Lazy load below-fold sections
const FAQ = dynamic(() => import('@/components/marketing/faq'), {
  loading: () => <Skeleton className="h-96" />,
});

const UseCases = dynamic(() => import('@/components/marketing/use-cases'), {
  loading: () => <Skeleton className="h-64" />,
});
```

#### Bundle Size Targets

- Landing page JS: ≤100KB (gzipped)
- First Load JS: ≤150KB (gzipped)
- CSS: ≤20KB (gzipped)

#### Lighthouse Targets

- Performance: ≥90 (mobile)
- Accessibility: 100
- Best Practices: 100
- SEO: 100

### Responsive Breakpoints

```css
/* Mobile-first approach */
/* Base: 375px - 767px (mobile) */
.hero-headline {
  font-size: 32px;
  line-height: 1.2;
}

/* Tablet: 768px - 1023px */
@media (min-width: 768px) {
  .hero-headline {
    font-size: 40px;
  }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .hero-headline {
    font-size: 48px;
  }
}
```

### Component Checklist

**Before delivery, verify:**

- [ ] Hero headline visible without scroll (mobile)
- [ ] Primary CTA above fold (all devices)
- [ ] All images use `next/image`
- [ ] No client components unless necessary (prefer RSC)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Lighthouse Performance ≥90
- [ ] No console errors/warnings
- [ ] Analytics events fire correctly
- [ ] Mobile touch targets ≥44x44px
- [ ] No horizontal scroll on mobile
- [ ] Fast 3G load time ≤3s

### Success Metrics (Post-Launch)

**Primary KPIs:**
- Artist sign-up conversion rate: ≥3%
- Bounce rate: ≤60%
- Time on page: ≥45 seconds

**Secondary KPIs:**
- CTA click-through rate: ≥10%
- Mobile vs desktop conversion parity: ≥80%
- Page load time (FCP): ≤1.8s
- Page load time (LCP): ≤2.5s

**Measurement Period:** 30 days post-launch

**Tools:**
- Analytics: Posthog or Plausible (privacy-first)
- Performance: Vercel Analytics + Lighthouse CI
- Heatmaps: Optional (Hotjar/Clarity) for UX insights

---

## Artist Billing Page — Subscription + Earnings (Dual Purpose)

### Overview

The Artist Billing page serves TWO distinct purposes:
1. **Subscription Management** (Clerk Billing) — Platform revenue
2. **Earnings Management** (Stripe Connect) — Artist revenue from fan purchases

**Business Model Clarity:**
- Platform earns from artist subscriptions (Clerk Billing: Free/Premium)
- Artists earn from fan purchases (Stripe Connect: 0% platform fee)
- Payouts are automatic (Stripe managed schedule, no manual withdraw)

### Page Structure (Information Architecture)

```
/dashboard/billing
├── Section A: Subscription (Clerk Billing)
│   ├── Current Plan Card
│   ├── Usage Stats Card
│   ├── Upgrade/Manage CTA
│   └── Status Messaging
└── Section B: Earnings (Stripe Connect)
    ├── Connect Status Card
    ├── Balance Card (if connected)
    ├── Payout Method Card (if connected)
    └── Transactions List (if connected)
```

**Visual Hierarchy:**
- Section A (Subscription) is TOP priority (above fold on desktop)
- Section B (Earnings) follows below
- Clear visual separation between sections (divider or spacing)

### Section A: Subscription (Clerk Billing)

#### Current Plan Card

**States:**

1. **Free Plan (Active)**
   - Badge: "Free" (gray)
   - Title: "Free Plan"
   - Description: "Limited features. Upgrade to unlock unlimited content."
   - CTA: "Upgrade to Premium — $19.99/month" (primary button, full width)

2. **Premium Plan (Active)**
   - Badge: "Premium" (purple/lavender)
   - Title: "Premium Plan"
   - Description: "Unlimited products, events, links, and video uploads."
   - CTA: "Manage Subscription" (secondary button, full width)
   - Next billing date: "Next billing: Feb 15, 2026"

3. **Premium Plan (Trialing)**
   - Badge: "Premium (Trial)" (purple/lavender)
   - Title: "Premium Plan — Trial"
   - Description: "Your trial ends on [date]. No charge until then."
   - CTA: "Manage Subscription" (secondary button)

4. **Premium Plan (Canceling)**
   - Badge: "Canceling" (orange/warning)
   - Title: "Premium Plan — Canceling"
   - Description: "Your plan will downgrade to Free on [currentPeriodEnd]. Reactivate anytime."
   - CTA: "Reactivate Premium" (primary button)

5. **Premium Plan (Past Due)**
   - Badge: "Payment Failed" (red/destructive)
   - Title: "Premium Plan — Payment Failed"
   - Description: "Update your payment method to keep Premium features."
   - CTA: "Update Payment Method" (destructive button)

#### Usage Stats Card

**Layout:**
- 4 rows: Products, Events, Custom Links, Video Uploads
- Each row: Label | Current/Limit | Progress bar (if applicable)

**Example (Free Plan):**
```
Products:        3 / 5        [====------]
Events:          2 / 5        [===-------]
Custom Links:    4 / 5        [=====-----]
Video Uploads:   Disabled     [Upgrade to enable]
```

**Example (Premium Plan):**
```
Products:        12 / ∞       [No limit]
Events:          8 / ∞        [No limit]
Custom Links:    6 / ∞        [No limit]
Video Uploads:   Enabled      [Up to 500MB per file]
```

**Visual Treatment:**
- Progress bars: Green (safe), Yellow (warning 80%+), Red (at limit)
- "Disabled" state: Muted text + lock icon
- "Enabled" state: Success text + check icon

#### Status Messaging (Contextual)

**Over Quota (Free Plan):**
- Alert banner (warning): "You've reached your limit for [feature]. Upgrade to Premium to create more."
- CTA: "Upgrade Now" (inline button)

**Trial Ending Soon:**
- Alert banner (info): "Your trial ends in 3 days. Add a payment method to continue Premium."
- CTA: "Add Payment Method" (inline button)

**Payment Failed:**
- Alert banner (destructive): "Your payment failed. Update your payment method to avoid losing Premium features."
- CTA: "Update Payment" (inline button)

### Section B: Earnings (Stripe Connect)

#### Connect Status Card

**States:**

1. **Not Connected**
   - Icon: Stripe logo (muted)
   - Title: "Connect Stripe to Receive Payments"
   - Description: "Fans pay you directly via Stripe Connect. We take 0% commission on sales. Payouts are automatic."
   - CTA: "Connect Stripe" (primary button, full width)
   - Helper text: "Secure onboarding via Stripe. Takes ~5 minutes."

2. **Pending (Requirements Due)**
   - Icon: Stripe logo (warning)
   - Title: "Complete Your Stripe Setup"
   - Description: "You're almost done! Complete these requirements to start receiving payments:"
   - Requirements list:
     - "✓ Business details" (completed)
     - "⚠ Bank account" (pending)
     - "⚠ Identity verification" (pending)
   - CTA: "Continue Setup" (primary button)

3. **Connected**
   - Icon: Stripe logo (success)
   - Title: "Stripe Connected"
   - Description: "You're all set to receive payments. Payouts are automatic."
   - Status indicators:
     - "✓ Charges enabled"
     - "✓ Payouts enabled"
   - CTA: "Manage Payouts on Stripe" (secondary button, opens Express dashboard)

#### Balance Card (Connected Only)

**Layout:**
```
┌─────────────────────────────────────┐
│ Available Balance                   │
│ $1,234.56                          │
│                                     │
│ Pending Balance                     │
│ $567.89                            │
│                                     │
│ Last Payout                         │
│ $890.12 on Jan 28, 2026            │
└─────────────────────────────────────┘
```

**States:**
- Loading: Skeleton loaders
- Empty: "$0.00" (not "—" or "N/A")
- Error: "Unable to load balance. Try again."

**Note:** Balance data comes from Convex deterministic read-model (webhook-driven) or transaction totals (Palier A fallback).

#### Payout Method Card (Connected Only)

**Layout:**
```
┌─────────────────────────────────────┐
│ Payout Method                       │
│ Bank Account: •••• 1234             │
│ Automatic payouts enabled           │
│                                     │
│ [Manage Payouts on Stripe] →       │
└─────────────────────────────────────┘
```

**Important:**
- NO "Withdraw Funds" button (payouts are automatic)
- "Manage Payouts on Stripe" opens Stripe Express dashboard in new tab
- Helper text: "Payouts are processed automatically by Stripe. Manage your schedule and bank details on Stripe."

#### Transactions List (Connected Only)

**Layout:**
- Table or card list (responsive)
- Columns: Product, Fan, Amount, Date, Status
- Pagination: "Load more" button (if >10 items)

**Example Row:**
```
[Cover] "Midnight Dreams" (Music)
        Fan: @johndoe
        $9.99 • Jan 30, 2026 • Paid
```

**States:**
- Loading: Skeleton rows (3x)
- Empty: "No sales yet. Share your products with fans!" (with illustration)
- Error: "Unable to load transactions. Try again."

**Data Source:**
- Real sales from Convex `orders`/`orderItems` filtered by artistId
- NO mock/placeholder data

### Copy Guidelines (English Only)

**Tone:**
- Clear and direct (not cryptic)
- Benefit-focused (not feature-focused)
- Supportive (not salesy)

**Subscription Section:**
- Headline: "Your Subscription"
- Subheadline: "Manage your plan and usage limits."
- Upgrade CTA: "Upgrade to Premium — $19.99/month"
- Manage CTA: "Manage Subscription"

**Earnings Section:**
- Headline: "Your Earnings"
- Subheadline: "Track sales and manage payouts."
- Connect CTA: "Connect Stripe"
- Manage CTA: "Manage Payouts on Stripe"

**Helper Text Examples:**
- "We take 0% commission on sales. Platform revenue comes from subscriptions."
- "Payouts are automatic. No manual withdrawals needed."
- "Your earnings go directly to your Stripe account."

### UX States Summary

| State | Subscription Section | Earnings Section |
|-------|---------------------|------------------|
| New Artist (Free, Not Connected) | Show Free plan + Upgrade CTA | Show Connect CTA |
| Free Artist (Connected) | Show Free plan + Upgrade CTA | Show balance + transactions |
| Premium Artist (Not Connected) | Show Premium plan + Manage CTA | Show Connect CTA |
| Premium Artist (Connected) | Show Premium plan + Manage CTA | Show balance + transactions |
| Premium Canceling (Connected) | Show Canceling status + Reactivate CTA | Show balance + transactions |
| Premium Past Due (Connected) | Show Payment Failed + Update CTA | Show balance + transactions |

### Responsive Behavior

**Mobile (<768px):**
- Single column layout
- Subscription section first (above fold)
- Earnings section below
- Full-width CTAs
- Stacked cards

**Desktop (≥768px):**
- Two-column layout (optional, or keep single column for clarity)
- Subscription section left/top
- Earnings section right/bottom
- Side-by-side CTAs (if space allows)

### Accessibility

- Semantic HTML (section, article, aside)
- ARIA labels for status badges
- Focus indicators on all interactive elements
- Keyboard navigation support
- Screen reader friendly status messages

### No Mock Data Rule

**CRITICAL:**
- NO placeholder/mock data visible in Subscription or Earnings sections
- NO "Coming Soon" badges without real state
- NO fake transactions or balances
- Empty states must be honest: "No sales yet" (not fake data)
- Loading states must be clear: Skeleton loaders (not fake data)

### Component Checklist

**Before delivery, verify:**

- [ ] Subscription section displays real plan from Clerk metadata
- [ ] Usage stats display real counts from Convex
- [ ] Upgrade CTA redirects to Clerk Billing checkout (not mock)
- [ ] Manage CTA redirects to Clerk Billing portal (not mock)
- [ ] Connect CTA redirects to Stripe Connect onboarding (not mock)
- [ ] Balance displays real data (or transaction totals fallback)
- [ ] Transactions list displays real sales (or empty state)
- [ ] NO "Withdraw Funds" button exists
- [ ] "Manage Payouts on Stripe" opens Express dashboard
- [ ] All states tested: Free, Premium, Trialing, Canceling, Past Due
- [ ] All states tested: Not Connected, Pending, Connected
- [ ] Over-quota blocking works with upgrade CTA
- [ ] Mobile responsive (single column, full-width CTAs)
- [ ] Accessibility: keyboard nav, screen reader, focus indicators
