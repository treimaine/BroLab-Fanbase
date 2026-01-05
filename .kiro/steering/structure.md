---
inclusion: always
---

# Structure Document: BroLab Fanbase

## Architecture des Dossiers

```
brolab-fanbase/
├── src/
│   ├── app/
│   │   ├── (marketing)/          # Landing page publique
│   │   │   └── page.tsx
│   │   ├── (auth)/               # Pages Clerk
│   │   │   ├── sign-in/[[...sign-in]]/
│   │   │   ├── sign-up/[[...sign-up]]/
│   │   │   └── onboarding/
│   │   ├── (artist)/             # Dashboard artiste (protégé)
│   │   │   └── dashboard/
│   │   │       ├── page.tsx      # Overview
│   │   │       ├── profile/
│   │   │       ├── links/
│   │   │       ├── events/
│   │   │       ├── products/
│   │   │       └── billing/
│   │   ├── (fan)/                # Dashboard fan (protégé)
│   │   │   └── me/
│   │   │       ├── page.tsx      # Redirect → /me/[username]
│   │   │       └── [username]/
│   │   │           ├── page.tsx  # Feed
│   │   │           ├── purchases/
│   │   │           └── billing/
│   │   ├── (public)/             # Hub public artiste
│   │   │   └── [artistSlug]/
│   │   ├── api/
│   │   │   └── stripe/
│   │   │       ├── checkout/
│   │   │       └── webhook/
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── layout/               # AppShell, Sidebar, TopBar, BottomNav
│   │   ├── marketing/            # HeroSection, FeatureGrid, Footer
│   │   ├── hub/                  # HubHeader, DropsList, EventsList
│   │   ├── dashboard/            # StatsCard, SetupChecklist, etc.
│   │   ├── feed/                 # FeedCard, widgets
│   │   ├── forms/                # ProfileForm, AddLinkDialog, etc.
│   │   └── ui/                   # Composants shadcn/ui
│   ├── lib/
│   │   ├── utils.ts              # slugify(), cn()
│   │   ├── constants.ts          # RESERVED_SLUGS
│   │   └── validations.ts        # validateFileUpload()
│   └── types/
│       └── index.ts
├── convex/
│   ├── schema.ts                 # Schéma des tables
│   ├── users.ts
│   ├── artists.ts
│   ├── links.ts
│   ├── events.ts
│   ├── products.ts
│   ├── follows.ts
│   ├── orders.ts
│   ├── waitlist.ts
│   ├── files.ts
│   ├── downloads.ts
│   └── stripe.ts
├── public/
├── .env.local                    # Variables d'environnement
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs
```

## Route Groups (App Router)

| Group | Description | Protection |
|-------|-------------|------------|
| `(marketing)` | Landing page publique | Aucune |
| `(auth)` | Pages Clerk (sign-in, sign-up, onboarding) | Aucune |
| `(artist)` | Dashboard artiste | Middleware: role = artist |
| `(fan)` | Dashboard fan | Middleware: role = fan |
| `(public)` | Hub public artiste | Aucune |

## Schéma Convex (Tables)

| Table | Description |
|-------|-------------|
| `users` | Utilisateurs sync depuis Clerk |
| `artists` | Profils artistes (slug, bio, cover, etc.) |
| `links` | Liens externes des artistes |
| `events` | Événements/concerts |
| `products` | Produits digitaux (musique, vidéos) |
| `follows` | Relations fan → artiste |
| `orders` | Commandes (Stripe) |
| `orderItems` | Items de commande |
| `waitlist` | Emails waitlist landing page |
| `processedEvents` | IDs Stripe pour idempotency |
| `downloads` | Logs de téléchargements |

## Composants Layout

- **AppShell**: Layout principal responsive (Sidebar desktop / TopBar+BottomNav mobile)
- **Sidebar**: Navigation desktop avec user section
- **TopBar**: Header mobile avec burger menu
- **BottomNav**: Navigation mobile persistante
- **MobileDrawer**: Sheet navigation mobile
