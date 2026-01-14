# Official Documentation Rules

## Règle Obligatoire

**TOUJOURS consulter les documentations officielles avant d'implémenter des fonctionnalités liées à ces services.**

## Services Principaux

### Clerk (Authentication)

- **Documentation**: https://clerk.com/docs
- **Next.js Quickstart**: https://clerk.com/docs/quickstarts/nextjs

**Points critiques à vérifier:**
- Utiliser `clerkMiddleware()` (PAS `authMiddleware()` qui est déprécié)
- Imports corrects: `@clerk/nextjs` pour composants, `@clerk/nextjs/server` pour fonctions serveur
- Pattern App Router (pas Pages Router)

#### `<ClerkProvider>` - Configuration

Le composant `<ClerkProvider>` est requis pour intégrer Clerk dans l'application React. Il fournit le contexte de session et d'utilisateur aux hooks et composants Clerk.

**Setup recommandé (App Router):**
```tsx
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

**Props importantes:**
- `publishableKey`: Clé publique Clerk (via env `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)
- `signInUrl` / `signUpUrl`: URLs des pages d'auth
- `signInFallbackRedirectUrl` / `signUpFallbackRedirectUrl`: Redirections après auth (défaut: `/`)
- `signInForceRedirectUrl` / `signUpForceRedirectUrl`: Redirections forcées après auth
- `afterSignOutUrl`: URL après déconnexion
- `appearance`: Personnalisation des composants Clerk
- `localization`: Localisation des composants

**Props dépréciées à éviter:**
- ❌ `afterSignInUrl` → ✅ `signInFallbackRedirectUrl` ou `signInForceRedirectUrl`
- ❌ `afterSignUpUrl` → ✅ `signUpFallbackRedirectUrl` ou `signUpForceRedirectUrl`
- ❌ `redirectUrl` → ✅ Utiliser les props spécifiques ci-dessus

#### `<SignIn />` - Composant de connexion

Affiche l'UI de connexion. Contrôlé par les paramètres du Clerk Dashboard.

**Exemple:**
```tsx
'use client'
import { SignIn, useUser } from '@clerk/nextjs'

export default function SignInPage() {
  return <SignIn />
}
```

**Props importantes:**
- `fallbackRedirectUrl`: URL de redirection après connexion (si pas de `redirect_url` dans le path)
- `forceRedirectUrl`: URL de redirection forcée après connexion
- `signUpUrl`: URL vers la page d'inscription
- `signUpFallbackRedirectUrl` / `signUpForceRedirectUrl`: Redirections pour le lien "Sign up"
- `routing`: `'path'` (défaut Next.js) ou `'hash'`
- `path`: Chemin du composant (ex: `/sign-in`)
- `appearance`: Personnalisation visuelle
- `initialValues`: Pré-remplir les champs (email, etc.)
- `withSignUp`: `true` pour activer le flow sign-in-or-up

**Note:** `<SignIn />` et `<SignUp />` ne peuvent pas s'afficher si l'utilisateur est déjà connecté (sauf multi-session).

#### `<SignUp />` - Composant d'inscription

Affiche l'UI d'inscription. Contrôlé par les paramètres du Clerk Dashboard.

**Exemple:**
```tsx
'use client'
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return <SignUp />
}
```

**Props importantes:**
- `fallbackRedirectUrl`: URL de redirection après inscription
- `forceRedirectUrl`: URL de redirection forcée après inscription
- `signInUrl`: URL vers la page de connexion
- `signInFallbackRedirectUrl` / `signInForceRedirectUrl`: Redirections pour le lien "Sign in"
- `routing`: `'path'` (défaut Next.js) ou `'hash'`
- `path`: Chemin du composant (ex: `/sign-up`)
- `appearance`: Personnalisation visuelle
- `initialValues`: Pré-remplir les champs
- `unsafeMetadata`: Métadonnées custom copiées vers `User.unsafeMetadata` après inscription

#### `<GoogleOneTap />` - Connexion Google One Tap

Affiche l'UI Google One Tap pour sign-in/sign-up en un clic avec compte Google.

**Prérequis:** Activer Google comme connexion sociale dans le Clerk Dashboard avec des credentials custom.

**Exemple:**
```tsx
// app/sign-in/[[...sign-in]]/page.tsx
import { GoogleOneTap } from '@clerk/nextjs'

export default function Page() {
  return <GoogleOneTap />
}
```

**Props:**
- `cancelOnTapOutside`: Ferme le prompt si clic extérieur (défaut: `true`)
- `itpSupport`: Active l'UX spécifique ITP pour Safari/Chrome iOS/Firefox (défaut: `true`)
- `fedCmSupport`: Utilise l'API FedCM pour la connexion (défaut: `true`)
- `signInForceRedirectUrl`: URL de redirection forcée après connexion
- `signUpForceRedirectUrl`: URL de redirection forcée après inscription

**Limitations:**
- Ne pas utiliser si l'app utilise l'API Google au nom des utilisateurs (pas d'access/refresh token)
- Extension 1Password peut bloquer l'UI
- Cooldown après fermeture du prompt (supprimer cookie `g_state` pour bypass)

**Note:** Ne s'affiche pas si l'utilisateur est déjà connecté.

#### `<TaskResetPassword />` - Reset mot de passe (Session Task)

Affiche l'UI pour résoudre la session task `reset-password`.

**Usage:** Généralement géré automatiquement par `<SignIn />`. Utiliser uniquement pour personnaliser la route.

**Exemple:**
```tsx
// app/layout.tsx - Configurer la route custom
<ClerkProvider taskUrls={{ 'reset-password': '/onboarding/reset-password' }}>
  {children}
</ClerkProvider>

// app/onboarding/reset-password/page.tsx
import { TaskResetPassword } from '@clerk/nextjs'

export default function Page() {
  return <TaskResetPassword redirectUrlComplete="/dashboard" />
}
```

**Props:**
- `redirectUrlComplete`: URL après complétion de toutes les tasks
- `appearance`: Personnalisation visuelle

**Note:** Ne peut pas s'afficher si l'utilisateur n'a pas de session tasks en cours.

#### `<Waitlist />` - Liste d'attente

Affiche un formulaire pour rejoindre la liste d'attente (early access).

**Prérequis:** Activer le mode Waitlist dans le Clerk Dashboard (User Authentication > Waitlist).

**Exemple:**
```tsx
// app/waitlist/[[...waitlist]]/page.tsx
import { Waitlist } from '@clerk/nextjs'

export default function WaitlistPage() {
  return <Waitlist />
}
```

**Props:**
- `afterJoinWaitlistUrl`: URL après inscription à la waitlist
- `signInUrl`: URL vers la page de connexion (pour le lien "Already have an account?")
- `appearance`: Personnalisation visuelle

**Important:** Fournir `waitlistUrl` dans `<ClerkProvider>` ou `<SignIn />`.

#### `<UserAvatar />` - Avatar utilisateur

Affiche l'avatar de l'utilisateur connecté.

**Exemple:**
```tsx
import { SignedIn, UserAvatar } from '@clerk/nextjs'

function Header() {
  return (
    <header>
      <SignedIn>
        <UserAvatar />
      </SignedIn>
    </header>
  )
}
```

**Props:**
- `rounded`: Coins arrondis (défaut: `true`)
- `appearance`: Personnalisation visuelle
- `fallback`: Élément affiché pendant le chargement

#### `<UserButton />` - Bouton utilisateur

Affiche le bouton utilisateur avec menu dropdown (gérer compte, déconnexion, switch session).

**Exemple:**
```tsx
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'

function Header() {
  return (
    <header>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </header>
  )
}
```

**Props:**
- `showName`: Affiche le nom à côté de l'avatar
- `defaultOpen`: Ouvre le menu par défaut au premier rendu
- `userProfileMode`: `'modal'` (défaut) ou `'navigation'`
- `userProfileUrl`: URL de la page de profil (si `userProfileMode: 'navigation'`)
- `userProfileProps`: Props pour le composant `<UserProfile />` sous-jacent
- `signInUrl`: URL pour "Add another account"
- `afterSwitchSessionUrl`: URL après changement de session (multi-session)
- `appearance`: Personnalisation visuelle

**Props dépréciées (déplacer vers `<ClerkProvider>`):**
- ❌ `afterSignOutUrl` → ✅ `<ClerkProvider afterSignOutUrl="..." />`
- ❌ `afterMultiSessionSingleSignOutUrl` → ✅ `<ClerkProvider afterMultiSessionSingleSignOutUrl="..." />`

#### `<UserProfile />` - Profil utilisateur complet

Affiche une UI complète de gestion de compte (profil, sécurité, billing).

**Exemple (avec optional catch-all route):**
```tsx
// app/user-profile/[[...user-profile]]/page.tsx
import { UserProfile } from '@clerk/nextjs'

const UserProfilePage = () => <UserProfile />
export default UserProfilePage
```

**Props:**
- `routing`: `'path'` (défaut Next.js) ou `'hash'`
- `path`: Chemin du composant (ex: `/user-profile`)
- `additionalOAuthScopes`: Scopes OAuth additionnels par provider (ex: `{google: ['foo', 'bar']}`)
- `appearance`: Personnalisation visuelle
- `fallback`: Élément affiché pendant le chargement

**Note:** Utiliser la route optional catch-all `[[...user-profile]]` pour que le routing fonctionne.

#### Composants Billing (Beta)

> ⚠️ **Billing est en Beta** - APIs expérimentales, peuvent changer. Recommandé de pin les versions SDK.

##### `<PricingTable />` - Table de tarification

Affiche une table de Plans et Features pour les abonnements.

```tsx
// app/pricing/page.tsx
import { PricingTable } from '@clerk/nextjs'

export default function Page() {
  return <PricingTable />
}
```

**Props:**
- `for`: `'user'` (défaut) ou `'organization'`
- `collapseFeatures`: Collapse les features (défaut: `false`)
- `ctaPosition`: `'top'` ou `'bottom'` (défaut)
- `newSubscriptionRedirectUrl`: URL après checkout
- `checkoutProps`: `{ appearance }` pour personnaliser le drawer checkout
- `appearance`: Personnalisation visuelle

##### `<CheckoutButton />` - Bouton checkout (Experimental)

Ouvre le drawer checkout pour souscrire à un Plan.

```tsx
'use client'
import { SignedIn } from '@clerk/nextjs'
import { CheckoutButton } from '@clerk/nextjs/experimental'

export default function PricingPage() {
  return (
    <SignedIn>
      <CheckoutButton planId="cplan_xxx" planPeriod="month" />
    </SignedIn>
  )
}
```

**Props:**
- `planId` (requis): ID du Plan
- `planPeriod`: `'month'` ou `'annual'`
- `for`: `'user'` (défaut) ou `'organization'`
- `onSubscriptionComplete`: Callback après souscription réussie
- `newSubscriptionRedirectUrl`: URL de redirection après souscription
- `checkoutProps`: `{ appearance }` pour personnaliser le drawer
- `children`: Bouton custom

**Important:** 
- Doit être wrappé dans `<SignedIn />`
- Si `for="organization"`, une Organization active doit être définie

##### `<PlanDetailsButton />` - Détails d'un Plan (Experimental)

Ouvre le drawer avec les détails d'un Plan.

```tsx
'use client'
import { PlanDetailsButton } from '@clerk/nextjs/experimental'

export default function Page() {
  return <PlanDetailsButton planId="cplan_xxx" initialPlanPeriod="month" />
}
```

**Props:**
- `planId`: ID du Plan (requis si `plan` non fourni)
- `plan`: Objet Plan (données initiales)
- `initialPlanPeriod`: `'month'` ou `'annual'`
- `planDetailsProps`: `{ appearance }` pour personnaliser le drawer
- `children`: Bouton custom

##### `<SubscriptionDetailsButton />` - Détails abonnement (Experimental)

Ouvre le drawer avec les détails de l'abonnement actuel.

```tsx
'use client'
import { SignedIn } from '@clerk/nextjs'
import { SubscriptionDetailsButton } from '@clerk/nextjs/experimental'

export default function BillingPage() {
  return (
    <SignedIn>
      <SubscriptionDetailsButton />
    </SignedIn>
  )
}
```

**Props:**
- `for`: `'user'` (défaut) ou `'organization'`
- `onSubscriptionCancel`: Callback après annulation
- `subscriptionDetailsProps`: `{ appearance }` pour personnaliser le drawer
- `children`: Bouton custom

**Important:** 
- Doit être wrappé dans `<SignedIn />`
- Si `for="organization"`, une Organization active doit être définie

#### Variables d'environnement recommandées

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding
```

### Convex (Backend)

- **Documentation**: https://docs.convex.dev
- **Next.js Setup**: https://docs.convex.dev/quickstart/nextjs
- **Integration Clerk**: https://docs.convex.dev/auth/clerk
- **Templates**: [Next.js + Clerk](https://github.com/get-convex/template-nextjs-clerk) | [React + Clerk](https://github.com/get-convex/template-react-vite-clerk)
- **Quick Start**: `npm create convex@latest`

**Points critiques à vérifier:**
- Schema validation avec `v` validators
- Différence entre `query`, `mutation`, `action`
- File Storage upload flow
- Integration avec Clerk (`ConvexProviderWithClerk`)

#### Convex Next.js Quickstart (sans auth)

##### 1. Installation

```bash
npx create-next-app@latest my-app
cd my-app && npm install convex
npx convex dev  # Login GitHub, créer projet, sync
```

##### 2. Créer une query

```ts
// convex/tasks.ts
import { query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});
```

##### 3. Créer le ConvexClientProvider

```tsx
// app/ConvexClientProvider.tsx
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

##### 4. Wrapper le layout

```tsx
// app/layout.tsx
import { ConvexClientProvider } from "./ConvexClientProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
```

##### 5. Utiliser les données

```tsx
// app/page.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function Home() {
  const tasks = useQuery(api.tasks.get);
  return (
    <main>
      {tasks?.map(({ _id, text }) => <div key={_id}>{text}</div>)}
    </main>
  );
}
```

##### Commandes utiles

```bash
npx convex dev                              # Dev mode (sync auto)
npx convex deploy                           # Deploy en prod
npx convex import --table tasks data.jsonl  # Importer des données
npx convex dashboard                        # Ouvrir le dashboard
```

#### Intégration Convex + Clerk (Next.js App Router)

##### 1. Créer un JWT Template dans Clerk Dashboard

1. Aller dans **JWT templates** dans le Clerk Dashboard
2. Sélectionner **New template** → **Convex**
3. **NE PAS renommer le JWT token - il DOIT s'appeler `convex`**
4. Copier l'**Issuer URL** (Frontend API URL)
   - Dev: `https://verb-noun-00.clerk.accounts.dev`
   - Prod: `https://clerk.<your-domain>.com`

##### 2. Configurer Convex avec l'issuer Clerk

```ts
// convex/auth.config.ts
import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
```

```env
CLERK_JWT_ISSUER_DOMAIN=https://verb-noun-00.clerk.accounts.dev
```

Puis exécuter `npx convex dev` pour synchroniser la config.

##### 3. Ajouter le middleware Clerk

```ts
// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

##### 4. Configurer les Providers (Next.js App Router)

**Créer un wrapper Client Component:**
```tsx
// components/ConvexClientProvider.tsx
'use client'

import { ReactNode } from 'react'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { useAuth } from '@clerk/nextjs'

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in your .env file')
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL)

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  )
}
```

**Utiliser dans le layout (ClerkProvider DOIT wrapper ConvexClientProvider):**
```tsx
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import ConvexClientProvider from '@/components/ConvexClientProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
```

##### 5. Composants d'état d'authentification

**IMPORTANT:** Utiliser les composants Convex, PAS ceux de Clerk:
- ✅ `<Authenticated>` (Convex) au lieu de ❌ `<SignedIn>` (Clerk)
- ✅ `<Unauthenticated>` (Convex) au lieu de ❌ `<SignedOut>` (Clerk)
- ✅ `<AuthLoading>` (Convex) au lieu de ❌ `<ClerkLoading>` (Clerk)
- ✅ `useConvexAuth()` (Convex) au lieu de ❌ `useAuth()` (Clerk) pour vérifier l'auth

**Pourquoi?** `useConvexAuth()` s'assure que le browser a récupéré le token d'auth ET que le backend Convex l'a validé.

**Exemple:**
```tsx
'use client'
import { Authenticated, Unauthenticated, AuthLoading } from 'convex/react'
import { SignInButton, UserButton } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'

export default function Home() {
  return (
    <>
      <Authenticated>
        <UserButton />
        <Content />
      </Authenticated>
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
      <AuthLoading>
        <p>Loading...</p>
      </AuthLoading>
    </>
  )
}

function Content() {
  const messages = useQuery(api.messages.getForCurrentUser)
  return <div>Authenticated content: {messages?.length}</div>
}
```

##### 6. Accéder à l'utilisateur dans les fonctions Convex

```ts
// convex/messages.ts
import { query } from './_generated/server'

export const getForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (identity === null) {
      throw new Error('Not authenticated')
    }
    
    return await ctx.db
      .query('messages')
      .filter((q) => q.eq(q.field('author'), identity.email))
      .collect()
  },
})
```

**Note:** Le composant appelant cette query DOIT être enfant de `<Authenticated>` de `convex/react`, sinon erreur au chargement.

##### 7. Accéder aux infos utilisateur côté client

Utiliser le hook `useUser()` de Clerk pour accéder à l'objet `User`:

```tsx
import { useUser } from '@clerk/nextjs'

export default function Badge() {
  const { user } = useUser()
  return <span>Logged in as {user?.fullName}</span>
}
```

#### Configuration Dev vs Prod

**Variables d'environnement:**
```env
# Development
CLERK_JWT_ISSUER_DOMAIN=https://verb-noun-00.clerk.accounts.dev
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Production
CLERK_JWT_ISSUER_DOMAIN=https://clerk.<your-domain>.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
```

**Déploiement:**
- Dev: `npx convex dev` (sync auto)
- Prod: `npx convex deploy`

Configurer les variables d'environnement dans le [Convex Dashboard](https://dashboard.convex.dev) pour chaque déploiement.

#### Debugging

Si `useConvexAuth()` retourne `isAuthenticated: false` après login Clerk réussi:
1. Vérifier que `auth.config.ts` est correctement configuré
2. Exécuter `npx convex dev` ou `npx convex deploy` après modification
3. Vérifier que le JWT template s'appelle bien `convex`
4. Consulter https://docs.convex.dev/auth/debug

### Stripe (Payments)

- **Documentation**: https://stripe.com/docs
- **Checkout**: https://stripe.com/docs/checkout
- **Webhooks**: https://stripe.com/docs/webhooks

**Points critiques à vérifier:**
- Vérification signature webhook obligatoire
- Idempotency pour éviter doublons
- Mode test vs production

### ByteRover 3.0 (Context Management)

- **Documentation**: https://docs.byterover.dev
- **Curate Context**: https://docs.byterover.dev/common-workflows/curate-context

**Points critiques à vérifier:**
- ByteRover 3.0 utilise une architecture CLI-first (plus MCP-based comme 2.0)
- Toujours s'assurer que ByteRover 2.0 MCP est complètement désinstallé pour éviter les conflits
- Utiliser le CLI ByteRover via les coding agents (Cursor, Claude, etc.)

#### Curation de Contexte

ByteRover permet de curer du contexte dans un "context tree" pour référence future.

**Deux modes de curation:**

1. **Mode Interactif** (contrôle manuel):
   - Naviguer manuellement dans le context tree
   - Sélectionner le domaine et topic
   - Ajouter le contenu

2. **Mode Autonome** (recommandé - intelligent):
   - Détection automatique des domaines
   - Recherche de duplications
   - Organisation hiérarchique automatique
   - Prévention des doublons via traitement intelligent

**Workflow recommandé avec coding agent:**

```bash
# Dans le chat de votre coding agent (Cursor, Claude, etc.)
> curate the following context about [sujet]
> [Votre contenu ici]
```

**Personnalisation de l'intention:**

```bash
# Diviser en petits morceaux
> curate the following context, break it into small focused pieces
> [Contenu]

# Garder ensemble
> curate the following context, keep it together as one topic
> [Contenu]

# Résumer avant stockage
> curate the following context, summarize it before adding
> [Contenu]
```

**Référencer des fichiers:**

```bash
# Syntaxe @ ou --files (max 5 fichiers)
> curate "API documentation" @src/api.ts @README.md
> curate --files src/components/Button.tsx src/styles/button.css
```

**Comment fonctionne le mode autonome:**

1. **Détection de domaine**: Analyse sémantique (pas keyword matching)
2. **Recherche de connaissance existante**: Évite les duplications
3. **Décision créer/mettre à jour**: Nouveau topic ou update existant
4. **Organisation hiérarchique**: domain → topic → (optional) subtopic
5. **Ajout de relations**: Crée des liens `@domain/topic` pour navigation

**Mise à jour de contexte existant:**

```bash
# ByteRover détecte automatiquement le contexte existant et le met à jour
> update the context tree so that [modification]
```

**Exemple complet:**

```bash
# Votre coding agent exécutera automatiquement:
brv curate "Task: Add health check endpoint
Steps:
1. Create Express server - src/server.ts
2. Create route - src/routes/health.ts
3. Add types - src/types/health.ts
4. Create tests - tests/health.test.ts
Success Criteria:
- GET /health returns 200
- Response includes status, timestamp, uptime"
```

**Avantages:**
- Contexte organisé et facilement récupérable
- Évite les duplications
- Navigation via relations entre topics
- Adapté au workflow de l'équipe

#### Structure du Context Tree Local

Le context tree est stocké dans `.brv/context-tree/` et organise la connaissance en hiérarchie à 3 niveaux.

**1. Domaines (top-level):**

Domaines par défaut qui groupent la connaissance:
- `code_style/` - Standards de code, patterns, conventions
- `testing/` - Stratégies et patterns de test
- `structure/` - Architecture et organisation du projet
- `design/` - Patterns UI/UX et design visuel
- `compliance/` - Sécurité, légal, exigences réglementaires
- `bug_fixes/` - Solutions aux problèmes connus

**2. Topics (sujets spécifiques):**

```
.brv/context-tree/
├── code_style/
│   ├── error-handling/
│   ├── naming-conventions/
│   └── api-design/
├── testing/
│   ├── integration-tests/
│   └── unit-tests/
└── structure/
    ├── api-endpoints/
    └── database-schema/
```

**3. Subtopics (optionnel - max 1 niveau):**

```
.brv/context-tree/
└── testing/
    └── integration-tests/
        ├── context.md          # Vue d'ensemble
        └── api-tests/          # Subtopic
            └── context.md      # Spécifique aux tests API
```

**4. Fichiers Context:**

Chaque topic/subtopic contient un `context.md` avec:
- **Contenu**: Connaissance en markdown (explications, exemples de code)
- **Relations**: Liens vers topics reliés (section `## Relations` optionnelle)

**Exemple de context.md:**

```markdown
Always use custom error classes for better error handling in the Express API:

\`\`\`typescript
// Custom error class pattern
class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}
\`\`\`

Use try-catch blocks at route level and pass errors to middleware.

## Relations
@code_style/naming-conventions
@testing/integration-tests/api-tests
```

**Relations: Le Knowledge Graph**

Les relations créent des connexions explicites entre topics via la notation `@domain/topic/subtopic`.

**Pourquoi les relations sont importantes:**
- Navigation graph-like entre connaissances reliées
- Liens explicites et intentionnels (pas basés sur similarité)
- Aide à trouver du contexte complet en suivant les connexions
- Prévient les silos de connaissance

**Exemple de relations:**

```markdown
## Relations
@code_style/error-handling
@testing/integration-tests
@structure/api-endpoints/validation
```

Quand vous interrogez sur error handling, ByteRover suit intelligemment ces relations pour rassembler le contexte complet.

**Avantages de cette structure:**

- **Human-readable et git-friendly**:
  - Parcourir le context tree dans l'explorateur de fichiers
  - Éditer les `context.md` avec n'importe quel éditeur
  - Tracker les changements avec git
  - Review dans les pull requests

- **Organisation hiérarchique** (évite le "context soup"):
  - Connaissance catégorisée par domaine et topic
  - Facile à trouver ce dont vous avez besoin
  - Structure claire vs stockage plat

- **Relations explicites** (navigation précise):
  - ByteRover suit les connexions entre topics
  - Plus fiable que la recherche par similarité
  - Knowledge graph intentionnel vs clustering automatique

## Workflow

1. **Avant d'implémenter**: Consulter la doc officielle du service concerné
2. **En cas de doute**: Utiliser les outils web (firecrawl, fetch) pour récupérer la doc à jour
3. **Après implémentation**: Stocker les patterns appris dans ByteRover pour référence future

## Patterns Dépréciés à Éviter

| Service | ❌ Déprécié | ✅ Actuel |
|---------|------------|-----------|
| Clerk | `authMiddleware()` | `clerkMiddleware()` |
| Clerk | `_app.tsx` (Pages) | `layout.tsx` (App Router) |
| Clerk | `withAuth` | `auth()` async |
| Convex | - | Toujours utiliser dernière version |

## Commande de Vérification

Avant chaque tâche liée à Clerk/Convex/Stripe:
```
1. Consulter ByteRover pour patterns existants
2. Si incertain, fetch la doc officielle
3. Implémenter selon les best practices actuelles
4. Stocker les nouveaux patterns dans ByteRover
```
