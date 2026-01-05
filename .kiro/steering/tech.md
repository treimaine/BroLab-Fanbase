---
inclusion: always
---

# Tech Document: BroLab Fanbase

## Stack Technique

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| Framework | Next.js (App Router) | 14.x |
| Language | TypeScript | 5.x |
| UI Library | shadcn/ui | latest |
| Styling | Tailwind CSS | 3.4.x |
| Animations | Framer Motion | 12.x |
| Icons | Lucide React | 0.562.x |
| Theme | next-themes | 0.4.x |
| Auth | Clerk | latest |
| Backend/DB | Convex | latest |
| Payments | Stripe | latest |
| Hosting | Vercel | - |

## Dépendances Actuelles

```json
{
  "dependencies": {
    "framer-motion": "^12.23.26",
    "lucide-react": "^0.562.0",
    "next": "14.2.35",
    "next-themes": "^0.4.6",
    "react": "^18",
    "react-dom": "^18"
  }
}
```

## Dépendances à Installer

```bash
# shadcn/ui (après init)
npx shadcn@latest init
npx shadcn@latest add button card input tabs sheet avatar switch separator dropdown-menu badge skeleton sonner form label dialog

# Auth
npm install @clerk/nextjs

# Backend
npm install convex

# Payments
npm install stripe @stripe/stripe-js
```

## Variables d'Environnement

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## Patterns Techniques

### Notifications
- **Toasts globaux**: `sonner` (succès, erreurs générales)
- **Erreurs de validation**: `FormMessage` inline (shadcn Form)

### Auth Flow
1. Sign-up via Clerk
2. Onboarding: sélection rôle (Artist/Fan)
3. Stockage rôle dans `Clerk publicMetadata.role`
4. Sync user vers Convex

### File Upload (Convex)
1. Client: validation type/taille (audio ≤50MB, video ≤200MB)
2. Request upload URL via Convex action
3. Upload fichier vers URL
4. Store `fileStorageId` dans product record

### Stripe Webhooks
1. Next.js route handler reçoit webhook
2. Vérification signature Stripe
3. Forward vers Convex action
4. Idempotency: check `processedEvents` table
5. Création order + orderItems

### Downloads (Ownership-gated)
1. Fan clique "Download"
2. Convex vérifie: authenticated + orderItem exists + order paid
3. Si valide: génère URL depuis `fileStorageId`
4. Si invalide: erreur 403

## Contraintes MVP

- Package manager: **npm** (pas pnpm)
- Next.js: **14.x** (pas 15.x)
- Storage: Convex File Storage (migration R2 future pour scale)
- Mobile-first design
- UI fidèle aux designs SuperDesign

## Slugs Réservés

```typescript
const RESERVED_SLUGS = [
  'me', 'dashboard', 'sign-in', 'sign-up', 
  'api', 'admin', 'settings'
];
```
