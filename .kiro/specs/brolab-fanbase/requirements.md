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

### Requirement 4: Artist Dashboard

**User Story:** As an artist, I want a dashboard to manage my hub and view my stats, so that I can grow my fanbase and revenue.

#### Acceptance Criteria

1. WHEN an artist accesses /dashboard, THE System SHALL display the overview page with stats cards (Followers, Revenue, Upcoming Events)
2. THE Artist_Dashboard SHALL display a "Setup Checklist" card with onboarding steps
3. THE Artist_Dashboard SHALL display a "Create New Content" card with "Add Link" and "Add Event" actions
4. THE Artist_Dashboard SHALL include a "View Public Hub" link to preview the public page
5. WHEN an artist navigates via sidebar, THE System SHALL display the corresponding section (Profile, Links, Events, Billing)

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

### Requirement 8: Artist Billing & Payouts

**User Story:** As an artist, I want to manage my earnings and payouts, so that I can receive my revenue.

#### Acceptance Criteria

1. WHEN an artist accesses /dashboard/billing, THE System SHALL display available balance with pending and last payout amounts
2. THE Billing_Page SHALL display connected Stripe Connect account status
3. THE Billing_Page SHALL include "Add Payout Method" option
4. THE Billing_Page SHALL display recent transactions list (Ticket Sales, Merch Revenue, Payouts, Subscriptions)
5. WHEN an artist clicks "Withdraw Funds", THE System SHALL initiate a Stripe payout (stub for MVP)

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
