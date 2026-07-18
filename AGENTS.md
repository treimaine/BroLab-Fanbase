# AGENTS.md — BroLab Fanbase

## Mission

BroLab Fanbase aide les artistes indépendants à construire une relation directe avec leurs fans, sans dépendre des algorithmes ni multiplier les outils. Le produit réunit dans un seul hub public la présence de l'artiste, ses liens, ses événements et la vente de contenus numériques.

Promesse centrale : **« Your career isn't an algorithm. »**

Chaque changement doit renforcer au moins un de ces résultats :

1. permettre à un artiste de lancer et partager rapidement un hub crédible ;
2. transformer une visite en relation directe (follow, inscription ou achat) ;
3. aider l'artiste à vendre et recevoir son argent avec confiance ;
4. donner au fan un accès simple, durable et sécurisé à ses achats ;
5. augmenter la rétention et la conversion vers Premium sans dégrader l'offre gratuite.

## Utilisateurs et besoins

### Artiste indépendant — utilisateur et client principal

- Centraliser son identité, ses sorties, ses liens et ses dates dans une page partageable.
- Posséder la relation avec son audience et garder le contrôle de ses données et contenus.
- Vendre musique et vidéos directement, fixer ses prix et suivre revenus/payouts.
- Réduire la dépendance aux plateformes et la complexité opérationnelle.
- Obtenir une expérience professionnelle sans expertise technique.

### Fan — moteur de valeur du réseau

- Découvrir et suivre des artistes sans bruit algorithmique.
- Acheter directement pour mieux soutenir les artistes.
- Accéder immédiatement et durablement aux contenus achetés.
- Retrouver flux, achats et moyens de paiement dans une expérience fiable.

Lors d'un arbitrage, protéger d'abord la confiance et le revenu de l'artiste, puis minimiser la friction côté fan.

## Modèle économique

- Les artistes conservent 100 % du revenu de leurs ventes, hors frais de traitement Stripe ; BroLab ne prélève pas de commission de plateforme sur ces ventes.
- Les paiements des fans sont acheminés vers les artistes via Stripe Connect.
- Le revenu de BroLab provient des abonnements artistes gérés par Clerk Billing.
- Offre Free : 5 produits, 5 événements, 5 liens personnalisés, audio uniquement, fichiers de 50 MB maximum.
- Offre Premium : 19,99 USD/mois, volumes illimités, vidéo autorisée, fichiers de 500 MB maximum et support prioritaire.
- En cas de downgrade, préserver le contenu existant. Bloquer seulement les nouvelles créations tant que l'usage dépasse la limite Free.

Ne pas modifier prix, limites, commission ou promesse de propriété des données sans demande business explicite. Toute évolution de ces éléments doit être appliquée de manière cohérente au marketing, au produit, aux validations serveur et à la documentation.

## Priorités produit

Dans l'ordre :

1. **Confiance transactionnelle** — auth, autorisations, checkout, webhooks, commandes, téléchargements et payouts doivent être exacts, idempotents et observables.
2. **Activation artiste** — inscription, choix du rôle, création du profil, connexion Stripe, premier contenu et partage du hub.
3. **Conversion fan** — hub rapide et convaincant, follow clair, achat sans ambiguïté, accès immédiat au contenu.
4. **Rétention** — feed utile, gestion des contenus/événements, historique d'achats et visibilité sur les revenus.
5. **Monétisation SaaS** — limites compréhensibles, upgrade contextuel et soft-lock respectueux.
6. **Acquisition** — landing pages, preuve produit, découverte d'artistes et inscription à la waitlist.

Les métriques utiles sont : activation du hub, temps jusqu'au premier contenu publié, connexion Stripe réussie, conversion visite→follow, conversion visite→achat, volume de ventes, réachat fan, rétention artiste et conversion Free→Premium. Ne pas inventer de chiffres, témoignages ou volumes d'adoption.

## Source de vérité

Le dépôt contient des documents historiques. En cas de contradiction, suivre cet ordre :

1. comportement réellement implémenté et invariants de sécurité ;
2. `package.json`, `convex/schema.ts` et constantes/validations partagées ;
3. pages produit actives et `README.md` ;
4. PRD et documents de `docs/` ;
5. mock data, anciens audits et fichiers de backup.

Ne pas recopier silencieusement une divergence. La signaler et, si la tâche l'autorise, aligner toutes les surfaces concernées. Exemples connus : certains documents mentionnent encore Next.js 14 alors que `package.json` utilise Next.js 15 ; une ancienne FAQ mentionne un plan à 9 USD alors que le pricing et les limites actifs indiquent 19,99 USD.

## Architecture à préserver

- Next.js App Router, React et TypeScript strict pour l'application web.
- Convex pour la base, les requêtes/mutations, le stockage et les read models.
- Clerk pour l'authentification, les rôles et la souscription artiste.
- Stripe Checkout/Connect pour les achats et payouts ; les webhooks confirment l'état serveur.
- Tailwind CSS et composants shadcn/Radix pour l'interface.
- Zod + React Hook Form pour les formulaires ; Zustand seulement pour l'état client réellement partagé, comme le player.
- PostHog pour les événements produit utiles, sans données sensibles.

Routes principales :

- public/marketing : `/`, `/features`, `/pricing`, `/explore`, `/[artistSlug]` ;
- auth/onboarding : `/sign-in`, `/sign-up`, `/onboarding` ;
- artiste protégé : `/dashboard/*` ;
- fan protégé : `/me/*` ;
- intégrations serveur : `src/app/api/*` ;
- backend : `convex/*`.

Préférer les composants et patterns existants. Garder les règles métier dans le backend ou dans des modules partagés, jamais uniquement dans l'UI.

## Invariants non négociables

### Sécurité et données

- Vérifier l'identité et le rôle côté serveur pour toute donnée ou mutation protégée.
- Vérifier l'ownership artiste avant toute modification de profil, lien, événement, produit ou donnée financière.
- Vérifier l'entitlement d'achat avant de générer un téléchargement.
- Ne jamais exposer secrets, identifiants Stripe sensibles, URLs de stockage permanentes ou données privées dans le client ou les logs.
- Valider type, taille et propriété des fichiers côté serveur ; les contrôles client ne sont qu'une aide UX.
- Conserver des slugs uniques et refuser ceux de `src/lib/constants.ts`.

### Paiements et abonnements

- Le webhook signé est la confirmation de paiement ; ne jamais accorder un achat sur le seul retour navigateur de Stripe.
- Préserver l'idempotence via les événements traités et éviter toute double commande, double entitlement ou double envoi.
- Recalculer prix, produit, artiste bénéficiaire et droits depuis les données serveur ; ne pas faire confiance aux montants du client.
- Appliquer les limites Free/Premium dans les mutations Convex, puis refléter le résultat dans l'UI.
- Clerk Billing reste la source de vérité de l'abonnement ; Stripe Connect reste la source de vérité des capacités de paiement/payout.
- Les opérations monétaires utilisent les unités attendues par chaque domaine. Vérifier explicitement dollars vs cents avant tout changement.

### Expérience

- Mobile-first, sans scroll horizontal, avec cibles tactiles d'au moins 44 px.
- WCAG 2.1 AA : clavier, focus visible, labels, texte alternatif, contraste et reduced motion.
- Conserver le player global lors des navigations.
- Toujours afficher des états chargement, vide, succès et erreur utiles ; ne pas laisser une action financière dans un état ambigu.
- Ne pas utiliser de dark patterns pour l'upgrade ou l'annulation.
- La suppression ou le downgrade ne doit jamais entraîner une perte implicite de contenu.

## Design et contenu

- Réutiliser les tokens et composants existants avant d'en créer de nouveaux.
- Pour une page, vérifier d'abord une éventuelle spécification sous `design-system/pages/`, puis `design-system/brolab-fanbase/MASTER.md`, puis les patterns déjà présents dans la zone concernée.
- Utiliser Lucide pour les icônes et éviter les emoji comme icônes d'interface.
- Préserver une esthétique créative, premium et lisible, adaptée à la musique, sans sacrifier la clarté des actions.
- Le ton de marque est direct, encourageant et anti-gatekeeping. Parler d'autonomie, de lien direct et de soutien aux artistes ; éviter les promesses absolues non démontrées.
- Tout contenu marketing doit être soit utile à une demande existante, soit assez distinctif pour être partagé, et mener naturellement vers une action produit pertinente.

## Méthode de travail

Avant de modifier :

1. lire les fichiers proches, leurs types et leurs appels Convex/API ;
2. identifier le parcours utilisateur et l'objectif business touchés ;
3. rechercher les règles dupliquées dans le frontend, Convex, Clerk, Stripe et la documentation ;
4. préserver les changements locaux non liés ; ne pas réécrire un fichier entier sans nécessité.

Pendant l'implémentation :

- faire le changement le plus petit qui résout complètement le problème ;
- préférer des types explicites et les abstractions existantes ;
- ne pas ajouter de dépendance sans bénéfice clair ;
- ne pas remplacer une intégration réelle par du mock dans un parcours de production ;
- ajouter ou mettre à jour l'analytics uniquement pour des événements décisionnels, avec des noms stables et sans PII ;
- mettre à jour la documentation quand un contrat, une limite ou un parcours change.

## Validation et définition de terminé

Choisir les vérifications proportionnées au risque, au minimum sur les fichiers touchés :

```bash
npx tsc --noEmit
npm run build
```

`npm run lint` existe dans le projet mais peut nécessiter une adaptation avec la version actuelle de Next.js ; ne pas déclarer la validation réussie si la commande échoue ou n'est pas exécutée.

Pour les changements concernés, vérifier aussi :

- parcours artiste et fan avec le bon rôle, plus accès refusé avec le mauvais rôle ;
- responsive à 375, 768, 1024 et 1440 px ;
- navigation clavier, focus, contraste et reduced motion ;
- états loading/empty/error/success ;
- limites Free et Premium, y compris downgrade soft-lock ;
- paiement réussi, annulé, échoué et webhook rejoué ;
- téléchargement autorisé et refusé ;
- absence de secrets et de PII dans le navigateur et les logs.

Un travail est terminé lorsque le parcours utilisateur fonctionne de bout en bout, les invariants serveur sont respectés, les erreurs sont compréhensibles, les vérifications pertinentes passent et aucune affirmation business contradictoire n'a été introduite.

