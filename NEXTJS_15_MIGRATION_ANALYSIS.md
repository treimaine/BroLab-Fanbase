# Analyse de Migration Next.js 14.2.35 → Next.js 15

**Date:** 11 février 2026  
**Projet:** BroLab Fanbase  
**Version actuelle:** Next.js 14.2.35  
**Version cible:** Next.js 15 (stable)

---

## 📊 Résumé Exécutif

### Verdict: ⚠️ MIGRATION POSSIBLE MAIS NÉCESSITE DES MODIFICATIONS

**Niveau de complexité:** Moyen  
**Temps estimé:** 4-6 heures  
**Risque:** Moyen (breaking changes dans les APIs)

---

## 🔍 Analyse des Impacts

### 1. ✅ Compatibilité React 19 (CRITIQUE)

**Impact:** MAJEUR - Dépendance obligatoire

**État actuel:**
```json
"react": "^18",
"react-dom": "^18"
```

**Requis pour Next.js 15:**
```json
"react": "^19",
"react-dom": "^19"
```

**Actions requises:**
- ✅ Mettre à jour React 18 → 19
- ✅ Mettre à jour `@types/react` et `@types/react-dom`
- ⚠️ Vérifier compatibilité de toutes les dépendances avec React 19

**Dépendances à vérifier:**
- `@clerk/nextjs` (^6.36.5) - Compatible React 19 ✅
- `convex` (^1.31.2) - Compatible React 19 ✅
- `@radix-ui/*` - Compatible React 19 ✅
- `framer-motion` (^12.23.26) - Compatible React 19 ✅
- `@stripe/react-stripe-js` (^5.4.1) - Compatible React 19 ✅

---

### 2. 🔴 Async Request APIs (BREAKING CHANGE)

**Impact:** MAJEUR - Modifications de code obligatoires

#### 2.1 `headers()` - 2 fichiers affectés

**Fichiers concernés:**
- `src/app/api/stripe/webhook/route.ts` (ligne 19)
- `src/app/api/clerk/webhook/route.ts` (ligne 5)

**Code actuel:**
```typescript
import { headers } from "next/headers";

const signature = headers().get("stripe-signature");
```

**Code requis (Next.js 15):**
```typescript
import { headers } from "next/headers";

const headersList = await headers();
const signature = headersList.get("stripe-signature");
```

**Complexité:** Faible - Changement mécanique  
**Risque:** Faible - Pattern bien documenté

---

#### 2.2 `params` - 2 fichiers affectés

**Fichiers concernés:**
- `src/app/(public)/[artistSlug]/page.tsx`
- `src/app/(fan)/me/[username]/page.tsx`

**⚠️ ATTENTION:** Ces deux pages sont des **Client Components** (`"use client"`)

**Code actuel:**
```typescript
interface PublicHubPageProps {
  readonly params: {
    readonly artistSlug: string;
  };
}

export default function PublicHubPage({ params }: PublicHubPageProps) {
  const { artistSlug } = params;
  // ...
}
```

**Code requis (Next.js 15 - Client Component):**
```typescript
import { use } from "react";

interface PublicHubPageProps {
  readonly params: Promise<{
    readonly artistSlug: string;
  }>;
}

export default function PublicHubPage(props: PublicHubPageProps) {
  const params = use(props.params);
  const { artistSlug } = params;
  // ...
}
```

**Complexité:** Moyenne - Nécessite import de `use()` de React  
**Risque:** Moyen - Pattern nouveau, nécessite tests

---

### 3. ✅ Configuration `dynamic` (PAS D'IMPACT)

**Fichiers utilisant `export const dynamic`:**
- `src/app/api/billing/manage/route.ts`
- `src/app/api/billing/checkout/route.ts`

**Code actuel:**
```typescript
export const dynamic = "force-dynamic";
```

**Statut:** ✅ Aucun changement requis - Syntaxe compatible Next.js 15

---

### 4. ✅ Fetch Caching (PAS D'IMPACT IMMÉDIAT)

**Changement:** `fetch()` n'est plus caché par défaut dans Next.js 15

**Analyse du code:**
- ❌ Aucun appel `fetch()` trouvé dans le codebase
- ✅ Utilisation exclusive de Convex pour les données
- ✅ Pas de migration nécessaire

**Note:** Si vous ajoutez des appels `fetch()` à l'avenir, utilisez:
```typescript
fetch('https://...', { cache: 'force-cache' }) // Pour cacher
```

---

### 5. ✅ Route Handlers GET (PAS D'IMPACT)

**Changement:** Les méthodes GET dans Route Handlers ne sont plus cachées par défaut

**Analyse:**
- ✅ Tous les Route Handlers utilisent déjà `export const dynamic = "force-dynamic"`
- ✅ Pas de changement requis

---

### 6. ✅ Client-side Router Cache (AMÉLIORATION)

**Changement:** Les segments de page ne sont plus réutilisés du cache client lors de la navigation

**Impact:** Positif - Données plus fraîches  
**Action:** Aucune - Comportement par défaut acceptable

**Option (si besoin de caching):**
```typescript
// next.config.mjs
export default {
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};
```

---

### 7. ✅ Configuration Next.js (PAS D'IMPACT)

**Fichier:** `next.config.mjs`

**Configuration actuelle:**
```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.clerk.com" },
    ],
  },
};
```

**Statut:** ✅ Compatible Next.js 15 - Aucun changement requis

---

### 8. ✅ Middleware (PAS D'IMPACT)

**Fichier:** `src/middleware.ts`

**Analyse:**
- ✅ Utilise déjà `clerkMiddleware()` (pas `authMiddleware()` déprécié)
- ✅ Pattern async/await déjà en place
- ✅ Compatible Next.js 15

---

### 9. ✅ TypeScript Configuration (PAS D'IMPACT)

**Fichier:** `tsconfig.json`

**Configuration actuelle:**
```json
{
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    // ...
  }
}
```

**Statut:** ✅ Compatible Next.js 15 - Aucun changement requis

---

## 📋 Plan de Migration Détaillé

### Phase 1: Préparation (30 min)

1. **Backup du projet**
   ```bash
   git checkout -b migration/nextjs-15
   git add .
   git commit -m "chore: backup before Next.js 15 migration"
   ```

2. **Vérifier les dépendances**
   ```bash
   npm outdated
   ```

3. **Lire les release notes**
   - Next.js 15: https://nextjs.org/blog/next-15
   - React 19: https://react.dev/blog/2024/04/25/react-19

---

### Phase 2: Mise à Jour des Dépendances (1h)

1. **Mettre à jour Next.js et React**
   ```bash
   npm install next@latest react@latest react-dom@latest eslint-config-next@latest
   npm install --save-dev @types/react@latest @types/react-dom@latest
   ```

2. **Vérifier les peer dependencies**
   ```bash
   npm list react react-dom
   ```

3. **Tester le build**
   ```bash
   npm run build
   ```

---

### Phase 3: Modifications du Code (2-3h)

#### 3.1 Modifier les Route Handlers (30 min)

**Fichier 1:** `src/app/api/stripe/webhook/route.ts`

**Changements:**
```typescript
// AVANT (ligne 19-20)
const signature = headers().get("stripe-signature");

// APRÈS
const headersList = await headers();
const signature = headersList.get("stripe-signature");
```

**Fichier 2:** `src/app/api/clerk/webhook/route.ts`

**Changements:**
```typescript
// AVANT (ligne 10-14)
async function verifyWebhook(req: Request): Promise<WebhookEvent | Response> {
  const headerPayload = headers();
  const svixId = headerPayload.get("svix-id");
  // ...
}

// APRÈS
async function verifyWebhook(req: Request): Promise<WebhookEvent | Response> {
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  // ...
}
```

---

#### 3.2 Modifier les Pages avec Params (1-1.5h)

**Fichier 1:** `src/app/(public)/[artistSlug]/page.tsx`

**Changements:**
```typescript
// AVANT
"use client";
import { /* ... */ } from "...";

interface PublicHubPageProps {
  readonly params: {
    readonly artistSlug: string;
  };
}

export default function PublicHubPage({ params }: PublicHubPageProps) {
  const { artistSlug } = params;
  const artist = useQuery(api.artists.getBySlug, { slug: artistSlug });
  // ...
}

// APRÈS
"use client";
import { use } from "react"; // ← NOUVEAU
import { /* ... */ } from "...";

interface PublicHubPageProps {
  readonly params: Promise<{ // ← CHANGÉ
    readonly artistSlug: string;
  }>;
}

export default function PublicHubPage(props: PublicHubPageProps) { // ← CHANGÉ
  const params = use(props.params); // ← NOUVEAU
  const { artistSlug } = params;
  const artist = useQuery(api.artists.getBySlug, { slug: artistSlug });
  // ...
}
```

**Fichier 2:** `src/app/(fan)/me/[username]/page.tsx`

**Changements:** Similaires (même pattern)

---

### Phase 4: Tests et Validation (1-2h)

1. **Tests de build**
   ```bash
   npm run build
   ```

2. **Tests de développement**
   ```bash
   npm run dev
   ```

3. **Tests manuels critiques:**
   - ✅ Hub public artiste (`/[artistSlug]`)
   - ✅ Feed fan (`/me/[username]`)
   - ✅ Webhook Stripe (`POST /api/stripe/webhook`)
   - ✅ Webhook Clerk (`POST /api/clerk/webhook`)
   - ✅ Checkout Stripe
   - ✅ Navigation entre pages
   - ✅ Authentification Clerk

4. **Tests TypeScript**
   ```bash
   npx tsc --noEmit
   ```

5. **Tests ESLint**
   ```bash
   npm run lint
   ```

---

### Phase 5: Déploiement (30 min)

1. **Commit des changements**
   ```bash
   git add .
   git commit -m "feat: migrate to Next.js 15 and React 19"
   ```

2. **Déployer sur Vercel (preview)**
   ```bash
   git push origin migration/nextjs-15
   ```

3. **Tester en production preview**
   - Vérifier tous les flows critiques
   - Tester les webhooks avec Stripe CLI

4. **Merge vers main**
   ```bash
   git checkout main
   git merge migration/nextjs-15
   git push origin main
   ```

---

## ⚠️ Risques et Mitigations

### Risque 1: Incompatibilité React 19

**Probabilité:** Faible  
**Impact:** Élevé

**Mitigation:**
- Toutes les dépendances majeures sont compatibles React 19
- Tester en environnement de dev avant production
- Rollback plan: `git revert` + redéploiement

---

### Risque 2: Erreurs dans les Client Components avec `use()`

**Probabilité:** Moyenne  
**Impact:** Moyen

**Mitigation:**
- Pattern `use()` est standard React 19
- Tests manuels approfondis des pages concernées
- Vérifier que `params` est bien unwrappé avant utilisation

---

### Risque 3: Webhooks cassés

**Probabilité:** Faible  
**Impact:** Critique

**Mitigation:**
- Tester avec Stripe CLI en local:
  ```bash
  stripe listen --forward-to localhost:3000/api/stripe/webhook
  stripe trigger checkout.session.completed
  ```
- Vérifier les logs Stripe Dashboard après déploiement
- Monitoring des erreurs webhook

---

### Risque 4: Performance dégradée

**Probabilité:** Très faible  
**Impact:** Moyen

**Mitigation:**
- Next.js 15 améliore généralement les performances
- Pas de fetch() à migrer (utilisation de Convex)
- Monitoring Vercel Analytics après déploiement

---

## 📊 Checklist de Migration

### Avant Migration
- [ ] Créer une branche `migration/nextjs-15`
- [ ] Backup de la base de données Convex (si nécessaire)
- [ ] Informer l'équipe de la migration
- [ ] Vérifier que tous les tests passent

### Pendant Migration
- [ ] Mettre à jour `package.json` (Next.js, React, types)
- [ ] Modifier `src/app/api/stripe/webhook/route.ts`
- [ ] Modifier `src/app/api/clerk/webhook/route.ts`
- [ ] Modifier `src/app/(public)/[artistSlug]/page.tsx`
- [ ] Modifier `src/app/(fan)/me/[username]/page.tsx`
- [ ] Exécuter `npm run build`
- [ ] Exécuter `npx tsc --noEmit`
- [ ] Exécuter `npm run lint`

### Tests Manuels
- [ ] Hub public artiste fonctionne
- [ ] Feed fan fonctionne
- [ ] Webhook Stripe fonctionne (Stripe CLI)
- [ ] Webhook Clerk fonctionne
- [ ] Checkout Stripe fonctionne
- [ ] Navigation entre pages fluide
- [ ] Authentification Clerk fonctionne
- [ ] Upload de fichiers fonctionne
- [ ] Player global fonctionne

### Après Migration
- [ ] Déployer sur Vercel preview
- [ ] Tester en production preview
- [ ] Vérifier les logs Vercel
- [ ] Vérifier les logs Stripe webhooks
- [ ] Merger vers `main`
- [ ] Déployer en production
- [ ] Monitoring 24h post-déploiement

---

## 🎯 Recommandations

### ✅ Recommandé de Migrer

**Raisons:**
1. Next.js 15 est stable et bien testé
2. React 19 apporte des améliorations de performance
3. Toutes les dépendances sont compatibles
4. Changements bien documentés et prévisibles
5. Codemod disponible pour automatiser certains changements

### ⏰ Timing Optimal

**Meilleur moment:**
- Après une release stable
- Pendant une période de faible trafic
- Avec au moins 2h de disponibilité pour tests

**À éviter:**
- Juste avant une démo importante
- Pendant un pic de trafic
- Sans backup récent

---

## 🔧 Commandes Utiles

### Utiliser le Codemod Officiel (Recommandé)

```bash
# Automatise une partie des changements
npx @next/codemod@canary upgrade latest
```

**Note:** Le codemod peut automatiser:
- Mise à jour de `package.json`
- Conversion de `params` en async
- Conversion de `headers()` en async

### Migration Manuelle

```bash
# 1. Mettre à jour les dépendances
npm install next@latest react@latest react-dom@latest eslint-config-next@latest
npm install --save-dev @types/react@latest @types/react-dom@latest

# 2. Vérifier les peer dependencies
npm list react react-dom

# 3. Build
npm run build

# 4. Tests
npx tsc --noEmit
npm run lint

# 5. Dev
npm run dev
```

---

## 📚 Ressources

- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19)
- [Next.js 15 Blog Post](https://nextjs.org/blog/next-15)
- [Clerk Next.js 15 Compatibility](https://clerk.com/docs/quickstarts/nextjs)
- [Convex Next.js 15 Support](https://docs.convex.dev/quickstart/nextjs)

---

## 🎬 Conclusion

**Verdict Final:** ✅ MIGRATION RECOMMANDÉE

**Résumé:**
- 4 fichiers à modifier (2 webhooks + 2 pages)
- Changements mécaniques et bien documentés
- Toutes les dépendances compatibles
- Risques maîtrisables avec tests appropriés
- Bénéfices: Performance, stabilité, support long terme

**Prochaine étape:** Exécuter le codemod ou appliquer les changements manuellement selon ce plan.

---

**Auteur:** Kiro AI  
**Date:** 11 février 2026  
**Version:** 1.0
