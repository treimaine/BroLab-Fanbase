---
inclusion: always
---

# Tech Document: BroLab Fanbase

## Stack Technique (Janvier 2026)

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| Framework | Next.js (App Router) | 14.2.35 |
| Language | TypeScript | 5.x |
| Runtime | React | 18 |
| UI Library | shadcn/ui (Radix UI) | latest |
| Styling | Tailwind CSS | 3.4.1 |
| Animations | Framer Motion | 12.23.26 |
| Icons | Lucide React | 0.562.0 |
| Theme | next-themes | 0.4.6 |
| Auth | Clerk | 6.36.5 |
| Backend/DB | Convex | 1.31.2 |
| Payments | Stripe | 20.1.2 |
| State Management | Zustand | 5.0.9 |
| Forms | react-hook-form | 7.70.0 |
| Validation | Zod | 4.3.5 |
| Notifications | Sonner | 2.0.7 |
| Hosting | Vercel | - |

## Dépendances Complètes

```json
{
  "dependencies": {
    "@clerk/nextjs": "^6.36.5",
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@stripe/stripe-js": "^8.6.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "convex": "^1.31.2",
    "framer-motion": "^12.23.26",
    "lucide-react": "^0.562.0",
    "next": "14.2.35",
    "next-themes": "^0.4.6",
    "react": "^18",
    "react-dom": "^18",
    "react-hook-form": "^7.70.0",
    "sonner": "^2.0.7",
    "stripe": "^20.1.2",
    "tailwind-merge": "^3.4.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^4.3.5",
    "zustand": "^5.0.9"
  }
}
```

## Composants shadcn/ui Installés

```bash
# Composants UI actuellement installés
- avatar, badge, button, card
- dialog, dropdown-menu, form
- input, label, select, separator
- sheet, skeleton, sonner (toasts)
- switch, tabs, textarea
```

## Variables d'Environnement

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-domain.clerk.accounts.dev

# Convex Backend
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Application
NEXT_PUBLIC_URL=http://localhost:3000
```

## Patterns Techniques

### Notifications
- **Toasts globaux**: `sonner` (succès, erreurs générales)
- **Erreurs de validation**: `FormMessage` inline (shadcn Form)

### Auth Flow
1. Sign-up via Clerk
2. Onboarding: sélection rôle (Artist/Fan)
3. Stockage rôle dans `Clerk publicMetadata.role`
4. Sync user vers Convex via UserSyncProvider
5. Middleware vérifie le rôle pour protéger les routes

### Middleware Protection (src/middleware.ts)
- Utilise `clerkMiddleware()` avec `createRouteMatcher()`
- Routes publiques: /, /sign-in, /sign-up, /[artistSlug], /api/stripe/webhook
- Routes artiste: /dashboard/** (require role='artist')
- Routes fan: /me/[username]/** (require role='fan')
- Redirection automatique selon le rôle
- /me → redirige vers /me/[username]

### File Upload (Convex Storage)
1. Client: validation type/taille (audio ≤50MB, video ≤500MB)
2. Request upload URL via Convex mutation: `files.generateUploadUrl`
3. Upload fichier vers URL via fetch POST
4. Receive `storageId` from response
5. Store `fileStorageId` dans product record avec metadata (contentType, fileSize)

### Stripe Webhooks (Source of Truth)
1. Next.js route handler reçoit webhook (`/api/stripe/webhook`)
2. Vérification signature Stripe (`stripe.webhooks.constructEvent`)
3. Idempotency: check `processedEvents` table (provider="stripe", eventId)
4. Forward vers Convex action ou internal mutations
5. Events gérés:
   - **Checkout**: `checkout.session.completed` → create order + orderItems
   - **Payment Methods**: 
     - `setup_intent.succeeded` → upsert payment method
     - `payment_method.attached` → upsert payment method (fallback)
     - `payment_method.detached` → delete payment method
     - `customer.updated` → sync default payment method

### Stripe Elements (Payment Methods)
1. **Setup Flow**:
   - Call Convex action `stripe.createSetupIntent()` → returns `clientSecret`
   - Wrap UI with `<Elements stripe={stripePromise} options={{ clientSecret }}>`
   - Render `<PaymentElement />` (Stripe hosted UI)
   - Confirm with `stripe.confirmSetup({ elements, redirect: "if_required" })`
2. **Read Model (Deterministic)**:
   - Query `paymentMethods.listForCurrentUser` reads Convex table (never Stripe API)
   - Webhooks sync Stripe → Convex (source of truth)
   - UI updates automatically via Convex reactivity
3. **Security**:
   - Never store PAN/CVC (Stripe Elements only)
   - Store metadata: brand, last4, expMonth, expYear, isDefault
   - Stripe handles PCI compliance

### Downloads (Ownership-Gated)
1. Fan clique "Download" sur produit acheté
2. Convex vérifie: authenticated + orderItem exists + order paid
3. Si valide: génère URL temporaire via `ctx.storage.getUrl(fileStorageId)`
4. Si invalide: erreur 403
5. Log download dans downloads table
6. URL expire après ~1 heure

### Global Media Player
- State management: Zustand store (components/player/)
- Supports: audio et video playback
- Persistent across navigation
- Controls: play/pause, volume, progress bar
- Video modal pour lecture plein écran

## Contraintes MVP

- Package manager: **npm** (pas pnpm)
- Next.js: **14.x** (pas 15.x)
- Storage: Convex File Storage (migration R2 future pour scale)
- Mobile-first design
- UI fidèle aux designs SuperDesign

## Slugs Réservés

```typescript
// src/lib/constants.ts
const RESERVED_SLUGS = [
  'me', 'dashboard', 'sign-in', 'sign-up', 
  'api', 'admin', 'settings',
  'help', 'support', 'about', 'terms', 'privacy', 'contact'
];

// Blocked social domains for Custom Links
const BLOCKED_SOCIAL_DOMAINS = [
  'instagram.com', 'x.com', 'twitter.com',
  'youtube.com', 'spotify.com', 'tiktok.com',
  'soundcloud.com', 'facebook.com', 'twitch.tv'
];
```
