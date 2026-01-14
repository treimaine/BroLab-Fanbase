---
inclusion: always
---

# ByteRover 3.0 - CLI-First Context Management

**IMPORTANT:** ByteRover 3.0 utilise une architecture CLI-first (plus MCP-based comme 2.0).

## Workflow avec Coding Agents

ByteRover 3.0 est conçu pour être utilisé via les coding agents (Cursor, Claude, Kiro, etc.). Les agents exécutent automatiquement les commandes CLI ByteRover.

## Commandes Principales

### 1. `brv curate` - Stocker du Contexte

**Utiliser quand:**
- Apprentissage de nouveaux patterns, APIs ou décisions architecturales
- Solutions d'erreurs ou techniques de debugging découvertes
- Patterns de code réutilisables ou fonctions utilitaires
- Complétion d'une tâche ou implémentation de plan significatif

**Syntaxe:**
```bash
# Mode autonome (recommandé)
brv curate "Votre contexte ici"

# Avec fichiers (max 5)
brv curate "Description" @src/file.ts @README.md

# Personnalisation
brv curate "Contexte" --break-into-pieces
brv curate "Contexte" --keep-together
brv curate "Contexte" --summarize
```

**Exemple via coding agent:**
```
> curate the following context about error handling patterns
> [Votre contexte détaillé]
```

### 2. `brv query` - Récupérer du Contexte

**Utiliser quand:**
- Démarrage d'une nouvelle tâche ou implémentation
- Avant de prendre des décisions architecturales
- Debugging pour vérifier les solutions précédentes
- Travail sur des parties non familières du codebase

**Syntaxe:**
```bash
# Query simple
brv query "Comment gérer les erreurs dans l'API?"

# Query avec domaine spécifique
brv query "Testing patterns" --domain testing
```

**Exemple via coding agent:**
```
> query the context tree about authentication flow
```

## Structure du Context Tree

Le contexte est organisé dans `.brv/context-tree/` avec cette hiérarchie:

```
.brv/context-tree/
├── code_style/          # Standards de code, patterns
├── testing/             # Stratégies de test
├── structure/           # Architecture du projet
├── design/              # Patterns UI/UX
├── compliance/          # Sécurité, légal
└── bug_fixes/           # Solutions aux problèmes
```

Chaque topic contient un `context.md` avec:
- Le contenu (markdown, code examples)
- Les relations (`## Relations` avec notation `@domain/topic`)

## Best Practices

1. **Curer après chaque apprentissage significatif**
   - Nouveau pattern découvert → `brv curate`
   - Bug résolu → `brv curate` dans `bug_fixes/`
   - Décision architecturale → `brv curate` dans `structure/`

2. **Query avant d'implémenter**
   - Nouvelle feature → `brv query` pour patterns existants
   - Debugging → `brv query` pour solutions connues

3. **Utiliser les relations**
   - Ajouter `## Relations` dans les `context.md`
   - Créer un knowledge graph navigable

4. **Laisser le coding agent gérer**
   - Mentionner ByteRover dans vos prompts
   - L'agent exécutera automatiquement les commandes appropriées

## Migration depuis ByteRover 2.0

Si vous aviez ByteRover 2.0 MCP:
1. Désinstaller complètement le MCP server de vos configs
2. Installer ByteRover CLI: `npm install -g byterover-cli`
3. Le context tree reste compatible (`.brv/context-tree/`)

## Installation

```bash
# Global (recommandé)
npm install -g byterover-cli

# Via npx (sans installation)
npx byterover-cli@latest curate "contexte"
npx byterover-cli@latest query "question"
```

**Note Windows:** Nécessite Visual Studio Build Tools avec "Desktop development with C++" workload.
