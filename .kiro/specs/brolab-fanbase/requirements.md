# Requirements Document

## Introduction

BroLab Fanbase est une plateforme mobile-first permettant aux artistes de créer leur hub personnel ("one link") pour connecter directement avec leurs fans. Les artistes peuvent gérer leur profil, liens, événements et revenus. Les fans peuvent suivre leurs artistes favoris, acheter du merch/tickets et gérer leurs abonnements.

Stack technique : Next.js 14.x (App Router), TypeScript, shadcn/ui, Tailwind CSS, Clerk (auth), Convex (backend), Stripe (paiements), déployé sur Vercel.

MVP stores uploaded audio/video in Convex File Storage; for larger scale and heavy video bandwidth, migrate later to Cloudflare R2.

## Glossary

- **System**: L'application BroLab Fanbase dans son ensemble
- **Artist**: Utilisateur avec le rôle "artist" qui gère un hub public
- **Fan**: Utilisateur avec le rôle "fan" qui suit des artistes
- **Hub**: Page publique d'un artiste accessible via /[artistSlug]
- **Dashboard**: Interface privée de gestion (artiste ou fan)
- **AppShell**: Composant layout avec navigation (sidebar desktop, bottom nav mobile)
- **Slug**: Identifiant URL-friendly (lowercase, tirets, sans accents)

## Requirements

### Requirement 1: Landing Page Marketing

**User Story:** As a visitor, I want to see a compelling landing page, so that I understand the value proposition and can join the waitlist.

#### Acceptance Criteria

1. WHEN a visitor accesses the root URL, THE System SHALL display a landing page with hero section containing the tagline "Your career isn't an algorithm."
2. WHEN a visitor views the landing page, THE System SHALL display an email input field with "Join Beta" CTA button
3. WHEN a visitor submits a valid email, THE System SHALL store the email in the waitlist and display a success confirmation
4. WHEN a visitor submits an invalid email, THE System SHALL display an error message without storing the data
5. THE Landing_Page SHALL display a feature grid with three columns: "Direct to Fan", "Global Commerce", "Own Your Data"
6. THE Landing_Page SHALL include a minimal navbar with "BroLab Fanbase" brand, "Sign In" link, and "Join Beta" button
7. THE Landing_Page SHALL include a footer with Terms, Privacy, Contact links and copyright

### Requirement 2: Authentication System

**User Story:** As a user, I want to sign up and sign in securely, so that I can access my personalized dashboard.

#### Technical Implementation Notes

- Use `clerkMiddleware()` from `@clerk/nextjs/server` (NOT deprecated `authMiddleware()`)
- Wrap app with `<ClerkProvider>` in root layout
- Use Clerk components: `<SignIn />`, `<SignUp />`, `<SignedIn>`, `<SignedOut>`, `<UserButton>`
- Server functions (`auth()`, `currentUser()`) from `@clerk/nextjs/server`

#### Acceptance Criteria

1. WHEN a visitor clicks "Sign In", THE System SHALL redirect to /sign-in page powered by Clerk
2. WHEN a visitor clicks "Sign Up" or "Join Beta", THE System SHALL redirect to /sign-up page powered by Clerk
3. WHEN a new user completes sign-up, THE System SHALL display a role selection screen with "Artist" and "Fan" options
4. WHEN a user selects a role, THE System SHALL store the role in Clerk publicMetadata.role
5. WHEN an authenticated artist accesses /dashboard, THE System SHALL allow access
6. WHEN an unauthenticated user accesses /dashboard, THE System SHALL redirect to /sign-in
7. WHEN an authenticated fan accesses /me, THE System SHALL redirect to /me/[username]
8. WHEN a fan without artist role accesses /dashboard, THE System SHALL redirect to appropriate page

### Requirement 3: Public Artist Hub

**User Story:** As a fan, I want to view an artist's public hub via a simple URL, so that I can discover their content and follow them.

#### Acceptance Criteria

1. WHEN a visitor accesses /[artistSlug], THE System SHALL display the artist's public hub page
2. THE Public_Hub SHALL display cover image with gradient overlay, centered avatar, artist name (serif typography), and bio
3. THE Public_Hub SHALL display a "Follow" toggle button and social media icon pills
4. THE Public_Hub SHALL display tabs for "Latest Drops" and "Tour Dates"
5. WHEN a visitor clicks "Follow" while authenticated, THE System SHALL toggle the follow status
6. WHEN a visitor clicks "Follow" while unauthenticated, THE System SHALL redirect to sign-in
7. WHEN an invalid artistSlug is accessed, THE System SHALL display a 404 page

### Public Hub — Artist Links (DEPRECATED)

> **DEPRECATED**: Linktree-style links display on Public Hub has been removed.
> The Public Hub now only displays: HubHeader (with social icons) → Tabs (Latest Drops / Tour Dates).
> Custom links are managed via /dashboard/links but NOT displayed on the Public Hub.

### Artist — Business Links (Custom Links)

#### R-ART-LINKS-1: Business Links Only
THE `/dashboard/links` page SHALL manage business links only (merch, tickets, booking, press kit, newsletter, donate, website, other). Social media links are managed exclusively in "Profile & Bio → Social Links".

#### R-ART-LINKS-2: Social Links Separation
Social media platforms (Instagram, YouTube, Spotify, TikTok, SoundCloud, Apple Music, Facebook, Twitch) SHALL be managed ONLY via "Profile & Bio → Social Links", not via Custom Links.

#### R-ART-LINKS-3: URL Domain Validation
THE System SHALL reject URLs pointing to social/streaming platform domains (defined in `BLOCKED_SOCIAL_DOMAINS`) with the error message: "Manage social links in Profile & Bio → Social Links."

**Blocked domains:**
- instagram.com
- x.com, twitter.com
- youtube.com, youtu.be
- spotify.com, open.spotify.com
- tiktok.com
- soundcloud.com
- music.apple.com
- facebook.com
- twitch.tv

#### R-ART-LINKS-4: Type Dropdown Restriction
THE "Type" dropdown in the Add Link dialog SHALL NOT display social media types. Only business types SHALL be available: merch, tickets, website, booking, presskit, newsletter, donate, other.

### Requirement 4: Artist Dashboard

**User Story:** As an artist, I want a dashboard to manage my hub and view my stats, so that I can grow my fanbase and revenue.

#### Acceptance Criteria

1. WHEN an artist accesses /dashboard, THE System SHALL display the overview page with stats cards (Followers, Revenue, Upcoming Events)
2. THE Artist_Dashboard SHALL display a "Setup Checklist" card with onboarding steps
3. THE Artist_Dashboard SHALL display a "Create New Content" card with "Add Link" and "Add Event" actions
4. THE Artist_Dashboard SHALL include a "View Public Hub" link to preview the public page
5. WHEN an artist navigates via sidebar, THE System SHALL display the corresponding section (Profile, Links, Events, Billing)

### Artist — Dashboard Overview Stats (Real Data)

#### R-ART-DASH-STAT-1: Followers Count
THE Followers stat card SHALL display the real count of follows for the current artist, queried from Convex `follows` table by `artistId`.

#### R-ART-DASH-STAT-2: Upcoming Events Count
THE Upcoming Events stat card SHALL display the real count of future events for the current artist, filtered by `date >= now` from Convex `events` table.

#### R-ART-DASH-STAT-3: Revenue Display
THE Revenue stat card SHALL display real revenue data:
- **Option A (Preferred)**: Use `artistBilling.getSummary` to display `available + pending` balance
- **Option B (Fallback)**: Calculate total from paid orders via `orders`/`orderItems` filtered by artist's products

#### R-ART-DASH-STAT-4: Loading & Empty States
THE stat cards SHALL:
- Display skeleton loaders during data fetch
- Format values appropriately (followers/events as integers, revenue as currency)
- Handle empty states gracefully (display "0" or "$0.00", not placeholders)

### Requirement 5: Artist Profile Management

**User Story:** As an artist, I want to edit my profile information, so that fans see accurate and appealing content.

#### Acceptance Criteria

1. WHEN an artist accesses /dashboard/profile, THE System SHALL display editable profile form
2. THE Profile_Form SHALL include fields for: Profile Image URL, Display Name, Unique Slug, Bio
3. THE Profile_Form SHALL display social links list with toggle switches (on/off) for each platform
4. WHEN an artist saves changes, THE System SHALL persist data to Convex and display success toast
5. WHEN an artist enters an already-taken slug, THE System SHALL display an error message
6. THE Slug_Field SHALL show prefix "fan.brolab/" before the editable slug input

### Requirement 6: Artist Links Management

**User Story:** As an artist, I want to manage my links, so that fans can access my content across platforms.

#### Acceptance Criteria

1. WHEN an artist accesses /dashboard/links, THE System SHALL display a list of existing links
2. THE Links_Page SHALL include an "Add New Link" button
3. WHEN an artist adds a link, THE System SHALL store title, URL, and type (Latest Release, Instagram, YouTube, etc.)
4. WHEN an artist toggles a link's visibility, THE System SHALL update the active status
5. THE Links_List SHALL display each link with title, URL preview, type badge, and active toggle

### Requirement 7: Artist Events Management

**User Story:** As an artist, I want to manage my events and tours, so that fans can discover and attend my shows.

#### Acceptance Criteria

1. WHEN an artist accesses /dashboard/events, THE System SHALL display stats (Total Tickets Sold, Gross Revenue, Upcoming Shows)
2. THE Events_Page SHALL display a list of events with image, title, date, venue, tickets sold, revenue, and status badge
3. THE Events_Page SHALL include a "Create Event" button
4. WHEN an artist creates an event, THE System SHALL store date, city, venue, ticket URL, and image URL
5. WHEN an artist clicks "Manage" on an event, THE System SHALL display event details and edit options

### Requirement 8: Artist Billing & Payouts (Stripe Connect)

**User Story:** As an artist, I want to receive payments directly from fans via Stripe Connect with automatic payouts, so that I can manage my earnings professionally.

**Business Model:** Fans pay artists directly (no platform commission). Platform revenue comes from artist subscriptions (Clerk Billing: Free/Pro/Premium).

#### Acceptance Criteria

**R-ART-CONNECT (Stripe Connect Onboarding & Status)**

1. **R-ART-CONNECT-1**: WHEN an artist initiates Stripe Connect onboarding, THE System SHALL use Stripe Connect Express (recommended) to create a connected account
2. **R-ART-CONNECT-2**: THE System SHALL store Stripe Connect state in Convex `artists` table:
   - `stripeConnectAccountId` (string, optional)
   - `connectStatus` (enum: "not_connected" | "pending" | "connected")
   - `chargesEnabled` (boolean)
   - `payoutsEnabled` (boolean)
   - `requirementsDue` (array of strings, e.g., ["bank_account", "identity_verification"])
3. **R-ART-CONNECT-3**: THE System SHALL update connect status automatically via Stripe webhooks (`account.updated`) with idempotency via `processedEvents` table
4. **R-ART-CONNECT-4**: WHEN an artist's account has `requirementsDue`, THE System SHALL display actionable requirements in the UI with a "Continue Setup" CTA

**R-ART-PAYOUT (Automatic Payouts Only)**

1. **R-ART-PAYOUT-1**: Payouts to artists SHALL be automatic, managed by Stripe's payout schedule (configured on the connected account)
2. **R-ART-PAYOUT-2**: THE System SHALL NOT trigger manual payouts (no `stripe.payouts.create` calls in V1)
3. **R-ART-PAYOUT-3**: THE UI MAY provide a "Manage Payouts on Stripe" link (Stripe Express dashboard login link) but SHALL NOT include a "Withdraw Funds" button

**R-ART-BAL (Real Balances - Deterministic Read Model)**

1. **R-ART-BAL-1**: THE Artist Billing page SHALL display real `available` and `pending` balances
2. **R-ART-BAL-2**: Balance data SHALL come from a deterministic Convex read-model fed by Stripe webhooks (`balance.available`) and/or non-blocking refresh actions
3. **R-ART-BAL-3**: THE System SHALL display "Last Payout" information (amount, date, status) if available
4. **R-ART-BAL-4**: IF balance webhooks are not implemented in V1, THE System MAY display a simplified view with transaction totals from Convex `orders` data

**R-ART-TXN (Real Transactions List)**

1. **R-ART-TXN-1**: THE "Recent Transactions" list SHALL display real sales data, not placeholder/mock data
2. **R-ART-TXN-2**: Transaction data source of truth SHALL be Convex `orders`/`orderItems` filtered by `artistId` via relation: `orderItems.productId` → `products.artistId`
3. **R-ART-TXN-3**: Transaction statuses (`paid`, `refunded`, `pending`) SHALL be mapped to UI-friendly labels
4. **R-ART-TXN-4**: IF no transactions exist, THE System SHALL display an empty state message (not fake transactions)

**R-CHECKOUT-CONNECT (Fan Checkout Routed to Artist)**

1. **R-CHECKOUT-CONNECT-1**: WHEN a fan purchases a product, THE payment SHALL be routed to the artist's Stripe Connect account using destination charges (`transfer_data.destination`)
2. **R-CHECKOUT-CONNECT-2**: THE platform SHALL NOT take a commission on sales (`application_fee_amount = 0`) because platform revenue comes from artist subscriptions
3. **R-CHECKOUT-CONNECT-3**: THE webhook `checkout.session.completed` SHALL continue to create Convex `orders`/`orderItems` and grant download entitlements, even in Connect mode
4. **R-CHECKOUT-CONNECT-4**: IF an artist is not connected to Stripe, THE System SHALL prevent product purchases and display an error message to fans

**R-PROD-0 (No Mock Data - Updated)**

1. **R-PROD-0.1**: NO mock/placeholder data SHALL be visible in Artist Billing (no fake transactions, no "Coming Soon" badges without real state)
2. **R-PROD-0.2**: IF an artist is not connected to Stripe, THE page SHALL display a real "Connect Stripe" state with actionable CTA, not fake balance/transaction data
3. **R-PROD-0.3**: ALL UI states (not_connected, pending, connected) SHALL reflect real data from Convex deterministic queries

### Requirement 9: Fan Dashboard

**User Story:** As a fan, I want a personalized feed of my followed artists, so that I never miss updates.

#### Acceptance Criteria

1. WHEN a fan accesses /me, THE System SHALL redirect to /me/[username] based on their Clerk username
2. THE Fan_Dashboard SHALL display a feed of posts from followed artists
3. THE Feed_Card SHALL display artist avatar, name, timestamp, content (image/text), and action buttons (like, comment, share)
4. THE Feed_Card SHALL include contextual CTA buttons (Listen, Get Tickets, Shop Now)
5. WHILE on desktop, THE Fan_Dashboard SHALL display sidebar widgets: "My Community" stats, "Suggested Artists", "Featured Track"
6. WHILE on mobile, THE Fan_Dashboard SHALL display single-column feed layout

### Requirement 10: Fan Purchases

**User Story:** As a fan, I want to view my purchase history, so that I can access my digital content and track orders.

#### Acceptance Criteria

1. WHEN a fan accesses /me/[username]/purchases, THE System SHALL display purchase history list
2. THE Purchase_Item SHALL display product image, type badge (Merch/Music/Ticket), title, artist name, date, and price
3. WHEN a purchase is downloadable, THE System SHALL display a "Download" button
4. WHEN a purchase is a ticket, THE System SHALL display event status (Upcoming/Shipped)
5. THE Purchases_Page SHALL include "View Details" link for each item

### Requirement 11: Fan Billing & Payment Methods

**User Story:** As a fan, I want to manage my payment methods and view billing history, so that I can control my spending.

#### Acceptance Criteria

1. WHEN a fan accesses /me/[username]/billing, THE System SHALL display two tabs: "Payment Methods" and "Billing History"
2. THE Payment_Methods_Tab SHALL display saved cards with last 4 digits and "Remove" option
3. THE Payment_Methods_Tab SHALL include "Add Payment Method" button
4. THE Billing_History_Tab SHALL display list of transactions with date, description, and amount
5. THE Billing_Page SHALL display security notice about Stripe-secured payments

### Requirement 12: Mobile-First Navigation

**User Story:** As a user, I want app-like navigation on mobile, so that I can easily access all features.

#### Acceptance Criteria

1. WHILE viewport is mobile (< lg breakpoint), THE System SHALL display top bar with brand and burger menu icon
2. WHILE viewport is mobile, THE System SHALL display persistent bottom navigation with 4-5 icons
3. WHEN user taps burger menu, THE System SHALL open a Sheet drawer with full navigation and user info
4. WHILE viewport is desktop (>= lg breakpoint), THE System SHALL display sidebar navigation instead of bottom nav
5. THE Bottom_Nav SHALL display different items based on role: Fan (Feed, Following, Purchases, Billing) vs Artist (Overview, Profile, Links, Events, Billing)

### Requirement 13: Theme System

**User Story:** As a user, I want to toggle between light and dark mode, so that I can use the app comfortably in any environment.

#### Acceptance Criteria

1. THE System SHALL support light and dark color themes
2. THE Theme_Toggle SHALL be accessible from the navigation (top bar or sidebar)
3. WHEN user toggles theme, THE System SHALL persist preference and apply immediately
4. THE Theme SHALL use shadcn/ui tokens with custom values matching SuperDesign aesthetic (lavender accent, soft borders, generous spacing)

### Requirement 14: Subscription Plans

**User Story:** As a user, I want to subscribe to a plan, so that I can access premium features.

#### Acceptance Criteria

1. THE System SHALL offer 2 subscription plans in USD via Clerk Billing (Stripe-based)
2. WHEN a user accesses billing page, THE System SHALL display current plan and "Manage Subscription" button
3. WHEN a user clicks "Manage Subscription", THE System SHALL open Clerk billing portal
4. THE System SHALL require authentication before any subscription action

### Requirement 15: Data Persistence

**User Story:** As a user, I want my data to be saved reliably, so that I don't lose my information.

#### Acceptance Criteria

1. THE System SHALL store user data in Convex with the following schema: users, artists, links, events, follows, waitlist
2. WHEN a user signs up via Clerk, THE System SHALL create/update corresponding Convex user record
3. WHEN an artist updates profile, THE System SHALL persist changes to Convex artists table
4. WHEN a fan follows/unfollows an artist, THE System SHALL update Convex follows table
5. THE System SHALL use Clerk userId as foreign key reference in Convex tables
6. THE System SHALL store the following additional tables: products, orders, orderItems, processedEvents
7. WHEN an artist creates a slug, THE System SHALL reject reserved keywords: me, dashboard, sign-in, sign-up, api, admin, settings

### Requirement 16: Digital Products Upload & Management

**User Story:** As an artist, I want to upload digital products (music/video) to Convex storage and manage them, so fans can purchase and download them.

#### Acceptance Criteria

1. WHEN an artist accesses /dashboard/products, THE System SHALL display a list of existing products (Music/Video)
2. THE Products_Page SHALL include an "Add Product" button
3. WHEN an artist creates a product, THE System SHALL store in Convex: title, description, type (music|video), coverImageUrl, priceUSD, visibility (public|private), fileStorageId, contentType, fileSize, createdAt
4. WHEN an artist uploads a file, THE System SHALL use Convex File Storage upload flow with upload URLs for files > 20MB
5. WHEN upload succeeds, THE System SHALL create or update the product record with the returned fileStorageId and metadata
6. WHEN an artist deletes a product, THE System SHALL delete the product record and associated file from Convex storage
7. THE System SHALL restrict product upload and management to authenticated users with role artist

### Requirement 17: Fan Downloads (Ownership-gated)

**User Story:** As a fan, I want to securely download purchased music/video products.

#### Acceptance Criteria

1. WHEN a fan accesses /me/[username]/purchases, THE System SHALL display purchase history with downloadable items
2. WHEN a purchase item is downloadable, THE System SHALL display a "Download" button
3. WHEN a fan clicks "Download", THE System SHALL verify ownership: fan is authenticated, orderItem exists linking fanUserId to productId, order status is paid
4. IF ownership is valid, THE System SHALL return a file URL generated from the stored fileStorageId
5. IF ownership is invalid, THE System SHALL show an error (403) and MUST NOT return the file URL
6. THE System SHALL optionally log download attempts in downloads table with fanUserId, productId, timestamp

### Requirement 18: Digital Product Purchase Flow

**User Story:** As a fan, I want to buy a digital product via Stripe and then download it in my purchases.

#### Acceptance Criteria

1. WHEN a fan clicks "Buy" on a product, THE System SHALL create a Stripe Checkout session for one-time payment
2. WHEN Stripe webhook confirms payment success, THE System SHALL create orders record (fanUserId, total, currency, status=paid, stripeCheckoutSessionId)
3. WHEN order is created, THE System SHALL create orderItems records (orderId, productId, type, price, fileStorageId snapshot)
4. AFTER webhook success, the purchased product SHALL appear in /me/[username]/purchases with "Download" enabled
5. THE System SHALL implement webhook idempotency: store processed Stripe event IDs in processedEvents table to avoid duplicate orders


## 19. Media Playback (Audio/Video) — MVP

### 19.1 Global Player (Audio) — Core
- The app SHALL provide a global audio player that persists across navigation (fan + artist dashboards + public hub).
- Playback state (playing/paused, currentTime, duration, volume, currentTrack) SHALL remain consistent when navigating between routes.
- The global player SHALL support:
  - Play / Pause
  - Seek (scrub) on a progress bar
  - Next/Previous (queue-based; MVP queue can be 1 track minimum but API must allow extension)
  - Volume (optional for MVP UI, but state must exist)
- The global player SHALL be client-side (no RSC dependency for dashboards).

### 19.2 Track Sources & URLs (Convex Storage)
- Audio/video files SHALL be stored in Convex File Storage.
- The app SHALL obtain playable URLs using Convex storage URL resolution (e.g. getUrl) via a server function.
- For MVP:
  - Public products (visibility="public") MAY be streamed (playable URL).
  - Purchased-only content MUST be gated by ownership checks for download URLs (existing requirements still apply).

### 19.3 UI Contracts (SuperDesign + Dribbble-inspired)
- The app MUST implement play affordances similar to SuperDesign:
  - Media cards (audio/video) SHALL show a centered Play button overlay on hover (desktop) and on tap (mobile).
  - The overlay SHALL toggle to Pause when the same media is currently playing.
- A functional component named **FeaturedTrackCard** MUST exist and MUST NOT be renamed.
  - FeaturedTrackCard MUST display: track title, artist, play/pause, progress indicator.
  - FeaturedTrackCard MUST control the global player (not decorative only).

### 19.4 Video Playback (MVP)
- Video products SHALL be playable via a lightweight viewer:
  - MVP may use a modal (preferred) OR a dedicated page, but behavior must be consistent.
  - When a video starts, the audio player SHALL either pause or continue based on a single MVP rule (default: pause audio).
- Video viewer SHALL support play/pause and seek.

### 19.5 Analytics Hooks (Optional)
- The player SHALL expose hooks/events for: onPlay, onPause, onEnded, onSeek (no analytics provider required in MVP).

### 19.6 Non-Functional
- The player UI MUST be keyboard accessible (space toggles play/pause when focused).
- The player MUST handle failed URLs gracefully (toast + reset state).

## 20. Media Upload (Artist) — MVP

### 20.1 Upload Requirements
- Artists SHALL upload audio/video files for products using Convex File Storage.
- Each product SHALL have at most **one** media file in MVP.
- The system SHALL store: `fileStorageId`, `contentType`, `fileSize` on the product record.

### 20.2 File Types (MVP)
- Audio: mp3, wav (optional), m4a (optional)
- Video: mp4 (minimum)

### 20.3 Playback for Uploaded Files
- Uploaded audio/video MUST be playable via the global player (subject to visibility and ownership rules).


## Public V1 — Production Readiness (Payments & Feed)

### R-PROD-0 — No Mock Data (Hard Rule)
- **R-PROD-0.1**: Aucune donnée mock/placeholder ne doit être affichée sur des pages user-facing (fan/artist/public).
- **R-PROD-0.2**: Toute section "Coming soon" doit être remplacée par un flux réel ou un empty state honnête (sans fausses cartes, sans fausses transactions).

---

## Fan Billing — Saved Payment Methods (Stripe SetupIntent + Webhooks + Convex deterministic queries)

### R-FAN-PM-1 — Stripe Customer binding
- **R-FAN-PM-1.1**: Chaque user (fan) a un `stripeCustomerId` persisté dans Convex (table `users`).
- **R-FAN-PM-1.2**: Si `stripeCustomerId` absent, il est créé via une **Convex action** `stripe.ensureCustomerForCurrentUser` et stocké dans Convex (idempotent).
- **R-FAN-PM-1.3**: Le Stripe Customer est créé avec `email` et `metadata: { convexUserId, clerkUserId }` pour traçabilité.

### R-FAN-PM-2 — Add payment method (SetupIntent)
- **R-FAN-PM-2.1**: Le clic "Add payment method" appelle l'action Convex `stripe.createSetupIntent` qui crée un SetupIntent Stripe et renvoie `clientSecret`.
- **R-FAN-PM-2.2**: Le frontend utilise **Stripe Elements** (`<Elements clientSecret>` + `<PaymentElement>`) pour collecter et confirmer le moyen de paiement.
- **R-FAN-PM-2.3**: La confirmation utilise `stripe.confirmSetup({ elements, redirect: "if_required" })` sans redirect URL.
- **R-FAN-PM-2.4**: Aucune donnée de carte complète n'est stockée côté app (uniquement metadata : brand/last4/expMonth/expYear).

### R-FAN-PM-3 — Deterministic read model in Convex
- **R-FAN-PM-3.1**: La liste des payment methods affichée dans l'app provient **exclusivement** d'une **Convex query déterministe** `paymentMethods.listForCurrentUser`.
- **R-FAN-PM-3.2**: Les payment methods sont synchronisés vers Convex **uniquement via Stripe webhooks** (push), pas via appels Stripe en query.
- **R-FAN-PM-3.3**: La table `paymentMethods` contient : `userId`, `stripeCustomerId`, `stripePaymentMethodId`, `brand`, `last4`, `expMonth`, `expYear`, `isDefault`, `billingName`, `billingEmail`, `createdAt`, `updatedAt`.
- **R-FAN-PM-3.4**: Index requis : `by_userId`, `by_stripeCustomerId`, `by_stripePaymentMethodId`.

### R-FAN-PM-4 — Webhooks coverage + idempotence
- **R-FAN-PM-4.1**: Les webhooks Stripe sont vérifiés par signature (`stripe.webhooks.constructEvent`) et traités de façon idempotente via `processedEvents` (provider="stripe", eventId).
- **R-FAN-PM-4.2**: Les événements minimaux requis pour PM sync :
  - `setup_intent.succeeded` → upsert payment method
  - `payment_method.attached` → upsert payment method (fallback)
  - `payment_method.detached` → delete payment method
  - `customer.updated` → sync `isDefault` from `invoice_settings.default_payment_method`
- **R-FAN-PM-4.3**: Sur ces events, Convex internal mutations (`upsertFromStripe`, `removeByStripePaymentMethodId`, `setDefaultByCustomer`) sont appelées.
- **R-FAN-PM-4.4**: Les données carte proviennent de `payment_method.card.brand`, `payment_method.card.last4`, `payment_method.card.exp_month`, `payment_method.card.exp_year`, `payment_method.billing_details`.

### R-FAN-PM-5 — Default payment method management
- **R-FAN-PM-5.1**: L'app peut définir une carte par défaut (optionnel V1) via action Convex `stripe.setDefaultPaymentMethod`.
- **R-FAN-PM-5.2**: L'action appelle `stripe.customers.update(customerId, { invoice_settings: { default_payment_method } })`.
- **R-FAN-PM-5.3**: La vérité finale est reflétée via webhook `customer.updated` qui met à jour `isDefault` dans Convex.

### R-FAN-PM-6 — Remove payment method
- **R-FAN-PM-6.1**: L'utilisateur peut retirer un PM via action Convex `stripe.detachPaymentMethod`.
- **R-FAN-PM-6.2**: L'action appelle `stripe.paymentMethods.detach(paymentMethodId)`.
- **R-FAN-PM-6.3**: La suppression est reflétée dans Convex via webhook `payment_method.detached` (source of truth).

### R-FAN-PM-7 — UX feedback
- **R-FAN-PM-7.1**: Après `confirmSetup` réussi, afficher toast "Payment method added — syncing…".
- **R-FAN-PM-7.2**: La liste se met à jour automatiquement via Convex reactivity (pas de refresh manuel).
- **R-FAN-PM-7.3**: Pendant les actions (set default, remove), afficher loading state sur le bouton concerné.

---

## Fan Feed — Real Data (Artist-first)

### R-FEED-1 — Feed powered by Convex (real)
- **R-FEED-1.1**: Le feed fan affiche des items réels issus de Convex (pas de posts mock).
- **R-FEED-1.2**: Source: artistes suivis (table `follows`) → dernières publications (`products` et/ou drops).
- **R-FEED-1.3**: Tri desc par `createdAt`/`publishedAt` (défini dans le modèle).
- **R-FEED-1.4**: Pagination (cursor/limit) obligatoire (V1).

### Fan Feed — Pagination & Stability

#### R-FAN-FEED-1: Paginated Feed Display
THE Fan Feed SHALL display items paginated with a configurable limit (default: 10) and support "Load more" functionality via nextCursor.

#### R-FAN-FEED-2: Client-Side Accumulation Without Duplicates
THE System SHALL accumulate feed pages on the client side and deduplicate items by `_id` to prevent duplicate displays.

#### R-FAN-FEED-3: Refresh Behavior
WHEN a fan refreshes the page, THE System SHALL reset the feed to the first page (initial load state).

#### R-FAN-FEED-4: Race Condition Prevention
THE "Load more" button SHALL be disabled during fetch operations to prevent race conditions from rapid clicks.

#### R-FAN-FEED-5: End of Feed Indication
WHEN `nextCursor` is null or undefined, THE "Load more" button SHALL be hidden or disabled to indicate the end of the feed.

---

## Stripe One-time purchases — Production End-to-End

### R-STRIPE-OT-1 — Checkout + webhook fulfillment
- **R-STRIPE-OT-1.1**: Les paiements ponctuels sont gérés via Stripe Checkout avec webhooks

---

## Marketing — Landing/Home (Conversion-First)

### R-MKT-LAND-1: Value Proposition Clarity
THE Landing page hero SHALL communicate the core value proposition within 5 seconds:
- Fans pay you directly (via Stripe Connect)
- Powered by Stripe Connect with automatic payouts
- 0% platform fee on sales (platform earns from artist subscriptions)
- Clear differentiation from competitors

**Success Criteria:**
- First-time visitor understands business model in ≤5 seconds
- Value prop passes "mom test" (non-technical person understands it)

### R-MKT-LAND-2: Primary CTA (Artist-First)
THE primary CTA SHALL be "Start free as an Artist" and lead to the artist sign-up flow (Clerk).

**Secondary CTA:** "Explore artists" (public hub / explore page)

**CTA Requirements:**
- Primary CTA visible above the fold on all devices
- High contrast (meets WCAG AA standards)
- Clear action verb ("Start", not "Learn more")

### R-MKT-LAND-3: Mobile-First Hierarchy
ON mobile viewport, THE hero section SHALL display in this order:
1. Headline
2. Subheadline
3. Primary CTA
4. Trust indicators (3 bullets max)
5. Secondary sections (below fold)

**Mobile Requirements:**
- Hero content fits in first viewport (no scroll to see CTA)
- Touch targets ≥44x44px
- Readable font sizes (≥16px body, ≥24px headlines)

### R-MKT-LAND-4: Page Structure (6 Sections Max)
THE Landing page SHALL contain maximum 6 sections in this recommended order:

1. **Hero** - Value prop + CTA
2. **Proof Bar** - 3 trust indicators (e.g., "Direct payouts", "0% sales fee", "Stripe secured")
3. **How It Works** - 3 steps (Sign up → Connect Stripe → Share link)
4. **Use Cases** - 3 cards (Music, Merch, Tickets)
5. **Social Proof** - Minimal (optional: testimonial or stats)
6. **FAQ** - 5 questions max

**Rationale:** Reduce cognitive load, improve conversion, faster page load

### R-MKT-LAND-5: No Misleading Content
THE Landing page SHALL NOT display:
- Mock data (fake user counts, fake revenue)
- "Coming soon" for features not in production
- Promises that cannot be fulfilled in current version

**IF a use-case is not live:**
- Wording SHALL indicate "coming soon" discreetly
- OR omit the feature entirely until ready

### R-MKT-LAND-6: Performance Requirements
THE Landing page SHALL meet these performance standards:

**Technical:**
- All images via `next/image` with proper sizing
- Minimal client-side JavaScript (prefer RSC)
- Animations: lightweight only (framer-motion with reduced motion support)
- Lighthouse Performance score ≥90 (mobile)
- First Contentful Paint (FCP) ≤1.8s
- Largest Contentful Paint (LCP) ≤2.5s

**Bundle Size:**
- Landing page JS bundle ≤100KB (gzipped)
- No heavy client components unless necessary

### R-MKT-LAND-7: Analytics & Tracking
THE System SHALL track these conversion events using PostHog:

**Required Events:**
- `landing_page_view` - Page load
- `start_as_artist_click` - Primary CTA click
- `explore_artists_click` - Secondary CTA click
- `waitlist_submit` - Email submission (if applicable)
- `sign_up_initiated` - Redirected to sign-up page

**Optional Events (V2):**
- Section scroll depth
- FAQ expansion
- External link clicks

**Implementation (PostHog Next.js):**

**Installation:**
```bash
npm install posthog-js
```

**Environment Variables:**
```env
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com  # or eu.i.posthog.com
```

**Setup (App Router):**
- Create `instrumentation-client.ts` (Next.js 15.3+) OR use provider pattern (Next.js 14.x)
- Initialize PostHog with `posthog.init()` in client component
- Wrap app with PostHog provider if using provider pattern

**Event Tracking API:**
```typescript
// Direct import (client components)
import posthog from 'posthog-js'
posthog.capture('event_name', { property: 'value' })

// React hook (client components)
import { usePostHog } from 'posthog-js/react'
const posthog = usePostHog()
posthog.capture('event_name', { property: 'value' })
```

**Features:**
- Autocapture: Automatic pageviews and click tracking (can be disabled)
- Privacy-first: GDPR compliant, no Google Analytics
- No PII tracking: Track events without personally identifiable information

**Reference:** https://posthog.com/docs/libraries/next-js

### R-MKT-LAND-8: Copy Guidelines (English)
THE Landing page copy SHALL follow these guidelines:

**Tone:**
- Premium but clear (not cryptic or overly clever)
- Direct and benefit-focused
- Artist-first perspective

**Headline Style:**
- Short (≤10 words)
- Benefit-driven (not feature-driven)
- Active voice

**Example Copy (Reference):**
```
Headline: "Fans pay you directly."
Subheadline: "Sell music, merch, and tickets with Stripe Connect payouts. We earn from your subscription—not your sales."
Trust Line: "0% platform fee on sales • Automatic payouts • No credit card required"
```

### R-MKT-LAND-9: Competitive Differentiation
THE Landing page SHALL clearly communicate differentiation from competitors:

**Key Differentiators:**
- Direct payments (not platform-held funds)
- 0% sales commission (vs Patreon 5-12%, Bandcamp 10-15%)
- Automatic payouts (vs manual withdrawal)
- Artist subscriptions fund platform (transparent business model)

**Positioning:**
- "Built for artists who want control"
- "Your earnings, your timeline"
- "No middleman taking a cut"

### R-MKT-LAND-10: Accessibility Requirements
THE Landing page SHALL meet WCAG 2.1 AA standards:

- Color contrast ≥4.5:1 for text
- Focus indicators visible on all interactive elements
- Semantic HTML (proper heading hierarchy)
- Alt text for all images
- Keyboard navigation support
- Screen reader friendly

### R-MKT-LAND-11: Success Metrics (Target)
THE Landing page SHALL aim for these conversion metrics:

**Primary Metrics:**
- Artist sign-up conversion rate: ≥3% (industry standard: 2-5%)
- Bounce rate: ≤60%
- Time on page: ≥45 seconds

**Secondary Metrics:**
- CTA click-through rate: ≥10%
- Mobile vs desktop conversion parity: ≥80%

**Measurement Period:** 30 days post-launchtuels utilisent Stripe Checkout.
- **R-STRIPE-OT-1.2**: Le webhook `checkout.session.completed` met à jour `orders`/`orderItems` et déclenche l'entitlement (downloads/licence).
- **R-STRIPE-OT-1.3**: Accès downloads/licence doit être **server-side gated** sur `orders` payés.

---

## Artist Subscription (Clerk Billing) — Platform Revenue Model

### Business Context
- **Platform Revenue**: Artist subscriptions (Clerk Billing: Free/Premium)
- **Fan Payments**: Direct to artists via Stripe Connect (0% platform fee)
- **Subscription Plans**: Free (limited) / Premium ($19.99/month, unlimited)

### R-ART-SUB-1: Upgrade Flow (Free → Premium)
THE System SHALL provide a real Clerk Billing checkout flow for artists to upgrade from Free to Premium:

- **R-ART-SUB-1.1**: WHEN an artist clicks "Upgrade to Premium", THE System SHALL redirect to Clerk Billing checkout (not mock/placeholder)
- **R-ART-SUB-1.2**: THE checkout SHALL be handled by Clerk Billing (hosted UI)
- **R-ART-SUB-1.3**: AFTER successful payment, Clerk SHALL automatically update `publicMetadata.subscription` with plan="premium", status="active"
- **R-ART-SUB-1.4**: THE System SHALL display success confirmation and updated plan status immediately after redirect back

### R-ART-SUB-2: Manage/Cancel Flow
THE System SHALL provide a real Clerk Billing portal for subscription management:

- **R-ART-SUB-2.1**: WHEN an artist clicks "Manage Subscription", THE System SHALL redirect to Clerk Billing portal (not mock/placeholder)
- **R-ART-SUB-2.2**: THE portal SHALL allow: cancel subscription, update payment method, view invoices
- **R-ART-SUB-2.3**: WHEN an artist cancels, Clerk SHALL update `publicMetadata.subscription.status` to "canceled"
- **R-ART-SUB-2.4**: THE canceled subscription SHALL remain active until `currentPeriodEnd` (no immediate downgrade)

### R-ART-SUB-3: Source of Truth (Clerk Metadata)
THE System SHALL use Clerk `publicMetadata.subscription` as the single source of truth:

- **R-ART-SUB-3.1**: Subscription data SHALL be stored in Clerk `publicMetadata.subscription` with fields: `{ plan, status, currentPeriodEnd }`
- **R-ART-SUB-3.2**: Plans: `"free"` (default) | `"premium"`
- **R-ART-SUB-3.3**: Status: `"none"` (free) | `"active"` (paid) | `"trialing"` (trial) | `"canceled"` (canceling) | `"past_due"` (payment failed)
- **R-ART-SUB-3.4**: Convex queries SHALL read subscription status via `ctx.auth.getUserIdentity().publicMetadata.subscription`
- **R-ART-SUB-3.5**: Feature limits SHALL be enforced server-side in Convex mutations (not client-side only)

### R-ART-SUB-4: UI Status Display
THE UI SHALL display subscription status accurately:

- **R-ART-SUB-4.1**: WHEN plan="free" AND status="none", display "Free Plan" with upgrade CTA
- **R-ART-SUB-4.2**: WHEN plan="premium" AND status="active", display "Premium Plan" with manage CTA
- **R-ART-SUB-4.3**: WHEN plan="premium" AND status="trialing", display "Premium Plan (Trial)" with trial end date
- **R-ART-SUB-4.4**: WHEN plan="premium" AND status="canceled", display "Premium Plan (Canceling on [date])" with reactivate option
- **R-ART-SUB-4.5**: WHEN plan="premium" AND status="past_due", display "Payment Failed" with update payment method CTA
- **R-ART-SUB-4.6**: THE UI SHALL display usage stats (current/limit) for: products, events, links, storage

### R-ART-SUB-5: Downgrade Policy (Soft-Lock)
THE System SHALL implement soft-lock downgrade policy (never delete user data):

- **R-ART-SUB-5.1**: WHEN an artist downgrades from Premium to Free, existing content SHALL remain visible (not deleted)
- **R-ART-SUB-5.2**: IF artist has >5 products after downgrade, THE System SHALL block creation of new products
- **R-ART-SUB-5.3**: IF artist has >5 events after downgrade, THE System SHALL block creation of new events
- **R-ART-SUB-5.4**: IF artist has >5 links after downgrade, THE System SHALL block creation of new links
- **R-ART-SUB-5.5**: IF artist tries to upload video after downgrade, THE System SHALL block upload with error message
- **R-ART-SUB-5.6**: THE blocking message SHALL include "Upgrade to Premium" CTA with clear explanation
- **R-ART-SUB-5.7**: Existing items SHALL remain editable (title, description, price, etc.) even if over quota

### R-ART-SUB-6: Tracking Events
THE System SHALL track subscription-related events for analytics:

- **R-ART-SUB-6.1**: Track `upgrade_click` when artist clicks "Upgrade to Premium"
- **R-ART-SUB-6.2**: Track `manage_click` when artist clicks "Manage Subscription"
- **R-ART-SUB-6.3**: Track `upgrade_success` when artist completes checkout (redirect back with success param)
- **R-ART-SUB-6.4**: Track `cancel_success` when artist cancels subscription (redirect back from portal)
- **R-ART-SUB-6.5**: Track `limit_hit` when artist hits quota limit (product/event/link/storage)
- **R-ART-SUB-6.6**: Events SHALL include metadata: `{ plan, status, limitType }` (if applicable)

### R-ART-SUB-7: Feature Limits (Enforcement)
THE System SHALL enforce these limits server-side in Convex mutations:

**Free Plan Limits:**
- Max 5 products
- Max 5 events
- Max 5 custom links
- No video uploads (audio only)
- Max file size: 50MB

**Premium Plan Limits:**
- Unlimited products
- Unlimited events
- Unlimited custom links
- Video uploads enabled
- Max file size: 500MB

**Enforcement Rules:**
- **R-ART-SUB-7.1**: BEFORE creating product/event/link, query current count and check against limit
- **R-ART-SUB-7.2**: IF limit exceeded, throw error with message: "You've reached the limit for [feature] on your current plan. Upgrade to create more."
- **R-ART-SUB-7.3**: BEFORE file upload, check: file type (video requires Premium) and file size (50MB Free, 500MB Premium)
- **R-ART-SUB-7.4**: IF file validation fails, throw error with upgrade CTA

---

## Artist subscriptions — Clerk Billing (source of truth) [DEPRECATED - See R-ART-SUB-* above]

### R-CLERK-SUB-1 — Subscription gating
- **R-CLERK-SUB-1.1**: Les subscriptions artistes sont gérées par Clerk Billing (source of truth).
- **R-CLERK-SUB-1.2**: Les features premium sont gated côté backend (pas uniquement UI).
