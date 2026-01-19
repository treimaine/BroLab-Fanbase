---
inclusion: always
---

# Product Document: BroLab Fanbase

## Vision

BroLab Fanbase est une plateforme mobile-first permettant aux artistes de créer leur hub personnel ("one link") pour connecter directement avec leurs fans.

## Proposition de Valeur

**Tagline:** "Your career isn't an algorithm."

### Pour les Artistes
- Créer un hub public personnalisé (page "one link")
- Gérer profil, liens, événements et produits digitaux
- Vendre directement aux fans (musique, vidéos, tickets)
- Suivre les revenus et gérer les paiements

### Pour les Fans
- Suivre leurs artistes favoris
- Acheter du contenu digital et des tickets
- Feed personnalisé des artistes suivis
- Gérer leurs achats et téléchargements

## Fonctionnalités Implémentées (Janvier 2026)

### 1. Landing Page Marketing ✅
- Hero section avec tagline "Your career isn't an algorithm"
- Formulaire email pour waitlist (stocké dans Convex)
- Feature grid: Direct to Fan / Global Commerce / Own Your Data
- Navigation minimale avec Sign In / Join Beta
- Footer avec liens légaux
- Responsive mobile-first

### 2. Authentification & Onboarding ✅
- Sign-in / Sign-up via Clerk (composants catch-all routes)
- Onboarding: sélection de rôle (Artist ou Fan)
- Stockage rôle dans Clerk publicMetadata.role
- Sync automatique vers Convex (UserSyncProvider)
- Protection des routes par middleware (role-based)
- Redirections intelligentes selon le rôle

### 3. Hub Public Artiste (`/[artistSlug]`) ✅
- Cover image + avatar + bio
- Bouton Follow/Unfollow (toggle avec état)
- Liens sociaux (Instagram, X, YouTube, Spotify, etc.)
- Tabs: Latest Drops (produits) / Tour Dates (événements)
- URL personnalisée: `/[artistSlug]` (ex: /drake)
- Slug validation (réservés + format)
- Responsive avec layout adaptatif

### 4. Dashboard Artiste (`/dashboard`) ✅

#### Overview
- Stats cards: Followers, Revenue, Upcoming Events
- Setup checklist: Profile, Links, Events, Products
- Create content quick actions
- Recent activity feed

#### Profile & Bio
- Édition profil: displayName, slug, bio
- Upload avatar et cover image
- Gestion liens sociaux (Instagram, X, YouTube, Spotify, TikTok, SoundCloud, Apple Music, Facebook, Twitch)
- Toggle active/inactive par lien social
- Validation slug unique et non-réservé

#### Custom Links
- Gestion liens externes (Linktree-style)
- Add/Edit/Delete links
- Drag & drop reordering
- Toggle active/inactive
- Validation: bloque les domaines sociaux (doivent être dans Social Links)
- Types: latest-release, merch, website, custom

#### Events
- Create/Edit/Delete events
- Champs: title, date, venue, city, ticketUrl, imageUrl
- Status: upcoming, sold-out, past
- Stats: ticketsSold, revenue
- Liste avec filtres et tri

#### Products
- Upload produits digitaux (music/video)
- Champs: title, description, type, price, coverImage
- File upload vers Convex Storage (≤50MB audio, ≤200MB video)
- Visibility: public/private
- Preview et lecture dans player global
- Delete avec confirmation

#### Billing
- Balance card avec total revenue
- Payout method card (placeholder)
- Transactions list avec filtres
- Export data (future)

### 5. Dashboard Fan (`/me/[username]`) ✅

#### Feed
- Posts des artistes suivis
- CTAs contextuels: Listen Now, Buy Now, Get Tickets
- Widgets sidebar: Community, Suggested Artists
- Infinite scroll (future)
- Filtres par type de contenu

#### Purchases
- Historique d'achats avec détails
- Download buttons pour produits achetés
- Ownership verification avant download
- Order details dialog
- Filtres par date et type

#### Billing
- Tabs: Payment Methods / Billing History
- Gestion méthodes de paiement (future Stripe Elements)
- Historique des commandes avec statuts
- Order details avec items

### 6. Commerce Digital ✅
- Stripe Checkout integration
- Metadata: fanUserId, productId
- Webhook handler avec signature verification
- Idempotency via processedEvents table
- Order creation: order + orderItems
- Product snapshot dans orderItems
- Download URLs ownership-gated
- Temporary URLs (expire ~1h)

### 7. Global Media Player ✅
- Zustand state management
- Audio et video playback
- Controls: play/pause, volume, progress
- Persistent across navigation
- Video modal pour plein écran
- Featured track card avec overlay
- Auto-play next (future)

### 8. Responsive Design ✅
- Mobile-first approach
- Breakpoint: 768px (md:)
- Mobile: TopBar + BottomNav + Sheet drawer
- Desktop: Sidebar persistante
- Adaptive navigation selon rôle
- Touch-friendly controls

### 9. Theme System ✅
- Dark/Light mode avec next-themes
- System preference detection
- Smooth transitions
- HSL-based color system
- Custom accent colors (lavande)
- Persistent user preference

## Navigation Mobile-First

- **Mobile**: TopBar + BottomNav + Sheet drawer
- **Desktop**: Sidebar persistante
- Navigation différenciée par rôle (Fan vs Artist)

## Thème

- Support light/dark mode
- Esthétique SuperDesign: accent lavande, bordures douces, spacing généreux
- Polices: Playfair Display (titres) + Inter (corps)


## Fonctionnalités Futures (Roadmap)

### Phase 2 - Paiements Avancés
- Stripe Elements pour payment methods
- Saved payment methods
- Subscription billing
- Payout automation pour artistes
- Multi-currency support

### Phase 3 - Social Features
- Comments sur posts
- Likes et reactions
- Artist-to-fan messaging
- Fan-to-fan community
- Notifications système

### Phase 4 - Analytics
- Dashboard analytics détaillé
- Revenue breakdown par produit
- Fan demographics
- Engagement metrics
- Export reports

### Phase 5 - Scale & Performance
- Migration Convex Storage → R2
- CDN pour media delivery
- Image optimization
- Caching strategy
- Rate limiting

### Phase 6 - Advanced Features
- Live streaming events
- NFT integration
- Merch store
- Ticketing system
- Mobile apps (iOS/Android)
