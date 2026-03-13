# 🚨 Guide de Résolution - Erreurs de Déploiement BroLab Fanbase

## Problèmes Identifiés

D'après les captures d'écran, tu as des erreurs de déploiement sur plusieurs branches Dependabot :
- `dependabot/npm_and_yarn/eslint-config-next-16.1.6`
- `dependabot/npm_and_yarn/eslint-10.0.2` 
- `dependabot/npm_and_yarn/tailwindcss-4.2.1`
- `dependabot/npm_and_yarn/production-dependencies-d8f7d8de8f`

## 🔧 Solutions Immédiates

### 1. Fermer les PRs Dependabot Problématiques

```bash
# Via GitHub CLI (si installé)
gh pr close [numéro-pr] --comment "Incompatible with Next.js 15 + React 19"

# Ou manuellement sur GitHub :
# - Aller sur chaque PR Dependabot
# - Cliquer "Close pull request"
# - Ajouter un commentaire expliquant l'incompatibilité
```

### 2. Mettre à Jour les Dépendances Localement

```bash
# Installer les versions compatibles
npm install

# Vérifier que le build fonctionne
npm run build

# Si erreurs, corriger puis recommencer
```

### 3. Configurer les Variables d'Environnement sur Vercel

Va sur [Vercel Dashboard](https://vercel.com/dashboard) → Ton projet → Settings → Environment Variables

**Variables CRITIQUES à ajouter :**

```env
# Clerk (Production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_JWT_ISSUER_DOMAIN=https://clerk.app.brolabentertainment.com
CLERK_WEBHOOK_SECRET=whsec_...

# Convex (Production) 
NEXT_PUBLIC_CONVEX_URL=https://your-prod-deployment.convex.cloud
CONVEX_DEPLOYMENT=prod:your-deployment

# Stripe (Production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
NEXT_PUBLIC_URL=https://app.brolabentertainment.com
```

### 4. Redéployer depuis la Branche Main

```bash
# Pousser les corrections sur main
git add .
git commit -m "fix: resolve Dependabot conflicts and add production config"
git push origin main

# Vercel redéploiera automatiquement
```

## 🛡️ Prévention Future

### Configuration Dependabot

Le fichier `.github/dependabot.yml` a été créé pour :
- Réduire la fréquence des updates (mensuel au lieu d'hebdomadaire)
- Grouper les updates par écosystème
- Ignorer les versions problématiques (ESLint v9, Tailwind v4)
- Limiter à 5 PRs ouvertes simultanément

### Overrides dans package.json

```json
{
  "overrides": {
    "eslint": "^8.57.0",
    "tailwindcss": "^3.4.1", 
    "@types/react": "19.2.14",
    "@types/react-dom": "19.2.3"
  }
}
```

Ces overrides forcent npm à utiliser des versions compatibles même si Dependabot suggère des versions plus récentes.

## 🔍 Diagnostic Automatique

Utilise le script de diagnostic :

```bash
# Vérifier les problèmes
node scripts/fix-production-issues.js

# Vérifier les variables d'environnement
node scripts/check-vercel-env.js
```

## 📋 Checklist de Déploiement

- [ ] Fermer toutes les PRs Dependabot problématiques
- [ ] Variables d'environnement configurées sur Vercel (production)
- [ ] Build local réussi (`npm run build`)
- [ ] Tests passent (`npm run lint`)
- [ ] Commit et push sur main
- [ ] Vérifier le déploiement sur Vercel

## 🆘 Si Ça Ne Marche Toujours Pas

1. **Vérifier les logs Vercel :**
   - Aller sur Vercel Dashboard → Deployments
   - Cliquer sur le déploiement échoué
   - Regarder les logs détaillés

2. **Vérifier la configuration Clerk :**
   - Dashboard Clerk → JWT Templates → Vérifier le template "convex"
   - Domains → Vérifier le domaine custom

3. **Vérifier Convex :**
   - Dashboard Convex → Settings → Environment Variables
   - Vérifier que `CLERK_JWT_ISSUER_DOMAIN` correspond

4. **Rollback temporaire :**
   ```bash
   # Si urgent, revenir à une version qui marchait
   git revert [commit-hash-problématique]
   git push origin main
   ```

## 🔗 Ressources Utiles

- [Next.js 15 Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [Clerk Production Deployment](https://clerk.com/docs/deployments/overview)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Convex Production Setup](https://docs.convex.dev/production/hosting)

---

**Note :** Ces erreurs sont typiques lors de la migration vers Next.js 15 + React 19. Les corrections appliquées devraient résoudre les problèmes de compatibilité.