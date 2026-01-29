# BroLab Fanbase - Frontend PRD

## Project Overview

BroLab Fanbase is a mobile-first platform enabling artists to create their personal hub ("one link") to connect directly with fans.

**Tagline:** "Your career isn't an algorithm."

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 14.x |
| Language | TypeScript | 5.x |
| UI Library | shadcn/ui | latest |
| Styling | Tailwind CSS | 3.4.x |
| Animations | Framer Motion | 12.x |
| Icons | Lucide React | 0.562.x |
| Theme | next-themes | 0.4.x |
| Auth | Clerk | 6.36.x |
| Forms | React Hook Form + Zod | latest |
| Notifications | Sonner | 2.x |

## User Roles

### Artist
- Create personalized public hub page
- Manage profile, links, events, and digital products
- Sell directly to fans (music, videos, tickets)
- Track revenue and manage payouts

### Fan
- Follow favorite artists
- Purchase digital content and tickets
- Personalized feed from followed artists
- Manage purchases and downloads

## Route Structure

### Route Groups

| Group | Path | Description | Protection |
|-------|------|-------------|------------|
| (marketing) | `/` | Public landing page | None |
| (auth) | `/sign-in`, `/sign-up`, `/onboarding` | Clerk auth pages | None |
| (artist) | `/dashboard/*` | Artist dashboard | role=artist |
| (fan) | `/me/*` | Fan dashboard | role=fan |
| (public) | `/[artistSlug]` | Public artist hub | None |

### Detailed Routes

#### Marketing (Public)
- `GET /` - Landing page with hero, features, waitlist form

#### Authentication
- `GET /sign-in` - Clerk sign-in component
- `GET /sign-up` - Clerk sign-up component
- `GET /onboarding` - Role selection (Artist/Fan)

#### Artist Dashboard (Protected: role=artist)
- `GET /dashboard` - Overview with stats, setup checklist
- `GET /dashboard/profile` - Edit profile, slug, social links
- `GET /dashboard/links` - Manage external links
- `GET /dashboard/events` - Manage events/concerts
- `GET /dashboard/products` - Manage digital products (music/videos)
- `GET /dashboard/billing` - Balance, payouts, transactions

#### Fan Dashboard (Protected: role=fan)
- `GET /me` - Redirects to `/me/[username]`
- `GET /me/[username]` - Personalized feed
- `GET /me/[username]/purchases` - Purchase history with downloads
- `GET /me/[username]/billing` - Payment methods, billing history

#### Public Artist Hub
- `GET /[artistSlug]` - Artist public page with profile, drops, events

## Pages & Components

### 1. Landing Page (`/`)

**Components:**
- `HeroSection` - Title with gradient, email input, CTA button
- `FeatureGrid` - 3 columns: Direct to Fan / Global Commerce / Own Your Data
- `Footer` - Terms, Privacy, Contact links

**Functionality:**
- Email waitlist signup form
- Animated entrance (Framer Motion)
- Form validation with inline errors (FormMessage)
- Success toast notification (Sonner)

### 2. Authentication Pages

**Sign In (`/sign-in`)**
- Clerk `<SignIn />` component
- Redirect to dashboard based on role after login

**Sign Up (`/sign-up`)**
- Clerk `<SignUp />` component
- Redirect to `/onboarding` after signup

**Onboarding (`/onboarding`)**
- Role selection cards: Artist or Fan
- Visual cards with icons (Mic2, Heart)
- Store role in Clerk `publicMetadata.role`
- Redirect to appropriate dashboard

### 3. Artist Dashboard

**Layout:** AppShell with Sidebar (desktop) / TopBar + BottomNav (mobile)

**Overview Page (`/dashboard`)**
- `StatsCard` x3 - Followers, Revenue, Events
- `SetupChecklist` - Profile completion steps
- `CreateContentCard` - Quick actions (Add Link, Add Event)
- "View Public Hub" link

**Profile Page (`/dashboard/profile`)**
- `ProfileForm` - Avatar URL, Display Name, Slug, Bio
- Slug preview: `fan.brolab/[slug]`
- `SocialLinksList` - Platform toggles
- Save button with toast feedback

**Links Page (`/dashboard/links`)**
- `LinkItem` list - Title, URL, type badge, active toggle
- `AddLinkDialog` - Form to add new link
- Drag-to-reorder functionality

**Events Page (`/dashboard/events`)**
- `EventStatsRow` - Tickets sold, Revenue, Upcoming shows
- `EventItem` list - Image, title, date, venue, status
- `CreateEventDialog` - Form to create event

**Products Page (`/dashboard/products`)**
- `ProductItem` list - Cover, title, type, price, visibility
- `AddProductDialog` - Form with file upload
- File validation: audio ≤50MB, video ≤500MB
- Upload progress indicator

**Billing Page (`/dashboard/billing`)**
- `BalanceCard` - Available, pending, last payout
- `PayoutMethodCard` - Stripe Connect status (placeholder)
- `TransactionsList` - Transaction history

### 4. Fan Dashboard

**Layout:** AppShell with role="fan"

**Feed Page (`/me/[username]`)**
- `FeedCard` list - Artist posts with CTAs
- `CommunityWidget` - Following/Events counts
- `SuggestedArtistsWidget` - Artist recommendations
- `FeaturedTrackCard` - Mini player card

**Purchases Page (`/me/[username]/purchases`)**
- `PurchaseItem` list - Image, title, artist, date, price
- Download button (ownership-gated)
- Status badges (Upcoming/Shipped)

**Billing Page (`/me/[username]/billing`)**
- Tabs: Payment Methods / Billing History
- `PaymentMethodsTab` - Saved cards
- `BillingHistoryTab` - Transaction list

### 5. Public Artist Hub (`/[artistSlug]`)

**Components:**
- `HubHeader` - Cover image, avatar, name, bio, Follow button
- Social links pills
- Tabs: "Latest Drops" / "Tour Dates"
- `DropsList` - Product cards with price
- `EventsList` - Event cards with ticket button

**Functionality:**
- Follow/Unfollow toggle
- 404 page for invalid slugs

## Layout Components

### AppShell
- Responsive wrapper for dashboard pages
- Desktop: Sidebar + main content
- Mobile: TopBar + main content + BottomNav
- Breakpoint: `lg` (1024px)

### Sidebar (Desktop)
- Navigation links based on role
- User section with avatar and role
- Sign out button
- Theme toggle

### TopBar (Mobile)
- Brand "BroLab Fanbase"
- Burger menu icon → MobileDrawer
- Theme toggle

### BottomNav (Mobile)
- 4-5 icon buttons with labels
- Different items for Artist vs Fan

### MobileDrawer
- Sheet component from shadcn
- Navigation items
- User card
- Logout button

## Theme & Styling

### Design Tokens
- Background: Very light (light mode), dark (dark mode)
- Foreground: Soft black
- Accent: Lavender
- Border: Subtle
- Radius: Generous (rounded-2xl)

### Typography
- Headings: Playfair Display (serif)
- Body: Inter (sans-serif)

### Responsive
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Touch-friendly targets (44px minimum)

## Middleware & Route Protection

```typescript
// Protected routes configuration
const isPublicRoute = ["/", "/sign-in(.*)", "/sign-up(.*)", "/onboarding", "/api/stripe/webhook"];
const isArtistRoute = ["/dashboard(.*)"];
const isFanRoute = ["/me/(.*)"];

// Middleware logic:
// 1. Allow public routes
// 2. Redirect unauthenticated to /sign-in
// 3. Redirect users without role to /onboarding
// 4. Redirect /me to /me/[username]
// 5. Enforce role-based access
```

## Form Handling

### Validation Pattern
- Client-side: Zod schemas
- Inline errors: shadcn `FormMessage`
- Success feedback: Sonner toast

### File Upload Validation
```typescript
// src/lib/validations.ts
const ALLOWED_AUDIO = ["audio/mpeg", "audio/wav"];
const ALLOWED_VIDEO = ["video/mp4"];
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 500MB
```

## Reserved Slugs

```typescript
const RESERVED_SLUGS = [
  "me", "dashboard", "sign-in", "sign-up",
  "api", "admin", "settings"
];
```

## Accessibility Requirements

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader friendly
- Color contrast ratios
- Focus indicators
- Alt text for images

## Performance Requirements

- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1
- Time to Interactive < 3s
