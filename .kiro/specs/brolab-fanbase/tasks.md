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

- [x] 7. Checkpoint 1 — Vérifier Landing + Auth + Convex
  - Ensure Landing page renders correctly
  - Verify light/dark toggle works
  - Test sign-up → onboarding → role selection flow
  - Verify waitlist submission stores in Convex
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

- [x] 8.8 Checkpoint Phase 3C — Vérifier Public Artist Hub (via Playwright)
  - ✅ Public Hub /djnova accessible sans authentification
  - ✅ HubHeader: cover, avatar, nom, bio, bouton Follow, social icons
  - ✅ DropsList: 3 produits avec images, badges, prix
  - ✅ EventsList: 3 événements avec dates, venues, statuts
  - ✅ Tabs navigation fonctionnelle
  - ✅ 404 state pour slugs invalides

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

- [x] 9.6 Checkpoint Phase 3D — Vérifier Artist Dashboard (via Playwright)
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

- [ ] 10. Phase 3E — Artist Profile Page
  - [ ] 10.1 Créer le composant ProfileForm
    - Image URL input + Display Name + Unique Slug + Bio
    - Prefix "fan.brolab/" avant le slug
    - Validation inline avec FormMessage
    - _Requirements: 5.2, 5.6_

  - [ ] 10.2 Créer le composant SocialLinksList
    - Liste des plateformes avec Switch toggle (on/off)
    - _Requirements: 5.3_

  - [ ] 10.3 Assembler la page Profile
    - src/app/(artist)/dashboard/profile/page.tsx
    - ProfileForm + SocialLinksList + Save button
    - Connecté à Convex artists.update
    - Toast success avec sonner
    - _Requirements: 5.1-5.6_

- [ ] 10.4 Checkpoint Phase 3E — Vérifier Artist Profile Page (via Playwright)
  - Verify profile form renders with all fields
  - Test slug validation (format, reserved, uniqueness)
  - Test social links toggle on/off
  - Verify save mutation works
  - Test toast notifications

- [ ] 11. Phase 3F — Artist Links Page
  - [ ] 11.1 Créer le composant LinkItem
    - Title, URL preview, type badge, active toggle
    - _Requirements: 6.5_

  - [ ] 11.2 Créer le composant AddLinkDialog
    - Form: title, URL, type selector
    - Validation inline avec FormMessage
    - _Requirements: 6.3_

  - [ ] 11.3 Créer les fonctions links (Convex)
    - convex/links.ts: create, update, delete, getByArtist, reorder
    - _Requirements: 6.1-6.5_

  - [ ] 11.4 Assembler la page Links
    - src/app/(artist)/dashboard/links/page.tsx
    - Liste de LinkItems + "Add New Link" button
    - Connecté à Convex
    - _Requirements: 6.1-6.5_

- [ ] 11.5 Checkpoint Phase 3F — Vérifier Artist Links Page (via Playwright)
  - Verify links list renders
  - Test add link dialog and form validation
  - Test link toggle active/inactive
  - Verify CRUD operations work

- [ ] 12. Phase 3G — Artist Events Page
  - [ ] 12.1 Créer le composant EventStatsRow
    - Total Tickets Sold, Gross Revenue, Upcoming Shows
    - _Requirements: 7.1_

  - [ ] 12.2 Créer le composant EventItem
    - Image, title, date, venue, tickets sold, revenue, status badge, "Manage" button
    - _Requirements: 7.2_

  - [ ] 12.3 Créer le composant CreateEventDialog
    - Form: title, date, city, venue, ticket URL, image URL
    - Validation inline avec FormMessage
    - _Requirements: 7.4_

  - [ ] 12.4 Créer les fonctions events (Convex)
    - convex/events.ts: create, update, delete, getByArtist
    - _Requirements: 7.1-7.5_

  - [ ] 12.5 Assembler la page Events
    - src/app/(artist)/dashboard/events/page.tsx
    - EventStatsRow + liste EventItems + "Create Event" button
    - Connecté à Convex
    - _Requirements: 7.1-7.5_

- [ ] 12.6 Checkpoint Phase 3G — Vérifier Artist Events Page (via Playwright)
  - Verify events stats row renders
  - Verify events list renders with all data
  - Test create event dialog and form validation
  - Verify CRUD operations work

- [ ] 13. Phase 3H — Artist Products Page (Upload Flow)
  - [ ] 13.1 Créer les fonctions files (Convex)
    - convex/files.ts: generateUploadUrl action
    - _Requirements: 16.4, 16.5_

  - [ ] 13.2 Créer les fonctions products (Convex)
    - convex/products.ts: create, update, delete, getByArtist
    - Store metadata: title, description, type, priceUSD, visibility, fileStorageId, contentType, fileSize
    - _Requirements: 16.1, 16.2, 16.3_

  - [ ] 13.3 Créer la validation fichiers (client-side)
    - src/lib/validations.ts: validateFileUpload()
    - Types autorisés: mp3, wav (audio), mp4 (video)
    - Tailles max: audio <= 50MB, video <= 200MB
    - Retourner erreur claire si invalide
    - _Requirements: 16.4, Upload Limits (MVP)_

  - [ ] 13.4 Créer le composant ProductItem
    - Cover image, title, type badge, price, visibility toggle
    - _Requirements: 16.1_

  - [ ] 13.5 Créer le composant AddProductDialog
    - Form: title, description, type (music/video), price, visibility, cover URL
    - File upload input avec validation client-side
    - Progress indicator pendant upload
    - Validation inline avec FormMessage
    - _Requirements: 16.2, 16.3_

  - [ ] 13.6 Créer le hook useFileUpload
    - Request upload URL from Convex
    - Upload file to URL
    - Return storageId on success
    - Handle errors with toast
    - _Requirements: 16.4, 16.5_

  - [ ] 13.7 Assembler la page Products
    - src/app/(artist)/dashboard/products/page.tsx
    - Liste ProductItems + "Add Product" button
    - Full upload flow: validate → upload → store metadata
    - _Requirements: 16.1-16.7_

- [ ] 13.8 Checkpoint Phase 3H — Vérifier Artist Products Page (via Playwright)
  - Verify products list renders
  - Test add product dialog and form validation
  - Test file upload with progress indicator
  - Verify file type/size validation
  - Test visibility toggle

- [ ] 14. Phase 3I — Artist Billing Page (Placeholder)
  - [ ] 14.1 Créer le composant BalanceCard
    - Available balance, pending, last payout (gradient background)
    - _Requirements: 8.1_

  - [ ] 14.2 Créer le composant PayoutMethodCard
    - Stripe Connect status (placeholder "Coming soon")
    - "Add Payout Method" disabled
    - _Requirements: 8.2, 8.3_

  - [ ] 14.3 Créer le composant TransactionsList
    - Liste placeholder de transactions
    - _Requirements: 8.4_

  - [ ] 14.4 Assembler la page Billing
    - src/app/(artist)/dashboard/billing/page.tsx
    - BalanceCard + PayoutMethodCard + TransactionsList
    - "Withdraw Funds" button disabled
    - _Requirements: 8.1-8.5_

- [ ] 14.5 Checkpoint Phase 3I — Vérifier Artist Billing Page (via Playwright)
  - Verify balance card renders with placeholder data
  - Verify payout method card shows "Coming soon"
  - Verify transactions list renders
  - Verify disabled buttons are properly disabled

- [ ] 15. Checkpoint 2 — Vérifier Artist Dashboard complet
  - Ensure all artist pages render correctly
  - Verify navigation between pages
  - Test responsive layout
  - Verify Convex mutations work (profile, links, events, products)
  - Test file upload flow
  - Ask user if questions arise

- [ ] 16. Phase 3J — Fan Dashboard
  - [ ] 16.1 Créer le layout fan avec AppShell
    - src/app/(fan)/layout.tsx
    - AppShell avec role="fan"
    - Protected by middleware (fan role required)
    - _Requirements: 9.1_

  - [ ] 16.2 Créer la page /me redirect
    - src/app/(fan)/me/page.tsx
    - Redirect vers /me/[username] basé sur Clerk user (pas mock!)
    - _Requirements: 9.1_

  - [ ]* 16.3 Write property test for /me redirect
    - **Property 10: Fan Dashboard URL Contains Username**
    - **Validates: Requirements 9.1**

  - [ ] 16.4 Créer le composant FeedCard
    - Artist avatar, name, timestamp, content, image
    - Action buttons (like, comment, share)
    - CTA buttons (Listen, Get Tickets, Shop Now)
    - _Requirements: 9.3, 9.4_

  - [ ] 16.5 Créer le composant CommunityWidget
    - Following count, Events count
    - _Requirements: 9.5_

  - [ ] 16.6 Créer le composant SuggestedArtistsWidget
    - Liste d'artistes suggérés
    - _Requirements: 9.5_

  - [ ] 16.7 Créer le composant FeaturedTrackCard
    - Mini player card avec cover, titre, artiste
    - _Requirements: 9.5_

  - [ ] 16.8 Assembler la page Feed
    - src/app/(fan)/me/[username]/page.tsx
    - Desktop: Feed + sidebar widgets
    - Mobile: single column feed
    - Connecté à Convex (followed artists feed)
    - _Requirements: 9.1-9.6_

- [ ] 17. Phase 3K — Fan Purchases Page
  - [ ] 17.1 Créer le composant PurchaseItem
    - Image, type badge, title, artist, date, price
    - Download button (si downloadable)
    - Status badge (Upcoming/Shipped)
    - _Requirements: 10.2, 10.3, 10.4_

  - [ ] 17.2 Assembler la page Purchases
    - src/app/(fan)/me/[username]/purchases/page.tsx
    - Liste de PurchaseItems
    - Connecté à Convex orders/orderItems
    - _Requirements: 10.1-10.5_

- [ ] 17.3 Checkpoint Phase 3K — Vérifier Fan Purchases Page (via Playwright)
  - Verify purchases list renders
  - Test download button functionality
  - Verify status badges display correctly

- [ ] 18. Phase 3L — Fan Billing Page
  - [ ] 18.1 Créer le composant PaymentMethodsTab
    - Saved cards list + "Add Payment Method" button
    - _Requirements: 11.2, 11.3_

  - [ ] 18.2 Créer le composant BillingHistoryTab
    - Transactions list avec date, description, amount
    - _Requirements: 11.4_

  - [ ] 18.3 Assembler la page Billing
    - src/app/(fan)/me/[username]/billing/page.tsx
    - Tabs: Payment Methods / Billing History
    - Security notice
    - _Requirements: 11.1-11.5_

- [ ] 18.4 Checkpoint Phase 3L — Vérifier Fan Billing Page (via Playwright)
  - Verify tabs navigation works
  - Verify payment methods tab renders
  - Verify billing history tab renders
  - Verify security notice displays

- [ ] 19. Checkpoint 3 — Vérifier Fan Dashboard complet
  - Ensure all fan pages render correctly
  - Verify navigation between pages
  - Test responsive layout
  - Verify /me redirect works with real Clerk user
  - Ask user if questions arise

- [ ] 20. Phase 4 — Stripe Integration (Checkout + Webhooks)
  - [ ] 20.1 Installer Stripe
    - `npm install stripe @stripe/stripe-js`
    - Configurer env variables (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)
    - _Requirements: 14.1, 18.1_

  - [ ] 20.2 Créer le route handler checkout
    - src/app/api/stripe/checkout/route.ts
    - Créer Stripe Checkout session pour product purchase
    - Include metadata: fanUserId, productId
    - _Requirements: 18.1_

  - [ ] 20.3 Créer la Convex action stripe.handleWebhook
    - convex/stripe.ts: handleWebhook action
    - Idempotency check: query processedEvents by eventId
    - If not processed: create order + orderItems
    - Mark event as processed
    - _Requirements: 18.2, 18.3, 18.4, 18.5_

  - [ ] 20.4 Créer le route handler webhook
    - src/app/api/stripe/webhook/route.ts
    - Verify Stripe signature (stripe.webhooks.constructEvent)
    - Forward to Convex action stripe.handleWebhook
    - Return 200 on success, 400 on error
    - _Requirements: 18.2, 18.5_

  - [ ]* 20.5 Write property test for webhook idempotency
    - **Property 16: Webhook Idempotency**
    - **Validates: Requirements 18.5**

- [ ] 21. Phase 5 — Downloads (Ownership-gated)
  - [ ] 21.1 Créer les fonctions download (Convex)
    - convex/downloads.ts: getDownloadUrl action
    - Verify ownership: fan authenticated + orderItem exists + order status paid
    - Generate file URL from fileStorageId
    - Return 403 if ownership invalid
    - Optionally log download in downloads table
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

  - [ ] 21.2 Connecter Download button dans PurchaseItem
    - Call Convex downloads.getDownloadUrl
    - Open URL on success
    - Show error toast on failure
    - _Requirements: 17.2_

  - [ ]* 21.3 Write property test for download ownership verification
    - **Property 14: Download Ownership Verification**
    - **Validates: Requirements 17.3, 17.4, 17.5**

- [ ] 22. Checkpoint 4 — Vérifier intégrations complètes
  - Ensure Clerk auth works (sign-in, sign-up, role selection)
  - Verify Convex queries/mutations work end-to-end
  - Test Stripe checkout flow (test mode)
  - Test webhook → order creation
  - Test download flow (ownership verification)
  - Ask user if questions arise

- [ ] 23. Phase 6 — Qualité / Fidélité Design
  - [ ] 23.1 Audit UI Landing page
    - Vérifier fidélité avec screenshots SuperDesign
    - Ajuster spacing, radius, colors si nécessaire
    - _Requirements: UI Fidelity Contract_

  - [ ] 23.2 Audit UI Public Hub
    - Vérifier fidélité avec screenshots SuperDesign
    - _Requirements: UI Fidelity Contract_

  - [ ] 23.3 Audit UI Artist Dashboard
    - Vérifier fidélité avec screenshots SuperDesign
    - _Requirements: UI Fidelity Contract_

  - [ ] 23.4 Audit UI Fan Dashboard
    - Vérifier fidélité avec screenshots SuperDesign
    - _Requirements: UI Fidelity Contract_

  - [ ] 23.5 Vérifier responsive (mobile + desktop)
    - Tester tous les breakpoints
    - Vérifier bottom nav mobile, sidebar desktop
    - _Requirements: 12.1-12.5_

- [ ] 24. Final Checkpoint — Projet complet
  - Ensure all tests pass
  - Verify all pages render correctly
  - Test full user flows (sign-up → dashboard → purchase → download)
  - Prepare for Vercel deployment
  - Ask user if questions arise

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- **Notifications**: sonner for global toasts, FormMessage for inline validation
- **Auth**: Clerk introduced early (Phase 2B) to avoid "mock user" debt
- **Stripe webhooks**: Next.js route verifies signature → forwards to Convex action for business logic
- **File uploads**: Client-side validation (type/size) before requesting upload URL
