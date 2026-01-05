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

## Fonctionnalités Principales

### 1. Landing Page Marketing
- Hero section avec tagline et CTA "Join Beta"
- Formulaire email pour waitlist
- Feature grid: Direct to Fan / Global Commerce / Own Your Data
- Navigation minimale avec Sign In / Join Beta

### 2. Authentification (Clerk)
- Sign-in / Sign-up sécurisé
- Sélection de rôle à l'onboarding (Artist ou Fan)
- Protection des routes par rôle

### 3. Hub Public Artiste (`/[artistSlug]`)
- Cover image + avatar + bio
- Bouton Follow (toggle)
- Liens sociaux
- Tabs: Latest Drops / Tour Dates
- URL personnalisée: `fan.brolab/[slug]`

### 4. Dashboard Artiste (`/dashboard`)
- **Overview**: Stats (Followers, Revenue, Events), Setup Checklist
- **Profile**: Édition profil, slug unique, liens sociaux
- **Links**: Gestion des liens externes
- **Events**: Gestion des événements/concerts
- **Products**: Upload et vente de musique/vidéos
- **Billing**: Balance, payouts, transactions

### 5. Dashboard Fan (`/me/[username]`)
- **Feed**: Posts des artistes suivis avec CTAs contextuels
- **Purchases**: Historique d'achats avec téléchargements
- **Billing**: Méthodes de paiement, historique

### 6. Commerce Digital
- Achat de produits via Stripe Checkout
- Téléchargements sécurisés (ownership-gated)
- Webhooks idempotents pour création de commandes

## Navigation Mobile-First

- **Mobile**: TopBar + BottomNav + Sheet drawer
- **Desktop**: Sidebar persistante
- Navigation différenciée par rôle (Fan vs Artist)

## Thème

- Support light/dark mode
- Esthétique SuperDesign: accent lavande, bordures douces, spacing généreux
- Polices: Playfair Display (titres) + Inter (corps)
