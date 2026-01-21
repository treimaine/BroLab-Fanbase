# Implementation Plan: BroLab Fanbase

## Overview

Ce plan d'implémentation suit les phases définies dans les contraintes projet. Chaque tâche est incrémentale et construit sur les précédentes. L'approche est mobile-first avec une UI fidèle aux screenshots SuperDesign.

**Principes clés:**
- Notifications globales: `sonner` (toast)
- Erreurs de validation form: `FormMessage` inline (shadcn Form)
- Auth/Identity: Clerk introduit tôt pour éviter dette "mock user"
- Backend: Convex actions pour logique métier, Next.js route handlers pour webhooks/signatures

## Tasks

- [ ] 1. Phase 0 — Bootstrap Projet (Next.js + Tailwind + shadcn)
    - [x] 1.1 Créer le projet Next.js 14.x avec npm
    - Commande: `npx create-next-app@14 . --typescript --eslint --tailwind --app --src-dir --import-alias "@/*"`
    - Options: TypeScript, ESLint, Tailwind, App Router, src/ directory
    - _Requirements: Setup technique_

    - [x] 1.2 Installer les dépendances de base
    - shadcn/ui, next-themes, lucide-react, framer-motion
    - Commande: `npm install next-themes lucide-react framer-motion`
    - _Requirements: Setup technique_

    - [x] 1.3 Initialiser shadcn/ui
    - Commande: `npx shadcn@latest init`
    - Configurer tailwind + globals.css + components.json
    - _Requirements: Setup technique_

    - [x] 1.4 Ajouter les composants shadcn requis
    - button, card, input, tabs, sheet, avatar, switch, separator, dropdown-menu, badge, skeleton, sonner, form, label, dialog
    - Commande: `npx shadcn@latest add button card input tabs sheet avatar switch separator dropdown-menu badge skeleton sonner form label dialog`
    - _Requirements: Setup technique_

    - [x] 1.5 Configurer les polices (Playfair Display + Inter)
    - Utiliser next/font/google
    - Appliquer via CSS variables dans globals.css
    - _Requirements: 13.4 (Theme tokens)_

    - [x] 1.6 Créer la structure de dossiers
    - src/app/(marketing), (auth), (fan), (artist), (public), api/
    - src/components/layout, marketing, hub, dashboard, feed, forms, ui
    - src/lib/utils, constants, validations
    - src/types/
    - convex/
    - _Requirements: Architecture design_

- [x] 2. Phase 1 — Theme shadcn fidèle SuperDesign
    - [x] 2.1 Configurer le theme light dans globals.css
    - Background très clair, foreground noir doux, accent lavande
    - Bordures subtiles, radius généreux (rounded-2xl)
    - _Requirements: 13.1, 13.4_

    - [x] 2.2 Configurer le theme dark dans globals.css
    - Matching dark mode avec mêmes tokens
    - _Requirements: 13.1_

    - [x] 2.3 Créer le composant ThemeProvider
    - Utiliser next-themes
    - Wrapper dans root layout
    - _Requirements: 13.2, 13.3_

    - [x] 2.4 Créer le composant ThemeToggle
    - Switch ou Dropdown pour toggle light/dark
    - Persister la préférence
    - _Requirements: 13.2, 13.3_

- [ ] 3. Phase 2 — Navigation App-Like (mobile + desktop)
    - [x] 3.1 Créer le composant Sidebar (desktop)
    - NavLinks basés sur role (fan/artist)
    - User section (avatar + role) + Sign out button
    - _Requirements: 12.4_

    - [x] 3.2 Créer le composant TopBar (mobile)
    - Brand "BroLab Fanbase" + burger icon
    - Actions slot pour ThemeToggle
    - _Requirements: 12.1_

    - [x] 3.3 Créer le composant MobileDrawer (Sheet)
    - Nav items + user card + logout
    - Utiliser shadcn Sheet
    - _Requirements: 12.3_

    - [x] 3.4 Créer le composant BottomNav (mobile)
    - Icons + short labels (4-5 items max)
    - Items différents selon role (fan vs artist)
    - _Requirements: 12.2, 12.5_

    - [x] 3.5 Créer le composant AppShell
    - Desktop: Sidebar + main content
    - Mobile: TopBar + main content + BottomNav
    - Responsive breakpoint lg
    - _Requirements: 12.1, 12.2, 12.4_

- [x] 3.6 Phase 2.5 — Media Player Foundations (Audio/Video) [MVP CORE]
    - [x] 3.6.1 Create global player store (client-side)
    - State: currentTrack, status, currentTime, duration, volume, queue
    - Actions: loadAndPlay, togglePlayPause, seek, next/prev
    - _Requirements: 19.1_

    - [x] 3.6.2 Add GlobalPlayerProvider (client) wired in root layout
    - Ensure it persists across route changes
    - Must not break existing ThemeProvider/ClerkProvider/Toaster
    - _Requirements: 19.1_

    - [x] 3.6.3 Convex function for playable URLs
    - `files.getPlayableUrl({ storageId })`
    - Return ephemeral URL usable by <audio>/<video>
    - _Requirements: 19.2_

    - [x] 3.6.4 Implement FeaturedTrackCard (KEEP THIS NAME)
    - Must be functional (controls global player)
    - UI: SuperDesign gradient card + progress + play/pause
    - _Requirements: 19.3_

    - [x] 3.6.5 Implement MediaCard hover overlay play/pause
    - Reusable overlay component for:
      - Public Hub drops list
      - Feed cards media
      - Products cards
    - Behavior: play/pause current track
    - _Requirements: 19.3_

    - [x] 3.6.6 Implement VideoModal (MVP)
    - Open on video items, <video controls>
    - Rule: pause global audio on open
    - _Requirements: 19.4_

    - [x] 3.6.7 Wire player into Fan Feed + Public Hub (mock data OK)
    - FeedCard "Listen" triggers loadAndPlay(track)
    - Hover overlay triggers loadAndPlay(track)
    - _Requirements: 19.1, 19.3_

- [ ] 4. Phase 2B — Identity & Auth Foundation (Clerk)
    - [x] 4.1 Installer Clerk Next.js
    - `npm install @clerk/nextjs`
    - Configurer env variables: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
    - _Requirements: 2.1-2.8_

    - [x] 4.2 Configurer ClerkProvider + Middleware
    - Créer `src/middleware.ts` avec `clerkMiddleware()` de `@clerk/nextjs/server`
    - **IMPORTANT**: NE PAS utiliser `authMiddleware()` (déprécié)
    - Wrapper root layout avec `<ClerkProvider>`
    - _Requirements: 2.1_

    - [x] 4.3 Créer les pages sign-in et sign-up
    - src/app/(auth)/sign-in/[[...sign-in]]/page.tsx avec `<SignIn />`
    - src/app/(auth)/sign-up/[[...sign-up]]/page.tsx avec `<SignUp />`
    - Utiliser composants Clerk: `<SignIn />`, `<SignUp />` de `@clerk/nextjs`
    - Styling cohérent avec theme
    - _Requirements: 2.1, 2.2_

    - [x] 4.4 Créer la page onboarding (role selection)
    - src/app/(auth)/onboarding/page.tsx
    - Choix "Artist" ou "Fan" avec cards visuelles
    - Stocker dans Clerk publicMetadata.role via Clerk Backend API
    - _Requirements: 2.3, 2.4_

    - [x] 4.5 Configurer la protection des routes dans middleware
    - Utiliser `clerkMiddleware()` avec `createRouteMatcher()` pour routes protégées
    - /dashboard/* => role artist requis
    - /me/* => authenticated + role fan requis
    - Redirect /me → /me/[username] basé sur Clerk user
    - Utiliser `auth()` de `@clerk/nextjs/server` pour vérifier session/role
    - _Requirements: 2.5, 2.6, 2.7, 2.8_

    - [x] 4.6 Créer les utilitaires routing
    - src/lib/constants.ts: RESERVED_SLUGS + isReservedSlug()
    - src/lib/utils.ts: slugify() function
    - _Requirements: 15.7, 9.1_

    - [ ]* 4.7 Write property test for reserved slug rejection
    - **Property 9: Reserved Slug Rejection**
    - **Validates: Requirements 15.7**

- [ ] 5. Phase 3A — Landing Page
    - [x] 5.1 Créer le layout marketing
    - Navbar minimal: brand + "Sign In" + "Join Beta" button
    - _Requirements: 1.6_

    - [x] 5.2 Créer le composant HeroSection
    - Titre serif "Your career isn't an algorithm." avec mot gradient lavande
    - Input email pill + CTA pill "Join Beta →"
    - Ligne "Watch 30s demo" + "No credit card required"
    - Animation framer-motion (fade/slide)
    - Form validation inline (FormMessage) + success toast (sonner)
    - _Requirements: 1.1, 1.2_

    - [x] 5.3 Créer le composant FeatureGrid
    - 3 colonnes: Direct to Fan / Global Commerce / Own Your Data
    - Icons + titres + descriptions
    - _Requirements: 1.5_

    - [x] 5.4 Créer le composant Footer
    - Terms / Privacy / Contact links
    - Copyright
    - _Requirements: 1.7_

    - [x] 5.5 Assembler la Landing Page
    - src/app/(marketing)/page.tsx
    - Intégrer HeroSection + FeatureGrid + Footer
    - _Requirements: 1.1-1.7_

- [ ] 6. Phase 3B — Convex Setup + Data Wiring Minimal
    - [x] 6.1 Installer Convex
    - `npm install convex`
    - `npx convex dev` pour initialiser
    - _Requirements: 15.1_

    - [x] 6.2 Créer le schema Convex
    - convex/schema.ts avec toutes les tables
    - users, waitlist, artists, links, events, products, follows, orders, orderItems, processedEvents, downloads
    - _Requirements: 15.1, 15.6_

    - [x] 6.3 Configurer ConvexProvider + ClerkProvider integration
    - Root layout wrapper avec ConvexProviderWithClerk
    - _Requirements: 15.1_

    - [x] 6.4 Créer les fonctions waitlist
    - convex/waitlist.ts: submit(email) mutation
    - Validation email côté Convex
    - _Requirements: 1.3_

    - [x] 6.5 Connecter Landing Page → Convex waitlist
    - HeroSection form → useMutation(api.waitlist.submit)
    - Toast success/error avec sonner
    - _Requirements: 1.3, 1.4_

    - [x] 6.6 Créer les fonctions users
    - convex/users.ts: upsertFromClerk, getByClerkId
    - Sync Clerk → Convex on sign-in
    - _Requirements: 15.2_

- [x] 7. Checkpoint 1 — Vérifier Landing + Auth + Convex (manuel via Playwright MCP)
    - Ensure Landing page renders correctly
    - Verify light/dark toggle works
    - Test sign-up → onboarding → role selection flow
    - Verify waitlist submission stores in Convex
    - _Note: Vérification manuelle via mcp_playwright_browser_navigate + mcp_playwright_browser_snapshot + mcp_playwright_browser_click + mcp_playwright_browser_type_
    - Ask user if questions arise

- [ ] 8. Phase 3C — Public Artist Hub
    - [x] 8.1 Créer les fonctions artists (Convex)
    - convex/artists.ts: getBySlug, create, update
    - Validation slug unique + reserved slugs
    - _Requirements: 3.1, 5.4, 5.5, 15.7_

    - [x] 8.2 Créer les fonctions follows (Convex)
    - convex/follows.ts: toggle, isFollowing, getFollowedArtists
    - _Requirements: 3.5_

    - [x] 8.3 Seed data pour Public Hub
    - Script ou mutation pour créer un artiste de test
    - _Requirements: Dev setup_

    - [x] 8.4 Créer le composant HubHeader
    - Cover image + gradient overlay + avatar centré
    - Nom artiste (serif) + bio
    - Bouton Follow (toggle) connecté à Convex
    - Social icons pills
    - _Requirements: 3.2, 3.3, 3.4_

    - [x] 8.5 Créer le composant DropsList
    - Cards cliquables avec image, titre, type badge, prix
    - _Requirements: 3.4_

    - [x] 8.6 Créer le composant EventsList
    - Event cards avec date, venue, city, status badge, bouton Tickets
    - _Requirements: 3.4_

    - [x] 8.7 Assembler la page Public Hub
    - src/app/(public)/[artistSlug]/page.tsx
    - Tabs "Latest Drops" / "Tour Dates" (shadcn Tabs)
    - Connecté à Convex artists.getBySlug
    - 404 si slug invalide
    - _Requirements: 3.1-3.7_

- [x] 8.8 Checkpoint Phase 3C — Vérifier Public Artist Hub (manuel via Playwright MCP)
    - ✅ Public Hub /djnova accessible sans authentification
    - ✅ HubHeader: cover, avatar, nom, bio, bouton Follow, social icons
    - ✅ DropsList: 3 produits avec images, badges, prix
    - ✅ EventsList: 3 événements avec dates, venues, statuts
    - ✅ Tabs navigation fonctionnelle
    - ✅ 404 state pour slugs invalides
    - _Note: Vérification manuelle via mcp_playwright_browser_navigate + mcp_playwright_browser_snapshot_

- [x] 8.9 Dashboard — Custom Links (Refactored from Linktree)
    - [x] 8.9.1 Remove ArtistLinksList from Public Hub page
    - Remove import and rendering of ArtistLinksList from `src/app/(public)/[artistSlug]/page.tsx`
    - Component can be deleted or kept unused for future reference
    - _Requirements: R-CL-1 (Custom Links only in dashboard)_

    - [x] 8.9.2 Update /dashboard/links UI copy → "Custom Links"
    - Change page title from "Links" to "Custom Links"
    - Add helper text: "Use this for merch, booking, press kit, newsletter, etc. Social platforms are managed in Profile & Bio → Social Links."
    - _Requirements: R-CL-1_

    - [x] 8.9.3 Add URL domain validation (UI - client-side)
    - Create `BLOCKED_SOCIAL_DOMAINS` constant in `src/lib/constants.ts`
    - Add `isSocialPlatformUrl()` validation function
    - Update AddLinkDialog form schema to reject blocked domains
    - Display error: "Manage social links in Profile & Bio → Social Links."
    - _Requirements: R-CL-2, R-CL-3_

    - [x] 8.9.4 Add URL domain validation (Convex backend guard)
    - Update `convex/links.ts` create mutation to validate URL domain
    - Update `convex/links.ts` update mutation to validate URL domain
    - Reject with clear error message if domain is blocked
    - _Requirements: R-CL-2, R-CL-3_

    - [x] 8.9.5 QA checkpoint (manuel via Playwright MCP)
    - Social links managed ONLY via Profile & Bio → Social Links
    - Custom links page rejects social/streaming platform URLs
    - Public Hub no longer displays Linktree-style links list
    - Public Hub still shows: HubHeader (with social icons) → Tabs (Latest Drops / Tour Dates)
    - _Note: Vérification manuelle via mcp_playwright_browser_navigate + mcp_playwright_browser_snapshot + mcp_playwright_browser_click_
    - _Requirements: R-CL-1..5_

- [x] 9. Phase 3D — Artist Dashboard
    - [x] 9.1 Créer le layout artist avec AppShell
    - src/app/(artist)/layout.tsx
    - AppShell avec role="artist"
    - Protected by middleware (artist role required)
    - _Requirements: 4.5_

    - [x] 9.2 Créer le composant StatsCard
    - Title, value, change indicator, icon
    - _Requirements: 4.1_

    - [x] 9.3 Créer le composant SetupChecklist
    - Liste de steps avec checkmarks
    - Links vers les sections correspondantes
    - _Requirements: 4.2_

    - [x] 9.4 Créer le composant CreateContentCard
    - "Add Link" + "Add Event" actions
    - _Requirements: 4.3_

    - [x] 9.5 Assembler la page Dashboard Overview
    - src/app/(artist)/dashboard/page.tsx
    - 3 StatsCards + SetupChecklist + CreateContentCard
    - "View Public Hub" link
    - _Requirements: 4.1-4.4_

- [x] 9.6 Checkpoint Phase 3D — Vérifier Artist Dashboard (manuel via Playwright MCP)
    - ✅ Landing page renders correctly
    - ✅ Light/dark toggle works
    - ✅ Public Hub /djnova displays artist profile, products, events
    - ✅ Public Hub /treigua (logged-in artist) displays correctly
    - ✅ Tabs "Latest Drops" / "Tour Dates" functional
    - ✅ Follow button works with toast notification
    - ✅ Sign-in page renders with Clerk components
    - ✅ Sign-in flow works (email + password + 2FA code)
    - ✅ Middleware protects /dashboard (redirects to sign-in)
    - ✅ Dashboard Overview: Welcome message, View Public Hub link
    - ✅ 3 StatsCards: Followers, Revenue, Upcoming Events
    - ✅ SetupChecklist: 4/5 complete with progress bar
    - ✅ CreateContentCard: Add Link, Add Event, Add Product buttons
    - ✅ Sidebar navigation: Overview, Profile, Links, Events, Products, Billing
    - ✅ User section: Avatar, name, role, Sign out button
    - Note: Profile/Links/Events/Products/Billing pages return 404 (Phase 3E-3I not implemented yet)
    - _Note: Vérification manuelle via mcp_playwright_browser_navigate + mcp_playwright_browser_snapshot_

- [ ] 10. Phase 3E — Artist Profile Page
    - [x] 10.1 Créer le composant ProfileForm
    - Image URL input + Display Name + Unique Slug + Bio
    - Prefix "fan.brolab/" avant le slug
    - Validation inline avec FormMessage
    - _Requirements: 5.2, 5.6_

    - [x] 10.2 Créer le composant SocialLinksList
    - Liste des plateformes avec Switch toggle (on/off)
    - _Requirements: 5.3_

    - [x] 10.3 Assembler la page Profile
    - src/app/(artist)/dashboard/profile/page.tsx
    - ProfileForm + SocialLinksList + Save button
    - Connecté à Convex artists.update
    - Toast success avec sonner
    - _Requirements: 5.1-5.6_

- [x] 10.4 Checkpoint Phase 3E — Vérifier Artist Profile Page (manuel via Playwright MCP)
    - Verify profile form renders with all fields
    - Test slug validation (format, reserved, uniqueness)
    - Test social links toggle on/off
    - Verify save mutation works
    - Test toast notifications
    - _Note: Vérification manuelle via mcp_playwright_browser_navigate + mcp_playwright_browser_snapshot + mcp_playwright_browser_click/type_

- [ ] 11. Phase 3F — Artist Links Page
    - [x] 11.1 Créer le composant LinkItem
    - Title, URL preview, type badge, active toggle
    - _Requirements: 6.5_

    - [x] 11.2 Créer le composant AddLinkDialog
    - Form: title, URL, type selector
    - Validation inline avec FormMessage
    - _Requirements: 6.3_

    - [x] 11.3 Créer les fonctions links (Convex)
    - convex/links.ts: create, update, delete, getByArtist, reorder
    - _Requirements: 6.1-6.5_

    - [x] 11.4 Assembler la page Links
    - src/app/(artist)/dashboard/links/page.tsx
    - Liste de LinkItems + "Add New Link" button
    - Connecté à Convex
    - _Requirements: 6.1-6.5_

- [x] 11.5 Checkpoint Phase 3F — Vérifier Artist Links Page (manuel via Playwright MCP)
    - Verify links list renders
    - Test add link dialog and form validation
    - Test link toggle active/inactive
    - Verify CRUD operations work
    - _Note: Vérification manuelle via mcp_playwright_browser_navigate + mcp_playwright_browser_snapshot + mcp_playwright_browser_click/type_

- [ ] 12. Phase 3G — Artist Events Page
    - [x] 12.1 Créer le composant EventStatsRow
    - Total Tickets Sold, Gross Revenue, Upcoming Shows
    - _Requirements: 7.1_

    - [x] 12.2 Créer le composant EventItem
    - Image, title, date, venue, tickets sold, revenue, status badge, "Manage" button
    - _Requirements: 7.2_

    - [x] 12.3 Créer le composant CreateEventDialog
    - Form: title, date, city, venue, ticket URL, image URL
    - Validation inline avec FormMessage
    - _Requirements: 7.4_

    - [x] 12.4 Créer les fonctions events (Convex)
    - convex/events.ts: create, update, delete, getByArtist
    - _Requirements: 7.1-7.5_

    - [x] 12.5 Assembler la page Events
    - src/app/(artist)/dashboard/events/page.tsx
    - EventStatsRow + liste EventItems + "Create Event" button
    - Connecté à Convex
    - _Requirements: 7.1-7.5_

- [x] 12.6 Checkpoint Phase 3G — Vérifier Artist Events Page (manuel via Playwright MCP)
    - Verify events stats row renders
    - Verify events list renders with all data
    - Test create event dialog and form validation
    - Verify CRUD operations work
    - _Note: Vérification manuelle via mcp_playwright_browser_navigate + mcp_playwright_browser_snapshot + mcp_playwright_browser_click/type_

- [ ] 13. Phase 3H — Artist Products Page (Upload Flow)
    - [x] 13.1 Créer les fonctions files (Convex)
    - convex/files.ts: generateUploadUrl action
    - _Requirements: 16.4, 16.5_

    - [x] 13.2 Créer les fonctions products (Convex)
    - convex/products.ts: create, update, delete, getByArtist
    - Store metadata: title, description, type, priceUSD, visibility, fileStorageId, contentType, fileSize
    - _Requirements: 16.1, 16.2, 16.3_

    - [x] 13.3 Créer la validation fichiers (client-side)
    - src/lib/validations.ts: validateFileUpload()
    - Types autorisés: mp3, wav (audio), mp4 (video)
    - Tailles max: audio <= 50MB, video <= 200MB
    - Retourner erreur claire si invalide
    - _Requirements: 16.4, Upload Limits (MVP)_

    - [x] 13.4 Créer le composant ProductItem
    - Cover image, title, type badge, price, visibility toggle
    - _Requirements: 16.1_

    - [x] 13.5 Créer le composant AddProductDialog
    - Form: title, description, type (music/video), price, visibility, cover URL
    - File upload input avec validation client-side
    - Progress indicator pendant upload
    - Validation inline avec FormMessage
    - _Requirements: 16.2, 16.3_

    - [x] 13.6 Créer le hook useFileUpload
    - Request upload URL from Convex
    - Upload file to URL
    - Return storageId on success
    - Handle errors with toast
    - _Requirements: 16.4, 16.5_

    - [x] 13.7 Assembler la page Products
    - src/app/(artist)/dashboard/products/page.tsx
    - Liste ProductItems + "Add Product" button
    - Full upload flow: validate → upload → store metadata
    - _Requirements: 16.1-16.7_

- [x] 13.8 Checkpoint Phase 3H — Vérifier Artist Products Page (manuel via Playwright MCP)
    - Verify products list renders
    - Test add product dialog and form validation
    - Test file upload with progress indicator
    - Verify file type/size validation
    - Test visibility toggle
    - _Note: Vérification manuelle via mcp_playwright_browser_navigate + mcp_playwright_browser_snapshot + mcp_playwright_browser_click/type/file_upload_

- [ ] 14. Phase 3I — Artist Billing (Stripe Connect + Automatic Payouts)
  
  **Business Context:**
    - Fans pay artists directly (no platform commission)
    - Platform revenue = artist subscriptions (Clerk Billing)
    - Payouts are automatic (Stripe managed schedule)
    - NO manual "Withdraw Funds" button

    - [ ] 14.1 Schema & Data Model Updates
    - [x] 14.1.1 Update Convex schema (convex/schema.ts)
      - Add fields to `artists` table:
        - `stripeConnectAccountId: v.optional(v.string())`
        - `connectStatus: v.union(v.literal("not_connected"), v.literal("pending"), v.literal("connected"))`
        - `chargesEnabled: v.optional(v.boolean())`
        - `payoutsEnabled: v.optional(v.boolean())`
        - `requirementsDue: v.optional(v.array(v.string()))`
        - `connectUpdatedAt: v.optional(v.number())`
      - _Requirements: R-ART-CONNECT-2_

    - [x] 14.1.2 Create `artistBalanceSnapshots` table (optional - Palier B)
      - Fields: artistId, stripeConnectAccountId, availableUSD, pendingUSD, currency, snapshotAt
      - Index: by_artist
      - _Requirements: R-ART-BAL-2_

    - [x] 14.1.3 Create `artistPayouts` table (optional - Palier B)
      - Fields: artistId, stripePayoutId, amount, currency, status, arrivalDate, createdAt
      - Indexes: by_artist, by_stripe_payout
      - _Requirements: R-ART-BAL-3_

    - [ ] 14.2 Stripe Connect Onboarding (Convex Actions)
    - [x] 14.2.1 Create convex/stripeConnect.ts
      - Action `createAccount`: Create Stripe Connect Express account
      - Action `createAccountLink`: Generate onboarding/refresh URL
      - Action `createLoginLink`: Generate Express dashboard URL for "Manage Payouts"
      - Store `stripeConnectAccountId` in artists table
      - _Requirements: R-ART-CONNECT-1_

    - [x] 14.2.2 Create internal mutations for webhook sync
      - `updateAccountStatus`: Update connect status from account.updated webhook
      - `upsertBalanceSnapshot`: Update balance from balance.available webhook (optional Palier B)
      - `upsertPayoutHistory`: Update payout history from payout.* webhooks (optional Palier B)
      - _Requirements: R-ART-CONNECT-3_

    - [ ] 14.3 Webhooks Extension (Stripe Connect Events)
    - [x] 14.3.1 Extend src/app/api/stripe/webhook/route.ts
      - Handle `account.updated` event:
        - Extract connectStatus, chargesEnabled, payoutsEnabled, requirementsDue
        - Call `stripeConnect.updateAccountStatus` internal mutation
        - Idempotency via processedEvents table
      - _Requirements: R-ART-CONNECT-3_

    - [x] 14.3.2 Add balance webhooks (optional - Palier B)
      - Handle `balance.available` event
      - Call `stripeConnect.upsertBalanceSnapshot` internal mutation
      - _Requirements: R-ART-BAL-2_

    - [x] 14.3.3 Add payout webhooks (optional - Palier B)
      - Handle `payout.paid`, `payout.failed`, `payout.canceled` events
      - Call `stripeConnect.upsertPayoutHistory` internal mutation
      - _Requirements: R-ART-BAL-3_

    - [ ] 14.4 Checkout Flow Update (Route to Artist)
    - [x] 14.4.1 Update src/app/api/stripe/checkout/route.ts
      - Query artist's `stripeConnectAccountId` and `connectStatus`
      - Validate artist is connected (connectStatus === "connected")
      - Add `payment_intent_data.transfer_data.destination` = artist account
      - Set `application_fee_amount = 0` (no platform commission)
      - Return error if artist not connected
      - _Requirements: R-CHECKOUT-CONNECT-1, R-CHECKOUT-CONNECT-2, R-CHECKOUT-CONNECT-4_

    - [x] 14.4.2 Verify webhook still creates orders/entitlements
      - Ensure `checkout.session.completed` continues to work
      - Orders/orderItems created in Convex
      - Download entitlements granted
      - _Requirements: R-CHECKOUT-CONNECT-3_

    - [ ] 14.5 Artist Billing Queries (Deterministic Read Model)
    - [x] 14.5.1 Create convex/artistBilling.ts
      - Query `getSummary`: Return connectStatus, balances, last payout, requirements
      - Query `getTransactions`: Return real sales from orders/orderItems/products
        - Filter by artistId via relation: orderItems.productId → products.artistId
        - Pagination support (limit, cursor)
        - Map order statuses to UI-friendly labels
      - _Requirements: R-ART-BAL-1, R-ART-TXN-1, R-ART-TXN-2, R-ART-TXN-3_

    - [ ] 14.6 UI Components Update (Remove Placeholders)
    - [x] 14.6.1 Update BalanceCard component
      - Accept real props: availableBalance, pendingBalance, lastPayout
      - Remove hardcoded placeholder data
      - Show loading state while fetching
      - _Requirements: R-ART-BAL-1, R-PROD-0.1_

    - [x] 14.6.2 Update PayoutMethodCard component
      - Accept props: connectStatus, chargesEnabled, payoutsEnabled, expressLoginUrl
      - States:
        - not_connected: Show "Connect Stripe" CTA
        - pending: Show requirements list + "Continue Setup" CTA
        - connected: Show status + "Manage Payouts on Stripe" link
      - Remove "Coming soon" badge
      - Remove "Add Payout Method" button
      - _Requirements: R-ART-CONNECT-4, R-ART-PAYOUT-3, R-PROD-0.2_

    - [x] 14.6.3 Update TransactionsList component
      - Remove PLACEHOLDER_TRANSACTIONS constant
      - Accept real transactions from Convex query
      - Show empty state if no transactions: "No sales yet. Share your products with fans!"
      - Display real transaction data: product title, amount, date, status
      - _Requirements: R-ART-TXN-1, R-ART-TXN-4, R-PROD-0.1_

    - [ ] 14.7 Page Assembly (src/app/(artist)/dashboard/billing/page.tsx)
    - [x] 14.7.1 Wire up Convex queries
      - Use `useQuery(api.artistBilling.getSummary)`
      - Use `useQuery(api.artistBilling.getTransactions)`
      - Handle loading states
      - _Requirements: R-ART-BAL-1, R-ART-TXN-1_

    - [x] 14.7.2 Implement UI state branching
      - If connectStatus === "not_connected": Show Connect CTA
      - If connectStatus === "pending": Show requirements + Continue Setup CTA
      - If connectStatus === "connected": Show full billing dashboard
      - _Requirements: R-PROD-0.2, R-PROD-0.3_

    - [x] 14.7.3 Remove "Withdraw Funds" button
      - Delete button from UI
      - Update page title to "Earnings & Payouts"
      - _Requirements: R-ART-PAYOUT-2, R-ART-PAYOUT-3_

    - [ ] 14.8 Connect Onboarding Flow (UI)
    - [x] 14.8.1 Create "Connect Stripe" button handler
      - Call `stripeConnect.createAccount` action
      - Call `stripeConnect.createAccountLink` action
      - Redirect to Stripe onboarding URL
      - _Requirements: R-ART-CONNECT-1_

    - [x] 14.8.2 Create return/refresh handlers
      - Handle return from Stripe onboarding
      - Refresh account link if expired
      - Show success/error toasts
      - _Requirements: R-ART-CONNECT-4_

    - [x] 14.8.3 Create "Manage Payouts on Stripe" link
      - Call `stripeConnect.createLoginLink` action
      - Open Express dashboard in new tab
      - _Requirements: R-ART-PAYOUT-3_

- [ ] 14.9 Checkpoint Phase 3I — Vérifier Artist Billing (Stripe Connect) (manuel via Playwright MCP)
    - [x] 14.9.1 Test not_connected state
    - Navigate to `/dashboard/billing` as artist without Stripe Connect
    - Take snapshot and verify "Connect Stripe" CTA is visible
    - Verify no mock/placeholder data visible (no hardcoded balances/transactions)
    - Verify helper text explains direct payments + automatic payouts
    - _Requirements: R-PROD-0.2_

    - [x] 14.9.2 Test Stripe Connect onboarding flow
    - Click "Connect Stripe" button
    - Verify redirect to Stripe onboarding URL (check URL contains "connect.stripe.com")
    - Complete onboarding in test mode (use test business details)
    - Return to app and verify status updates to "connected" (refresh page if needed)
    - Take snapshot of connected state
    - _Requirements: R-ART-CONNECT-1, R-ART-CONNECT-3_

    - [ ] 14.9.3 Test pending state (if requirements due)
    - If Stripe account has pending requirements, verify requirements list displays
    - Verify "Continue Setup" CTA is visible and clickable
    - Click CTA and verify redirect to Stripe onboarding
    - _Requirements: R-ART-CONNECT-4_

    - [ ] 14.9.4 Test connected state
    - Navigate to `/dashboard/billing` as connected artist
    - Take snapshot and verify BalanceCard shows real data (or transaction totals if Palier A)
    - Verify PayoutMethodCard shows "Connected" status with green indicator
    - Click "Manage Payouts on Stripe" link and verify it opens Stripe Express dashboard in new tab
    - Verify TransactionsList shows real sales (or empty state with message "No sales yet")
    - Verify NO "Withdraw Funds" button exists anywhere on page
    - _Requirements: R-ART-BAL-1, R-ART-TXN-1, R-ART-PAYOUT-3, R-PROD-0.1_

    - [ ] 14.9.5 Test fan checkout → artist routing
    - Sign in as fan account
    - Navigate to connected artist's public hub (e.g., `/djnova`)
    - Click "Buy Now" on a product
    - Complete Stripe checkout with test card (4242 4242 4242 4242)
    - Verify order created in Convex (check network requests for `orders.create`)
    - Verify download button appears in fan's purchases page (`/me/[username]/purchases`)
    - Sign in as artist and navigate to `/dashboard/billing`
    - Verify transaction appears in TransactionsList with correct product title, amount, date
    - _Requirements: R-CHECKOUT-CONNECT-1, R-CHECKOUT-CONNECT-3, R-ART-TXN-2_

    - [ ] 14.9.6 Test error handling
    - Sign in as fan account
    - Navigate to non-connected artist's public hub
    - Click "Buy Now" on a product
    - Verify error message displays: "Artist hasn't set up payments yet"
    - Verify checkout does not proceed
    - Take snapshot of error state
    - _Requirements: R-CHECKOUT-CONNECT-4_

    - _Note: Vérification manuelle via mcp_playwright_browser_navigate + mcp_playwright_browser_snapshot + mcp_playwright_browser_click + mcp_playwright_browser_network_requests_

- [x] 15. Checkpoint 2 — Vérifier Artist Dashboard complet (manuel via Playwright MCP)
    - Ensure all artist pages render correctly
    - Verify navigation between pages
    - Test responsive layout
    - Verify Convex mutations work (profile, links, events, products)
    - Test file upload flow
    - _Note: Vérification manuelle via mcp_playwright_browser_navigate + mcp_playwright_browser_snapshot + mcp_playwright_browser_click + mcp_playwright_browser_type + mcp_playwright_browser_file_upload_
    - Ask user if questions arise

- [ ] 16. Phase 3J — Fan Dashboard
    - [x] 16.1 Créer le layout fan avec AppShell
    - src/app/(fan)/layout.tsx
    - AppShell avec role="fan"
    - Protected by middleware (fan role required)
    - _Requirements: 9.1_

    - [x] 16.2 Créer la page /me redirect
    - src/app/(fan)/me/page.tsx
    - Redirect vers /me/[username] basé sur Clerk user (pas mock!)
    - _Requirements: 9.1_

    - [ ]* 16.3 Write property test for /me redirect
    - **Property 10: Fan Dashboard URL Contains Username**
    - **Validates: Requirements 9.1**

    - [x] 16.4 Créer le composant FeedCard
    - Artist avatar, name, timestamp, content, image
    - Action buttons (like, comment, share)
    - CTA buttons (Listen, Get Tickets, Shop Now)
    - _Requirements: 9.3, 9.4_

    - [x] 16.5 Créer le composant CommunityWidget
    - Following count, Events count
    - _Requirements: 9.5_

    - [x] 16.6 Créer le composant SuggestedArtistsWidget
    - Liste d'artistes suggérés
    - _Requirements: 9.5_

    - [x] 16.7 Créer le composant FeaturedTrackCard
    - Mini player card avec cover, titre, artiste
    - _Requirements: 9.5_

    - [x] 16.8 Assembler la page Feed
    - src/app/(fan)/me/[username]/page.tsx
    - Desktop: Feed + sidebar widgets
    - Mobile: single column feed
    - Connecté à Convex (followed artists feed)
    - _Requirements: 9.1-9.6_

    - [ ] 16.9 Refactoring & Real Stats (Fan Feed, Links, Dashboard)

    **Context:** Audit validé - 3 chantiers prioritaires pour production readiness

    - [ ] 16.9.1 Fan Feed — Refactor useMemo Antipattern (PRIORITÉ HAUTE)
      
      - [x] 16.9.1.1 Lire convex/feed.ts et confirmer comportement page-only
        - Vérifier que `getForCurrentUser` retourne uniquement la page courante (limit items)
        - Confirmer que `nextCursor` est le timestamp du dernier item
        - Documenter dans un commentaire inline
        - _Requirements: R-FAN-FEED-1_

      - [x] 16.9.1.2 Refactor src/app/(fan)/me/[username]/page.tsx
        - Remplacer `useMemo` (avec setState) par `useEffect`
        - Garder la logique d'accumulation (`allFeedItems` state)
        - Garder la déduplication par `_id`
        - Garder le flag `hasLoadedInitial` pour différencier first load vs pagination
        - Code pattern:
          ```typescript
          useEffect(() => {
            if (!feedResult?.items) return;
            
            if (!hasLoadedInitial) {
              setAllFeedItems(feedResult.items);
              setHasLoadedInitial(true);
            } else if (cursor !== undefined) {
              setAllFeedItems((prev) => {
                const existingIds = new Set(prev.map((item) => item._id));
                const newItems = feedResult.items.filter((item) => !existingIds.has(item._id));
                return [...prev, ...newItems];
              });
            }
          }, [feedResult?.items, cursor, hasLoadedInitial]);
          ```
        - _Requirements: R-FAN-FEED-2_

      - [x] 16.9.1.3 Ajouter guards UI pour "Load more" button
        - Disable button pendant `isLoadingMore` (cursor !== undefined && feedResult === undefined)
        - Cacher button si `!hasMore` (nextCursor === null)
        - Afficher "Loading..." label pendant fetch
        - _Requirements: R-FAN-FEED-4, R-FAN-FEED-5_

      - [x] 16.9.1.4 QA Checklist (manuel via Playwright MCP)
        - ✅ Load initial → 10 items affichés
        - ✅ Click "Load more" → 10 nouveaux items (total 20), pas de doublons
        - ✅ Refresh page → reset à 10 items (première page)
        - ✅ Rapid clicks "Load more" → button disabled, pas de doublons
        - ✅ Navigation back/forward → état stable (pas de glitches)
        - ✅ End of feed → "You've reached the end" message, button caché
        - _Requirements: R-FAN-FEED-1..5_

    - [ ] 16.9.2 Artist Links — Nettoyer Types Sociaux (PRIORITÉ MOYENNE)
      
      - [x] 16.9.2.1 Mettre à jour LINK_TYPES dans src/components/dashboard/link-item.tsx
        - Retirer les types sociaux: `instagram`, `youtube`, `spotify`, `apple-music`
        - Garder les types business: `latest-release`, `merch`, `tickets`, `website`, `other`
        - Ajouter nouveaux types business:
          - `booking` - Booking (icon: Calendar)
          - `presskit` - Press Kit (icon: FileText)
          - `newsletter` - Newsletter (icon: Mail)
          - `donate` - Donate (icon: Heart)
        - _Requirements: R-ART-LINKS-4_

      - [x] 16.9.2.2 Mettre à jour copy UI dans src/components/forms/add-link-dialog.tsx
        - DialogTitle: "Add Business Link"
        - DialogDescription: "Add a business link to your hub. For social media, use Profile & Bio → Social Links."
        - FormDescription (Type field): "Choose the category for this business link"
        - _Requirements: R-ART-LINKS-1_

      - [x] 16.9.2.3 Mettre à jour page title dans src/app/(artist)/dashboard/links/page.tsx
        - Title: "Business Links" ou "Custom Links"
        - Helper text: "Add links for merch, booking, press kit, newsletter, etc. For social media, use Profile & Bio → Social Links."
        - _Requirements: R-ART-LINKS-1_

      - [ ] 16.9.2.4 QA Checklist (manuel via Playwright MCP)
        - ✅ Dropdown "Type" ne contient QUE des types business (pas Instagram/YouTube/etc.)
        - ✅ Ajouter lien avec type "Merch" + URL valide → succès
        - ✅ Essayer d'ajouter URL instagram.com → erreur "Manage social links in Profile & Bio"
        - ✅ Social links restent gérés dans Profile & Bio → Social Links (pas de régression)
        - ✅ Types sociaux absents du dropdown (vérifier visuellement)
        - _Requirements: R-ART-LINKS-1..4_

      - [ ] 16.9.2.5 (Optionnel) Migration des records existants
        - Si des links existants ont type social (instagram/youtube/etc.), les convertir en type `other`
        - Ou afficher un warning dans l'UI pour que l'artiste les migre manuellement
        - Script Convex ou mutation one-time
        - _Requirements: Data integrity_

    - [ ] 16.9.3 Dashboard Overview — Connecter Stats Réelles (PRIORITÉ MOYENNE)
      
      - [x] 16.9.3.1 Créer query convex/follows.ts: countByArtist
        - Args: `{ artistId: v.id("artists") }`
        - Logic: Query follows table avec index `by_artist`, return count
        - Code pattern:
          ```typescript
          export const countByArtist = query({
            args: { artistId: v.id("artists") },
            handler: async (ctx, args) => {
              const follows = await ctx.db
                .query("follows")
                .withIndex("by_artist", (q) => q.eq("artistId", args.artistId))
                .collect();
              return follows.length;
            },
          });
          ```
        - _Requirements: R-ART-DASH-STAT-1_

      - [x] 16.9.3.2 Créer query convex/events.ts: countUpcomingByArtist
        - Args: `{ artistId: v.id("artists") }`
        - Logic: Query events table, filter `date >= Date.now()`, return count
        - Code pattern:
          ```typescript
          export const countUpcomingByArtist = query({
            args: { artistId: v.id("artists") },
            handler: async (ctx, args) => {
              const now = Date.now();
              const events = await ctx.db
                .query("events")
                .withIndex("by_artist", (q) => q.eq("artistId", args.artistId))
                .filter((q) => q.gte(q.field("date"), now))
                .collect();
              return events.length;
            },
          });
          ```
        - _Requirements: R-ART-DASH-STAT-2_

      - [x] 16.9.3.3 Vérifier query convex/artistBilling.ts: getSummary
        - Confirmer que `getSummary` retourne `{ available, pending }` (ou total sales)
        - Si absent, créer query simple qui somme les orders paid
        - _Requirements: R-ART-DASH-STAT-3_

      - [x] 16.9.3.4 Brancher src/app/(artist)/dashboard/page.tsx sur queries
        - Ajouter `useQuery` calls:
          ```typescript
          const artist = useQuery(api.artists.getCurrentArtist);
          const followersCount = useQuery(
            api.follows.countByArtist,
            artist ? { artistId: artist._id } : "skip"
          );
          const billingSummary = useQuery(api.artistBilling.getSummary);
          const upcomingEventsCount = useQuery(
            api.events.countUpcomingByArtist,
            artist ? { artistId: artist._id } : "skip"
          );
          ```
        - Remplacer valeurs hardcodées par vraies valeurs:
          - Followers: `followersCount?.toString() ?? "0"`
          - Revenue: `formatCurrency(billingSummary?.available ?? 0)`
          - Events: `upcomingEventsCount?.toString() ?? "0"`
        - _Requirements: R-ART-DASH-STAT-1, R-ART-DASH-STAT-2, R-ART-DASH-STAT-3_

      - [x] 16.9.3.5 Ajouter skeletons et loading states
        - Afficher `<Skeleton className="h-28 rounded-xl" />` pendant fetch
        - Condition: `if (followersCount === undefined || billingSummary === undefined || upcomingEventsCount === undefined)`
        - Utiliser le composant `DashboardSkeleton` existant
        - _Requirements: R-ART-DASH-STAT-4_

      - [x] 16.9.3.6 Ajouter helper function formatCurrency
        - Créer dans `src/lib/utils.ts`:
          ```typescript
          export function formatCurrency(cents: number): string {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(cents / 100);
          }
          ```
        - Utiliser pour formater revenue
        - _Requirements: R-ART-DASH-STAT-3_

      - [ ] 16.9.3.7 QA Checklist (manuel via Playwright MCP)
        - ✅ Créer 5 follows pour l'artiste → stat "Followers" affiche "5"
        - ✅ Créer 2 events futurs → stat "Upcoming Events" affiche "2"
        - ✅ Créer 1 order paid ($50) → stat "Revenue" affiche "$50.00" (ou balance si billing implémenté)
        - ✅ Loading states affichés pendant fetch (skeletons)
        - ✅ Pas de valeurs hardcodées "0" visibles après chargement avec vraies données
        - ✅ Format currency correct ($ avec 2 décimales)
        - _Requirements: R-ART-DASH-STAT-1..4_

    - [ ] 16.10 Checkpoint Refactoring — Vérifier Feed/Links/Stats (manuel via Playwright MCP)
    - Verify Fan Feed pagination works without glitches
    - Verify Links dropdown only shows business types
    - Verify Dashboard stats show real data
    - Test all QA checklists from 16.9.1.4, 16.9.2.4, 16.9.3.7
    - _Note: Vérification manuelle via mcp_playwright_browser_navigate + mcp_playwright_browser_snapshot + mcp_playwright_browser_click_
    - Ask user if questions arise

- [ ] 17. Phase 3K — Fan Purchases Page
    - [x] 17.1 Créer le composant PurchaseItem
    - Image, type badge, title, artist, date, price
    - Download button (si downloadable)
    - Status badge (Upcoming/Shipped)
    - _Requirements: 10.2, 10.3, 10.4_

    - [x] 17.2 Assembler la page Purchases
    - src/app/(fan)/me/[username]/purchases/page.tsx
    - Liste de PurchaseItems
    - Connecté à Convex orders/orderItems
    - _Requirements: 10.1-10.5_

- [x] 17.3 Checkpoint Phase 3K — Vérifier Fan Purchases Page (manuel via Playwright MCP)
    - Verify purchases list renders
    - Test download button functionality
    - Verify status badges display correctly
    - _Note: Vérification manuelle via mcp_playwright_browser_navigate + mcp_playwright_browser_snapshot + mcp_playwright_browser_click_

- [ ] 18. Phase 3L — Fan Billing Page
    - [x] 18.1 Créer le composant PaymentMethodsTab
    - Saved cards list + "Add Payment Method" button
    - _Requirements: 11.2, 11.3_

    - [x] 18.2 Créer le composant BillingHistoryTab
    - Transactions list avec date, description, amount
    - _Requirements: 11.4_

    - [x] 18.3 Assembler la page Billing
    - src/app/(fan)/me/[username]/billing/page.tsx
    - Tabs: Payment Methods / Billing History
    - Security notice
    - _Requirements: 11.1-11.5_

- [x] 18.4 Checkpoint Phase 3L — Vérifier Fan Billing Page (manuel via Playwright MCP)
    - Verify tabs navigation works
    - Verify payment methods tab renders
    - Verify billing history tab renders
    - Verify security notice displays
    - _Note: Vérification manuelle via mcp_playwright_browser_navigate + mcp_playwright_browser_snapshot + mcp_playwright_browser_click_

- [x] 19. Checkpoint 3 — Vérifier Fan Dashboard complet (manuel via Playwright MCP)
    - Ensure all fan pages render correctly
    - Verify navigation between pages
    - Test responsive layout
    - Verify /me redirect works with real Clerk user
    - _Note: Vérification manuelle via mcp_playwright_browser_navigate + mcp_playwright_browser_snapshot + mcp_playwright_browser_click_
    - Ask user if questions arise

- [ ] 20. Phase 4 — Stripe Integration (Checkout + Webhooks)
    - [x] 20.1 Installer Stripe
    - `npm install stripe @stripe/stripe-js`
    - Configurer env variables (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)
    - _Requirements: 14.1, 18.1_

    - [x] 20.2 Créer le route handler checkout
    - src/app/api/stripe/checkout/route.ts
    - Créer Stripe Checkout session pour product purchase
    - Include metadata: fanUserId, productId
    - _Requirements: 18.1_

    - [x] 20.3 Créer la Convex action stripe.handleWebhook
    - convex/stripe.ts: handleWebhook action
    - Idempotency check: query processedEvents by eventId
    - If not processed: create order + orderItems
    - Mark event as processed
    - _Requirements: 18.2, 18.3, 18.4, 18.5_

    - [x] 20.4 Créer le route handler webhook
    - src/app/api/stripe/webhook/route.ts
    - Verify Stripe signature (stripe.webhooks.constructEvent)
    - Forward to Convex action stripe.handleWebhook
    - Return 200 on success, 400 on error
    - _Requirements: 18.2, 18.5_

    - [ ]* 20.5 Write property test for webhook idempotency
    - **Property 16: Webhook Idempotency**
    - **Validates: Requirements 18.5**

- [ ] 21. Phase 5 — Downloads (Ownership-gated)
    - [x] 21.1 Créer les fonctions download (Convex)
    - convex/downloads.ts: getDownloadUrl action
    - Verify ownership: fan authenticated + orderItem exists + order status paid
    - Generate file URL from fileStorageId
    - Return 403 if ownership invalid
    - Optionally log download in downloads table
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

    - [x] 21.2 Connecter Download button dans PurchaseItem
    - Call Convex downloads.getDownloadUrl
    - Open URL on success
    - Show error toast on failure
    - _Requirements: 17.2_

    - [ ]* 21.3 Write property test for download ownership verification
    - **Property 14: Download Ownership Verification**
    - **Validates: Requirements 17.3, 17.4, 17.5**

- [x] 22. Checkpoint 4 — Vérifier intégrations complètes (manuel via Playwright MCP)
    - Ensure Clerk auth works (sign-in, sign-up, role selection)
    - Verify Convex queries/mutations work end-to-end
    - Test Stripe checkout flow (test mode)
    - Test webhook → order creation
    - Test download flow (ownership verification)
    - _Note: Vérification manuelle via mcp_playwright_browser_navigate + mcp_playwright_browser_snapshot + mcp_playwright_browser_click + mcp_playwright_browser_network_requests_
    - Ask user if questions arise

- [ ] 23. Phase 6 — Qualité / Fidélité Design
    - [x] 23.1 Audit UI Landing page
    - Vérifier fidélité avec screenshots SuperDesign
    - Ajuster spacing, radius, colors si nécessaire
    - _Requirements: UI Fidelity Contract_

    - [x] 23.2 Audit UI Public Hub
    - Vérifier fidélité avec screenshots SuperDesign
    - _Requirements: UI Fidelity Contract_

    - [x] 23.3 Audit UI Artist Dashboard
    - Vérifier fidélité avec screenshots SuperDesign
    - _Requirements: UI Fidelity Contract_

    - [x] 23.4 Audit UI Fan Dashboard
    - Vérifier fidélité avec screenshots SuperDesign
    - _Requirements: UI Fidelity Contract_

    - [x] 23.5 Vérifier responsive (mobile + desktop)
    - Tester tous les breakpoints
    - Vérifier bottom nav mobile, sidebar desktop
    - _Requirements: 12.1-12.5_

- [ ] 24. Final Checkpoint — Projet complet (manuel via Playwright MCP)
    - Ensure all tests pass
    - Verify all pages render correctly
    - Test full user flows (sign-up → dashboard → purchase → download)
    - Prepare for Vercel deployment
    - _Note: Vérification manuelle complète via Playwright MCP (tous les outils disponibles)_
    - Ask user if questions arise

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- **IMPORTANT - Playwright MCP**: TOUS les checkpoints (existants et futurs) DOIVENT être vérifiés manuellement via Playwright MCP. Utiliser les outils: `mcp_playwright_browser_navigate`, `mcp_playwright_browser_snapshot`, `mcp_playwright_browser_click`, `mcp_playwright_browser_type`, `mcp_playwright_browser_file_upload`, `mcp_playwright_browser_network_requests`, etc. Toujours ajouter une note explicite dans chaque checkpoint.
- **Notifications**: sonner for global toasts, FormMessage for inline validation
- **Auth**: Clerk introduced early (Phase 2B) to avoid "mock user" debt
- **Stripe webhooks**: Next.js route verifies signature → forwards to Convex action for business logic
- **File uploads**: Client-side validation (type/size) before requesting upload URL


## 9.0 Production V1 (Artist-first) — Remove mocks, Real feed, Real payments

### 9.1 Fan Billing — Saved Payment Methods (Stripe Elements + webhooks + deterministic query)

- [x] 9.1.1 Install Stripe dependencies
    - `npm install @stripe/stripe-js @stripe/react-stripe-js`
    - Add env vars: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
    - _Requirements: R-FAN-PM-2.2_

- [x] 9.1.2 Convex schema: add Stripe customer + payment methods read model
    - Add `users.stripeCustomerId: v.optional(v.string())`
    - Add table `paymentMethods` with fields:
    - `userId: v.id("users")`
    - `stripeCustomerId: v.string()`
    - `stripePaymentMethodId: v.string()`
    - `brand: v.string()` (visa, mastercard, etc.)
    - `last4: v.string()`
    - `expMonth: v.number()`
    - `expYear: v.number()`
    - `isDefault: v.boolean()`
    - `billingName: v.optional(v.string())`
    - `billingEmail: v.optional(v.string())`
    - `createdAt: v.number()`
    - `updatedAt: v.number()`
    - Add indexes: `by_userId`, `by_stripeCustomerId`, `by_stripePaymentMethodId`
    - _Requirements: R-FAN-PM-1.1, R-FAN-PM-3.3, R-FAN-PM-3.4_

- [x] 9.1.3 Convex queries: deterministic read for billing page
    - Create `convex/paymentMethods.ts`
    - Export `listForCurrentUser` query (reads from `paymentMethods` table)
    - Sort: default first, then by createdAt desc
    - _Requirements: R-FAN-PM-3.1, R-FAN-PM-3.2_

- [x] 9.1.4 Convex actions: Stripe customer + setup intent
    - Create `convex/stripe.ts` with Stripe client (`new Stripe(process.env.STRIPE_SECRET_KEY)`)
    - Export `ensureCustomerForCurrentUser` action:
    - Check if user has `stripeCustomerId`
    - If not, create Stripe customer with email + metadata
    - Store `stripeCustomerId` in Convex via internal mutation
    - Return `{ stripeCustomerId }`
    - Export `createSetupIntent` action:
    - Ensure customer exists (call `ensureCustomerForCurrentUser`)
    - Create SetupIntent with `customer`, `payment_method_types: ["card"]`, `usage: "off_session"`
    - Return `{ clientSecret: setupIntent.client_secret }`
    - _Requirements: R-FAN-PM-1.2, R-FAN-PM-1.3, R-FAN-PM-2.1_

- [x] 9.1.5 Convex internal mutations: webhook sync helpers
    - Create `convex/internal/paymentMethods.ts` (or in `stripe.ts` as internalMutation)
    - Export `upsertFromStripe` mutation:
    - Args: userId, stripeCustomerId, stripePaymentMethodId, brand, last4, expMonth, expYear, isDefault, billingName, billingEmail
    - Query by `stripePaymentMethodId` (unique)
    - If exists: patch with new data + updatedAt
    - If not: insert new record
    - Export `removeByStripePaymentMethodId` mutation:
    - Query by `stripePaymentMethodId`
    - Delete if exists
    - Export `setDefaultByCustomer` mutation:
    - Query all PMs by `stripeCustomerId`
    - Update `isDefault` for all (true for matching `stripePaymentMethodId`, false for others)
    - _Requirements: R-FAN-PM-4.3_

- [x] 9.1.6 Convex actions: set default + detach (optional V1)
    - In `convex/stripe.ts`, export `setDefaultPaymentMethod` action:
    - Args: `stripePaymentMethodId`
    - Get current user + stripeCustomerId
    - Call `stripe.customers.update(customerId, { invoice_settings: { default_payment_method } })`
    - Return `{ ok: true }` (webhook will sync)
    - Export `detachPaymentMethod` action:
    - Args: `stripePaymentMethodId`
    - Verify current user authenticated
    - Call `stripe.paymentMethods.detach(paymentMethodId)`
    - Return `{ ok: true }` (webhook will sync)
    - _Requirements: R-FAN-PM-5.1, R-FAN-PM-5.2, R-FAN-PM-6.1, R-FAN-PM-6.2_

- [x] 9.1.7 Webhooks: sync payment methods into Convex (idempotent)
    - Update `/api/stripe/webhook/route.ts` to handle 4 new events:
    - `setup_intent.succeeded`: extract payment_method + customer, call `upsertFromStripe`
    - `payment_method.attached`: extract payment_method + customer, call `upsertFromStripe`
    - `payment_method.detached`: extract payment_method id, call `removeByStripePaymentMethodId`
    - `customer.updated`: extract `invoice_settings.default_payment_method`, call `setDefaultByCustomer`
    - Extract card data from `payment_method.card.brand`, `payment_method.card.last4`, `payment_method.card.exp_month`, `payment_method.card.exp_year`
    - Extract billing details from `payment_method.billing_details.name`, `payment_method.billing_details.email`
    - Ensure idempotence via `processedEvents` table (provider="stripe", eventId)
    - _Requirements: R-FAN-PM-4.1, R-FAN-PM-4.2, R-FAN-PM-4.3, R-FAN-PM-4.4_

- [x] 9.1.8 Frontend: Stripe client helper
    - Create `src/lib/stripe/stripeClient.ts`
    - Export `stripePromise = loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)`
    - _Requirements: R-FAN-PM-2.2_

- [x] 9.1.9 Frontend: AddPaymentMethodDialog component
    - Create `src/components/fan/AddPaymentMethodDialog.tsx`
    - Props: `open`, `onOpenChange`, `clientSecret`, `onSuccess`
    - Wrap `<Elements key={key} stripe={stripePromise} options={{ clientSecret }}>` around form
    - Reset Elements state on close (key increment)
    - Show "Initializing Stripe…" while clientSecret is null
    - _Requirements: R-FAN-PM-2.2_

- [x] 9.1.10 Frontend: PaymentMethodForm component
    - Create `src/components/fan/PaymentMethodForm.tsx`
    - Use `useStripe()` + `useElements()` hooks
    - Render `<PaymentElement />`
    - Confirm button calls `stripe.confirmSetup({ elements, redirect: "if_required" })`
    - Handle success: toast "Payment method added — Your card has been saved." + call `onSuccess()`
    - Handle error: toast destructive with `result.error.message`
    - Show security notice: "Your full card details are never stored on our servers."
    - _Requirements: R-FAN-PM-2.2, R-FAN-PM-2.3, R-FAN-PM-7.1_

- [x] 9.1.11 Frontend: Update billing page (remove mocks)
    - Update `src/app/(fan)/me/[username]/billing/page.tsx`
    - Remove `MOCK_PAYMENT_METHODS` usage
    - Use `useQuery(api.paymentMethods.listForCurrentUser)` for list
    - Use `useAction(api.stripe.createSetupIntent)` for add flow
    - Use `useAction(api.stripe.setDefaultPaymentMethod)` for set default
    - Use `useAction(api.stripe.detachPaymentMethod)` for remove
    - Implement 3 states: loading (skeleton), empty (message + button), list (cards with actions)
    - Show individual loading state during actions (busyId pattern)
    - _Requirements: R-FAN-PM-3.1, R-FAN-PM-7.2, R-FAN-PM-7.3_

- [x] 9.1.12 QA checkpoint: Payment methods end-to-end (manuel via Playwright MCP)
    - Verify "Add payment method" opens dialog with Stripe Elements
    - Test card addition with test card (4242 4242 4242 4242)
    - Verify webhook sync updates Convex table (card appears in list)
    - Test "Set as default" action (webhook updates isDefault)
    - Test "Remove" action (webhook deletes from table)
    - Verify no mock data displayed
    - _Note: Vérification manuelle via mcp_playwright_browser_navigate + mcp_playwright_browser_snapshot + mcp_playwright_browser_click + mcp_playwright_browser_type + mcp_playwright_browser_network_requests_
    - _Requirements: R-PROD-0.1, R-PROD-0.2_

### 9.2 Fan Feed — Real data (Convex)
- [x] 9.2.1 Remove mock feed posts generator
- [x] 9.2.2 Convex query: `feed.getForCurrentUser`
    - Inputs: limit, cursor
    - Join: follows -> artistId -> products/drops
    - Sort desc by publishedAt/createdAt
- [x] 9.2.3 UI wiring + pagination
    - loading/empty/error states
    - "Load more"

### 9.3 Stripe One-time purchases — Production verification
- [x] 9.3.1 Validate checkout flow end-to-end (no mocks)
- [x] 9.3.2 Webhook: `checkout.session.completed` idempotent
    - Update orders/orderItems
    - Write entitlement/download permissions
- [x] 9.3.3 Server-side gating for downloads/licenses

### 9.4 Clerk Billing (Artists) — Production hardening
- [x] 9.4.1 Backend gating for premium artist features
- [x] 9.4.2 Subscription status sync strategy validated (Clerk as source of truth)
- [x] 9.4.3 QA: upgrade/downgrade flows

### 9.5 QA Checkpoint — "Prod ready" (manuel via Playwright MCP)
- [ ] 9.5.1 Verify no mock payment data anywhere user-facing
- Navigate to `/me/[username]/billing` as fan
- Take snapshot and verify no hardcoded mock payment methods
- Verify payment methods list is either empty (with "Add payment method" CTA) or shows real Stripe data
- Navigate to `/dashboard/billing` as artist
- Take snapshot and verify no hardcoded mock transactions
- Verify transactions list is either empty (with "No sales yet" message) or shows real order data
- _Requirements: R-PROD-0.1_

- [ ] 9.5.2 Test add card flow (Elements) + card appears (webhook sync)
- Navigate to `/me/[username]/billing` as fan
- Click "Add payment method" button
- Verify Stripe Elements dialog opens with PaymentElement
- Enter test card: 4242 4242 4242 4242, exp 12/34, CVC 123
- Click "Save card" button
- Verify success toast appears: "Payment method added"
- Wait 2 seconds for webhook to process
- Refresh page and verify card appears in list with last4 "4242"
- Take snapshot of payment methods list
- _Requirements: R-FAN-PM-2.2, R-FAN-PM-4.1_

- [ ] 9.5.3 Test remove/set default actions
- In payment methods list, click "Set as default" on a non-default card
- Verify loading state appears on button
- Wait 2 seconds for webhook to process
- Verify card now shows "Default" badge
- Click "Remove" button on a non-default card
- Verify confirmation dialog appears
- Confirm removal
- Wait 2 seconds for webhook to process
- Refresh page and verify card is removed from list
- Take snapshot of updated list
- _Requirements: R-FAN-PM-5.1, R-FAN-PM-6.1_

- [ ] 9.5.4 Verify fan feed is real and paginated
- Navigate to `/me/[username]` as fan (feed page)
- Verify feed shows posts from followed artists (not mock data)
- Scroll to bottom of feed
- Verify "Load more" button appears if more posts exist
- Click "Load more" and verify new posts load
- Verify no duplicate posts appear
- Take snapshot of feed with loaded posts
- _Requirements: R-FAN-FEED-1, R-FAN-FEED-2_

- [ ] 9.5.5 Test Stripe one-time purchase unlocks downloads
- Sign in as fan account
- Navigate to artist's public hub (e.g., `/djnova`)
- Click "Buy Now" on a product
- Complete Stripe checkout with test card 4242 4242 4242 4242
- Verify redirect to success page
- Navigate to `/me/[username]/purchases`
- Verify purchased product appears in list
- Click "Download" button
- Verify file download starts (check browser downloads)
- Take snapshot of purchases page with download button
- _Requirements: R-CHECKOUT-1, R-DOWNLOAD-1_

- [ ] 9.5.6 Verify Clerk artist subscription gates features server-side
- Sign in as artist with free plan
- Navigate to `/dashboard/products`
- Attempt to create 4th product (if free plan limit is 3)
- Verify error message: "Upgrade to Pro to add more products"
- Navigate to Clerk user settings and upgrade to Pro plan
- Return to `/dashboard/products`
- Verify can now create 4th product
- Take snapshot of upgrade prompt and successful creation
- _Requirements: R-SUBSCRIPTION-1, R-SUBSCRIPTION-2_

- _Note: Vérification manuelle complète via Playwright MCP pour validation production_

---

- [ ] 25. Phase 7 — Landing/Home UI/UX Improvement (Conversion-First)

**Context:** Transition to conversion-focused landing page with artist-first messaging.

**Business Model Clarity:**
- Fans pay artists directly via Stripe Connect
- Platform earns from artist subscriptions (Clerk Billing)
- 0% platform fee on sales

**Objective:** Increase artist sign-up conversion rate to ≥3% within 30 days post-launch.

    - [x] 25.1 Audit & Routing
    - [x] 25.1.1 Identify current Home route
    - Verify if Home is at `src/app/page.tsx` or `src/app/(marketing)/page.tsx`
    - Ensure only ONE route serves `/` (no duplicates)
    - Document current structure
    - _Requirements: R-MKT-LAND-4_

    - [x] 25.1.2 List existing marketing components
    - Audit `src/components/marketing/` folder
    - Identify which components to refactor vs create new
    - Decision matrix:
    - Keep: HeroSection (refactor copy), FeatureGrid (refactor), Footer
    - Refactor: MarketingNavbar (update CTA)
    - Create new: ProofBar, HowItWorks, UseCases, FAQ
    - _Requirements: R-MKT-LAND-4_

    - [ ] 25.2 Hero Rewrite (English, Artist-First)
    - [x] 25.2.1 Update Hero copy (English)
    - Headline: "Fans pay you directly."
    - Subheadline: "Sell music, merch, and tickets with Stripe Connect payouts. We earn from your subscription—not your sales."
    - Trust line: "0% platform fee on sales • Automatic payouts • No credit card required"
    - Remove any French copy
    - _Requirements: R-MKT-LAND-1, R-MKT-LAND-2, R-MKT-LAND-8_

    - [x] 25.2.2 Update Navbar CTA
    - Primary CTA: "Start free as an Artist" (pill button, lavender gradient)
    - Secondary: "Sign In" (ghost button)
    - Remove "Join Beta" if present (or keep as secondary)
    - Ensure CTA visible above fold on mobile
    - _Requirements: R-MKT-LAND-2, R-MKT-LAND-3_

    - [x] 25.2.3 Update Hero layout (mobile-first)
    - Mobile: Headline → Subheadline → Trust line → Primary CTA → Secondary CTA → Hero image (below fold)
    - Desktop: 50/50 split (copy left, image right)
    - Ensure primary CTA visible without scroll on mobile
    - Touch targets ≥44x44px
    - _Requirements: R-MKT-LAND-3_

    - [x] 25.2.4 Add entrance animations
    - Headline: fade in + slide up (0.5s ease-out)
    - Subheadline: fade in + slide up (0.6s ease-out, 0.1s delay)
    - CTAs: fade in + slide up (0.7s ease-out, 0.2s delay)
    - Hero image: fade in (0.8s ease-out, 0.3s delay)
    - Respect `prefers-reduced-motion`
    - _Requirements: R-MKT-LAND-6_

    - [ ] 25.3 Add New Sections
    - [x] 25.3.1 Create ProofBar component (3 trust indicators)
    - Create `src/components/marketing/proof-bar.tsx`
    - 3 columns (desktop), stacked (mobile)
    - Content:
    1. "Direct Payouts" - "Funds go straight to your bank. No waiting, no middleman."
    2. "0% Sales Fee" - "We earn from subscriptions, not your hard work."
    3. "Stripe Secured" - "Industry-leading payment security and compliance."
    - Icons: Lucide React (32px, lavender accent)
    - Typography: Inter 600 (title), Inter 400 (description, muted)
    - _Requirements: R-MKT-LAND-4, R-MKT-LAND-8_

    - [x] 25.3.2 Create HowItWorks component (3 steps)
    - Create `src/components/marketing/how-it-works.tsx`
    - 3 columns with number badges + arrows
    - Content:
    1. "Sign up in 60 seconds" - "Choose your unique link and create your hub."
    2. "Connect Stripe" - "Set up automatic payouts to your bank account."
    3. "Share your link" - "Post on Instagram, YouTube, or anywhere fans find you."
    - Number badges: Circle, lavender gradient, white text
    - Arrows: Subtle, muted color (between steps)
    - Cards: Soft border, rounded-2xl, hover shadow
    - _Requirements: R-MKT-LAND-4, R-MKT-LAND-8_

    - [x] 25.3.3 Create UseCases component (3 cards)
    - Create `src/components/marketing/use-cases.tsx`
    - 3 cards: Music, Merch, Tickets
    - Content:
    - Music: "Sell tracks, albums, and exclusive releases" + "Fans download instantly after purchase"
    - Merch: "Sell physical goods with custom links" + "Manage orders and fulfillment your way"
    - Tickets: "Sell event access and tour tickets" + "Fans get instant confirmation"
    - Cards: Glass effect (bg-white/80 dark:bg-black/80), border, rounded-2xl
    - Icons: Lucide React (48px, lavender accent)
    - Hover: Lift effect (translateY -4px), shadow increase
    - _Requirements: R-MKT-LAND-4, R-MKT-LAND-8_

    - [x] 25.3.4 Create SocialProof component (minimal, optional V1)
    - Create `src/components/marketing/social-proof.tsx`
    - IF real testimonials/stats available: display 1-2 testimonials OR key stats
    - IF no real data: omit this section entirely (no fake data)
    - Design: Simple card with quote + author OR stat cards
    - _Requirements: R-MKT-LAND-4, R-MKT-LAND-5_

    - [x] 25.3.5 Create FAQ component (5 questions)
    - Create `src/components/marketing/faq.tsx`
    - Use shadcn Accordion component
    - 5 questions:
    1. "How do I get paid?" - "Stripe automatically deposits earnings to your bank account. You control the payout schedule (daily, weekly, or monthly)."
    2. "What fees do you charge?" - "0% on sales. We earn from artist subscriptions ($0-$29/month). Stripe charges standard processing fees (~2.9% + 30¢)."
    3. "How long does setup take?" - "5 minutes. Sign up, connect Stripe, and you're live."
    4. "Can I sell internationally?" - "Yes. Stripe supports 135+ currencies and global payments."
    5. "What payment methods do fans use?" - "Credit/debit cards, Apple Pay, Google Pay, and more via Stripe."
    - Expand/collapse with smooth animation
    - Only one open at a time (optional)
    - _Requirements: R-MKT-LAND-4, R-MKT-LAND-8, R-MKT-LAND-9_

    - [ ] 25.4 Performance & Polish
    - [x] 25.4.1 Optimize images with next/image
    - Audit all images in landing page
    - Replace `<img>` with `<Image>` from `next/image`
    - Add proper width, height, alt text
    - Use `priority` for above-fold images
    - Use `placeholder="blur"` for better UX
    - _Requirements: R-MKT-LAND-6_

    - [x] 25.4.2 Minimize client components (prefer RSC)
    - Audit landing page components
    - Convert to Server Components where possible
    - Keep Client Components only for:
    - Navbar (state for mobile menu)
    - Hero CTAs (click tracking)
    - FAQ (accordion state)
    - Lazy load below-fold sections (dynamic import)
    - _Requirements: R-MKT-LAND-6_

    - [x] 25.4.3 Add lightweight animations (framer-motion)
    - Use framer-motion for entrance animations
    - Respect `prefers-reduced-motion` media query
    - Keep animations ≤500ms duration
    - No heavy animations (parallax, complex transforms)
    - _Requirements: R-MKT-LAND-6_

    - [x] 25.4.4 Verify bundle size
    - Run `npm run build` and check bundle size
    - Landing page JS bundle target: ≤100KB (gzipped)
    - If over target, use dynamic imports for heavy components
    - _Requirements: R-MKT-LAND-6_

    - [ ] 25.5 Analytics & Tracking (PostHog)
    - [x] 25.5.1 Install PostHog package
    - Run: `npm install posthog-js`
    - Verify installation in package.json
    - _Requirements: R-MKT-LAND-7_

    - [x] 25.5.2 Add PostHog environment variables
    - Add to `.env.local`:
    ```env
    NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
    NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
    ```
    - Get key from PostHog dashboard (create free account if needed)
    - _Requirements: R-MKT-LAND-7_

    - [x] 25.5.3 Create PostHog provider component
    - Create file: `src/components/providers/posthog-provider.tsx`
    - Copy implementation:
    ```typescript
    'use client'
    import posthog from 'posthog-js'
    import { PostHogProvider } from 'posthog-js/react'
    import { useEffect } from 'react'
    
    export function PHProvider({ children }: { children: React.ReactNode }) {
      useEffect(() => {
        if (typeof window !== 'undefined') {
          posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
            person_profiles: 'identified_only',
            capture_pageview: false,
          })
        }
      }, [])
      
      return <PostHogProvider client={posthog}>{children}</PostHogProvider>
    }
    ```
    - Export from `src/components/providers/index.ts`
    - _Requirements: R-MKT-LAND-7_

    - [x] 25.5.4 Wrap app with PostHog provider
    - Open `src/app/layout.tsx`
    - Import: `import { PHProvider } from '@/components/providers/posthog-provider'`
    - Wrap existing providers: `<PHProvider><ClerkProvider>...</ClerkProvider></PHProvider>`
    - Verify app still runs without errors
    - _Requirements: R-MKT-LAND-7_

    - [x] 25.5.5 Add tracking to Hero primary CTA
    - Open `src/components/marketing/hero-section.tsx`
    - Import: `import posthog from 'posthog-js'`
    - Update "Start free as an Artist" button onClick:
    ```typescript
    onClick={() => {
      posthog.capture('start_as_artist_click', { location: 'hero' })
      router.push('/sign-up')
    }}
    ```
    - Test: Click button, verify event in PostHog dashboard
    - _Requirements: R-MKT-LAND-7_

    - [x] 25.5.6 Add tracking to Hero secondary CTA
    - In same file (`hero-section.tsx`)
    - Update "Explore artists" button onClick:
    ```typescript
    onClick={() => {
      posthog.capture('explore_artists_click', { location: 'hero' })
      router.push('/explore')
    }}
    ```
    - Test: Click button, verify event in PostHog dashboard
    - _Requirements: R-MKT-LAND-7_

    - [x] 25.5.7 Add tracking to waitlist submission
    - In `hero-section.tsx` (or waitlist form component)
    - After successful submission, add:
    ```typescript
    posthog.capture('waitlist_submit', { location: 'hero' })
    ```
    - Test: Submit email, verify event in PostHog dashboard
    - _Requirements: R-MKT-LAND-7_

    - [x] 25.5.8 Add landing page view tracking
    - Open `src/app/(marketing)/page.tsx`
    - Add useEffect to track page view:
    ```typescript
    'use client'
    import { useEffect } from 'react'
    import posthog from 'posthog-js'
    
    export default function LandingPage() {
      useEffect(() => {
        posthog.capture('landing_page_view')
      }, [])
      
      return (...)
    }
    ```
    - Test: Load page, verify event in PostHog dashboard
    - _Requirements: R-MKT-LAND-7_

    - [ ] 25.6 QA Checkpoint (Manual via Playwright MCP)
    - [ ] 25.6.1 Mobile-first verification
    - Open browser and resize to mobile viewport (375px width)
    - Navigate to `/` (landing page)
    - Take snapshot and verify hero headline is visible without scrolling
    - Verify primary CTA button is visible without scrolling
    - Measure touch targets: Click on CTA and verify it's at least 44x44px (use browser DevTools)
    - Scroll horizontally and verify no horizontal scroll bar appears
    - Click primary CTA and verify redirect to `/sign-up`
    - Take snapshot of sign-up page
    - _Requirements: R-MKT-LAND-3_

    - [ ] 25.6.2 CTA routing verification (SignedOut state)
    - Ensure signed out (clear cookies or use incognito)
    - Navigate to `/`
    - Click "Start free as an Artist" button
    - Verify redirect to `/sign-up`
    - Take snapshot of sign-up page
    - Go back to `/`
    - Click "Explore artists" button (if present)
    - Verify redirect to `/explore` or `/artists` (whichever is implemented)
    - Take snapshot of explore page
    - _Requirements: R-MKT-LAND-2_

    - [ ] 25.6.3 CTA routing verification (SignedIn Artist state)
    - Sign in as artist account
    - Navigate to `/`
    - Verify primary CTA text changes to "Go to Dashboard" or similar
    - Click primary CTA
    - Verify redirect to `/dashboard`
    - Take snapshot of dashboard
    - _Requirements: R-MKT-LAND-2_

    - [ ] 25.6.4 CTA routing verification (SignedIn Fan state)
    - Sign in as fan account
    - Navigate to `/`
    - Verify primary CTA text changes to "Go to Feed" or similar
    - Click primary CTA
    - Verify redirect to `/me` or `/feed`
    - Take snapshot of feed page
    - _Requirements: R-MKT-LAND-2_

    - [ ] 25.6.5 Performance check (Lighthouse)
    - Open Chrome DevTools
    - Navigate to Lighthouse tab
    - Select "Mobile" device and "Navigation" mode
    - Run audit on `/` (landing page)
    - Verify Performance score ≥90
    - Verify Accessibility score = 100
    - Verify First Contentful Paint (FCP) ≤1.8s
    - Verify Largest Contentful Paint (LCP) ≤2.5s
    - Take screenshot of Lighthouse results
    - If scores below target, identify issues in report and document for fixes
    - _Requirements: R-MKT-LAND-6_

    - [ ] 25.6.6 Copy clarity check (5-second test)
    - Recruit 3-5 people (team members, friends, or use usertesting.com)
    - Show landing page for exactly 5 seconds
    - Hide page and ask: "What does this product do?"
    - Document answers
    - Expected answer: "Helps artists sell directly to fans" or "Artists get paid directly" or similar
    - If 2+ people give unclear/wrong answers, revise headline/subheadline
    - Repeat test after revisions
    - _Requirements: R-MKT-LAND-1_

    - [ ] 25.6.7 Accessibility verification (Keyboard navigation)
    - Navigate to `/` (landing page)
    - Press Tab key repeatedly
    - Verify focus moves through all interactive elements in logical order:
      1. Skip to content link (if present)
      2. Navbar links
      3. Primary CTA
      4. Secondary CTA
      5. All section links/buttons
      6. Footer links
    - Verify focus indicator is visible on all elements (blue outline or custom style)
    - Press Enter on focused CTA and verify it activates
    - Take screenshot showing focus indicator
    - _Requirements: R-MKT-LAND-10_

    - [ ] 25.6.8 Accessibility verification (Color contrast)
    - Open Chrome DevTools
    - Navigate to Elements tab
    - Select headline text
    - Open Computed styles and check color contrast ratio
    - Verify contrast ratio ≥4.5:1 for normal text
    - Verify contrast ratio ≥3:1 for large text (≥18pt or ≥14pt bold)
    - Repeat for all text elements (subheadline, body text, CTA text)
    - Document any failing elements
    - _Requirements: R-MKT-LAND-10_

    - [ ] 25.6.9 Accessibility verification (Screen reader)
    - Mac: Enable VoiceOver (Cmd+F5)
    - Windows: Open NVDA (free screen reader)
    - Navigate to `/` (landing page)
    - Use screen reader to navigate through page
    - Verify heading hierarchy is logical (h1 → h2 → h3, no skips)
    - Verify all images have alt text
    - Verify all buttons have descriptive labels
    - Verify no "click here" or "learn more" without context
    - Document any issues
    - _Requirements: R-MKT-LAND-10_

    - [ ] 25.6.10 Analytics verification (PostHog events)
    - Open PostHog dashboard (https://app.posthog.com)
    - Navigate to Events tab
    - Clear recent events (or note timestamp)
    - In browser, navigate to `/` (landing page)
    - Verify `landing_page_view` event appears in PostHog (refresh dashboard)
    - Click "Start free as an Artist" button
    - Verify `start_as_artist_click` event appears with `location: 'hero'` property
    - Go back to `/`
    - Click "Explore artists" button
    - Verify `explore_artists_click` event appears with `location: 'hero'` property
    - Take screenshot of PostHog events list
    - _Requirements: R-MKT-LAND-7_

    - [ ] 25.6.11 No misleading content check
    - Navigate to `/` (landing page)
    - Read all copy carefully
    - Verify no fake user counts (e.g., "10,000+ artists" if not true)
    - Verify no fake revenue numbers (e.g., "$1M+ paid to artists" if not true)
    - Verify no "Coming soon" badges on features that don't exist
    - If use-case not live (e.g., Merch), verify wording indicates future availability OR section is omitted
    - Document any misleading content found
    - _Requirements: R-MKT-LAND-5_

- [ ] _Note: Vérification manuelle via mcp_playwright_browser_navigate + mcp_playwright_browser_snapshot + mcp_playwright_browser_click + mcp_playwright_browser_take_screenshot + mcp_playwright_browser_console_messages_

    - [ ] 25.7 Success Metrics Setup (Post-Launch)
    - [ ] 25.7.1 Define baseline metrics (pre-launch)
    - Current artist sign-up conversion rate (if available)
    - Current bounce rate
    - Current time on page
    - Document in analytics dashboard
    - _Requirements: R-MKT-LAND-11_

    - [ ] 25.7.2 Set up conversion funnel tracking
    - Funnel steps:
    1. Landing page view
    2. CTA click
    3. Sign-up page view
    4. Sign-up complete
    5. Onboarding complete (role selected)
    - Track drop-off at each step
    - _Requirements: R-MKT-LAND-11_

    - [ ] 25.7.3 Schedule 30-day review
    - Set calendar reminder for 30 days post-launch
    - Review metrics:
    - Artist sign-up conversion rate (target: ≥3%)
    - Bounce rate (target: ≤60%)
    - Time on page (target: ≥45 seconds)
    - CTA click-through rate (target: ≥10%)
    - Document findings and iterate
    - _Requirements: R-MKT-LAND-11_

---

## Notes on Phase 7

- **Language:** All copy MUST be in English (no French)
- **Artist-first:** Messaging focuses on artist benefits, not fan features
- **No fake data:** If feature not live, omit or indicate "coming soon" discreetly
- **Performance:** Lighthouse Performance ≥90 (mobile) is mandatory
- **Accessibility:** WCAG 2.1 AA compliance is mandatory
- **Analytics:** Privacy-first approach (no Google Analytics)
- **Success criteria:** 3% artist sign-up conversion rate within 30 days
