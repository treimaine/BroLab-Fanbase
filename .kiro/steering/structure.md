---
inclusion: always
---

# Structure Document: BroLab Fanbase

## Architecture des Dossiers (Complète)

```
brolab-fanbase/
├── src/
│   ├── app/
│   │   ├── (marketing)/          # Landing page publique
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── (auth)/               # Pages Clerk
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   │   └── onboarding/page.tsx
│   │   ├── (artist)/             # Dashboard artiste (protégé)
│   │   │   ├── layout.tsx
│   │   │   └── dashboard/
│   │   │       ├── page.tsx      # Overview
│   │   │       ├── profile/page.tsx
│   │   │       ├── links/page.tsx
│   │   │       ├── events/page.tsx
│   │   │       ├── products/page.tsx
│   │   │       └── billing/page.tsx
│   │   ├── (fan)/                # Dashboard fan (protégé)
│   │   │   ├── layout.tsx
│   │   │   └── me/
│   │   │       ├── page.tsx      # Redirect → /me/[username]
│   │   │       └── [username]/
│   │   │           ├── page.tsx  # Feed
│   │   │           ├── purchases/page.tsx
│   │   │           └── billing/page.tsx
│   │   ├── (public)/             # Hub public artiste
│   │   │   └── [artistSlug]/page.tsx
│   │   ├── api/
│   │   │   ├── onboarding/set-role/route.ts
│   │   │   └── stripe/webhook/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx              # Redirect to marketing
│   ├── components/
│   │   ├── dashboard/            # Artist dashboard components
│   │   │   ├── balance-card.tsx
│   │   │   ├── create-content-card.tsx
│   │   │   ├── event-item.tsx
│   │   │   ├── event-stats-row.tsx
│   │   │   ├── link-item.tsx
│   │   │   ├── payout-method-card.tsx
│   │   │   ├── product-item.tsx
│   │   │   ├── setup-checklist.tsx
│   │   │   ├── stats-card.tsx
│   │   │   └── transactions-list.tsx
│   │   ├── fan/                  # Fan-specific components
│   │   │   ├── billing-history-tab.tsx
│   │   │   ├── order-details-dialog.tsx
│   │   │   ├── payment-methods-tab.tsx
│   │   │   └── purchase-item.tsx
│   │   ├── feed/                 # Feed components
│   │   │   ├── community-widget.tsx
│   │   │   ├── feed-card.tsx
│   │   │   └── suggested-artists-widget.tsx
│   │   ├── forms/                # Form dialogs
│   │   │   ├── add-link-dialog.tsx
│   │   │   ├── add-product-dialog.tsx
│   │   │   ├── create-event-dialog.tsx
│   │   │   ├── profile-form.tsx
│   │   │   └── social-links-list.tsx
│   │   ├── hub/                  # Public hub components
│   │   │   ├── drops-list.tsx
│   │   │   ├── events-list.tsx
│   │   │   └── hub-header.tsx
│   │   ├── icons/
│   │   │   └── social-icons.tsx
│   │   ├── layout/               # Layout components
│   │   │   ├── app-shell.tsx
│   │   │   ├── bottom-nav.tsx
│   │   │   ├── mobile-drawer.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── theme-provider.tsx
│   │   │   ├── theme-toggle.tsx
│   │   │   └── top-bar.tsx
│   │   ├── marketing/            # Landing page components
│   │   │   ├── feature-grid.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── hero-section.tsx
│   │   │   └── marketing-navbar.tsx
│   │   ├── player/               # Global media player
│   │   │   ├── featured-track-card.tsx
│   │   │   ├── global-player-provider.tsx
│   │   │   ├── media-card-overlay.tsx
│   │   │   ├── player-demo.tsx
│   │   │   └── video-modal.tsx
│   │   ├── providers/            # Context providers
│   │   │   ├── convex-client-provider.tsx
│   │   │   └── user-sync-provider.tsx
│   │   └── ui/                   # shadcn/ui components
│   │       ├── avatar.tsx, badge.tsx, button.tsx
│   │       ├── card.tsx, dialog.tsx, dropdown-menu.tsx
│   │       ├── form.tsx, input.tsx, label.tsx
│   │       ├── select.tsx, separator.tsx, sheet.tsx
│   │       ├── skeleton.tsx, sonner.tsx, switch.tsx
│   │       ├── tabs.tsx, textarea.tsx
│   ├── lib/
│   │   ├── utils.ts              # cn(), slugify()
│   │   └── constants.ts          # RESERVED_SLUGS, BLOCKED_SOCIAL_DOMAINS
│   ├── middleware.ts             # Clerk auth + role-based routing
│   └── types/
│       └── index.ts
├── convex/
│   ├── _generated/               # Auto-generated Convex files
│   ├── auth.config.ts            # Clerk JWT integration
│   ├── schema.ts                 # Database schema (11 tables)
│   ├── users.ts                  # User sync & queries
│   ├── artists.ts                # Artist CRUD
│   ├── links.ts                  # Links management
│   ├── events.ts                 # Events CRUD
│   ├── products.ts               # Products CRUD
│   ├── follows.ts                # Follow/unfollow logic
│   ├── orders.ts                 # Order creation
│   ├── waitlist.ts               # Beta signups
│   ├── files.ts                  # File upload URLs
│   ├── downloads.ts              # Download verification
│   ├── downloads_helpers.ts      # Download utilities
│   ├── stripe.ts                 # Stripe webhook processing
│   └── seed.ts                   # Dev data seeding
├── public/                       # Static assets
├── .env.local                    # Environment variables
├── .env.example                  # Example env file
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
└── components.json               # shadcn/ui config
```

## Route Groups (App Router)

| Group | Description | Protection |
|-------|-------------|------------|
| `(marketing)` | Landing page publique | Aucune |
| `(auth)` | Pages Clerk (sign-in, sign-up, onboarding) | Aucune |
| `(artist)` | Dashboard artiste | Middleware: role = artist |
| `(fan)` | Dashboard fan | Middleware: role = fan |
| `(public)` | Hub public artiste | Aucune |

## Schéma Convex (11 Tables)

| Table | Clés/Indexes | Description |
|-------|--------------|-------------|
| `users` | clerkUserId, usernameSlug | Utilisateurs sync depuis Clerk avec rôle |
| `waitlist` | email | Emails waitlist landing page |
| `artists` | ownerUserId, artistSlug | Profils artistes avec bio, cover, socials |
| `links` | artistId | Liens externes Linktree-style |
| `events` | artistId | Événements/concerts avec tickets |
| `products` | artistId | Produits digitaux (music/video) avec fileStorageId |
| `follows` | fanUserId, artistId, [fan+artist] | Relations fan → artiste |
| `orders` | fanUserId, stripeSessionId | Commandes Stripe |
| `orderItems` | orderId | Items de commande avec snapshot produit |
| `processedEvents` | [provider+eventId] | Stripe webhook idempotency |
| `downloads` | fanUserId | Logs de téléchargements |

## Composants par Catégorie

### Layout Components
- **AppShell**: Layout principal responsive (Sidebar desktop / TopBar+BottomNav mobile)
- **Sidebar**: Navigation desktop avec user section et theme toggle
- **TopBar**: Header mobile avec logo, burger menu, user avatar
- **BottomNav**: Navigation mobile persistante (4-5 items)
- **MobileDrawer**: Sheet navigation mobile avec liens
- **ThemeProvider**: next-themes wrapper pour dark/light mode
- **ThemeToggle**: Bouton toggle theme

### Dashboard Components (Artist)
- **StatsCard**: Métriques dashboard (followers, revenue, events)
- **SetupChecklist**: Onboarding progress checklist
- **CreateContentCard**: Quick actions pour créer contenu
- **EventItem**: Event list item avec actions
- **EventStatsRow**: Stats row pour events
- **LinkItem**: Custom link item avec drag handle
- **ProductItem**: Product list item avec actions
- **BalanceCard**: Balance et payout info
- **PayoutMethodCard**: Payout method display
- **TransactionsList**: Liste des transactions

### Fan Components
- **PurchaseItem**: Purchase history item avec download button
- **OrderDetailsDialog**: Modal détails commande
- **PaymentMethodsTab**: Gestion méthodes de paiement
- **BillingHistoryTab**: Historique des commandes

### Feed Components
- **FeedCard**: Artist post card avec CTAs contextuels
- **CommunityWidget**: Widget communauté sidebar
- **SuggestedArtistsWidget**: Suggestions d'artistes

### Form Components
- **ProfileForm**: Édition profil artiste (react-hook-form + zod)
- **SocialLinksList**: Gestion liens sociaux
- **AddLinkDialog**: Dialog ajout custom link
- **AddProductDialog**: Dialog upload produit
- **CreateEventDialog**: Dialog création event

### Hub Components (Public)
- **HubHeader**: Header hub public avec cover, avatar, follow button
- **DropsList**: Liste des produits (drops)
- **EventsList**: Liste des événements

### Marketing Components
- **HeroSection**: Hero landing page avec CTA
- **FeatureGrid**: Grid features (3 cards)
- **MarketingNavbar**: Navbar landing page
- **Footer**: Footer landing page

### Player Components
- **GlobalPlayerProvider**: Zustand store provider
- **FeaturedTrackCard**: Card track avec play button
- **MediaCardOverlay**: Overlay play button sur media
- **VideoModal**: Modal lecture vidéo plein écran
- **PlayerDemo**: Demo player (dev)

### Provider Components
- **ConvexClientProvider**: Convex + Clerk integration wrapper
- **UserSyncProvider**: Sync Clerk user to Convex on mount
