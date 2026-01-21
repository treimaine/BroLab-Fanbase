---
inclusion: always
priority: critical
---

# Agent Framework Rules - Antigravity Kit v5.0

**MANDATORY:** Ce framework DOIT être consulté et suivi pour TOUTE tâche de développement.

---

## 📋 Vue d'Ensemble

Le dossier `.agent/` contient **Antigravity Kit v5.0**, un système modulaire composant de:
- **19 Agents Spécialisés** - Personas IA par domaine
- **36 Skills** - Modules de connaissance spécialisés
- **11 Workflows** - Procédures slash commands
- **Scripts de Validation** - Vérification automatique

---

## 🔴 RÈGLES CRITIQUES (NON-NÉGOCIABLES)

### 1. Progressive Disclosure (Lecture Sélective)

**❌ NE JAMAIS lire tous les fichiers du dossier `.agent/`**
**✅ Lire UNIQUEMENT les fichiers pertinents à la tâche**

**Workflow obligatoire:**
```
1. Identifier le type de tâche
2. Consulter ARCHITECTURE.md pour trouver les ressources pertinentes
3. Lire UNIQUEMENT les fichiers nécessaires
4. Exécuter la tâche
```

**Exemple:**
```
Tâche: "Créer un composant React"
→ Lire: .agent/skills/react-patterns/SKILL.md
→ NE PAS lire: game-development, mobile-design, etc.
```

### 2. Skill Loading Protocol

**Les Skills sont chargés à la demande, PAS automatiquement.**

**Quand charger un Skill:**
- La description du Skill correspond à la tâche
- Le domaine du Skill est nécessaire
- L'utilisateur mentionne explicitement le domaine

**Structure d'un Skill:**
```
skill-name/
├── SKILL.md           # (Requis) Métadonnées + instructions
├── scripts/           # (Optionnel) Scripts Python/Bash
├── references/        # (Optionnel) Templates, docs
└── assets/            # (Optionnel) Images, logos
```

### 3. Agent Invocation Protocol

**Utiliser les agents spécialisés pour les tâches complexes.**

**Agents disponibles (19):**

| Agent | Domaine | Utiliser Quand |
|-------|---------|----------------|
| `orchestrator` | Coordination multi-agents | Tâches complexes nécessitant plusieurs expertises |
| `project-planner` | Planification | Découverte, breakdown de tâches |
| `frontend-specialist` | UI/UX Web | React, Next.js, Tailwind, composants |
| `backend-specialist` | API, logique métier | Node.js, Express, FastAPI, bases de données |
| `database-architect` | Schéma, SQL | Prisma, migrations, optimisation |
| `mobile-developer` | iOS, Android, RN | Applications mobiles |
| `game-developer` | Logique de jeu | Unity, Godot, Phaser |
| `devops-engineer` | CI/CD, Docker | Déploiement, infrastructure |
| `security-auditor` | Sécurité | Vulnérabilités, auth, OWASP |
| `penetration-tester` | Tests de sécurité | Tests offensifs |
| `test-engineer` | Stratégies de test | Unit, E2E, coverage |
| `debugger` | Analyse de bugs | Root cause analysis |
| `performance-optimizer` | Performance | Web Vitals, profiling |
| `seo-specialist` | SEO | Ranking, visibilité |
| `documentation-writer` | Documentation | README, API docs (UNIQUEMENT si demandé explicitement) |
| `product-manager` | Requirements | User stories, planning |
| `qa-automation-engineer` | Tests E2E | Playwright, CI pipelines |
| `code-archaeologist` | Legacy code | Refactoring, clean code |
| `explorer-agent` | Analyse codebase | Découverte de code |

### 4. Agent Boundary Enforcement (CRITIQUE)

**Chaque agent DOIT rester dans son domaine. Travail cross-domain = VIOLATION.**

| Agent | PEUT Faire | NE PEUT PAS Faire |
|-------|------------|-------------------|
| `frontend-specialist` | Composants, UI, styles, hooks | ❌ Fichiers de test, routes API, DB |
| `backend-specialist` | API, logique serveur, requêtes DB | ❌ Composants UI, styles |
| `test-engineer` | Fichiers de test, mocks, coverage | ❌ Code de production |
| `mobile-developer` | Composants RN/Flutter, UX mobile | ❌ Composants web |
| `database-architect` | Schéma, migrations, requêtes | ❌ UI, logique API |
| `security-auditor` | Audit, vulnérabilités, auth review | ❌ Code de features, UI |
| `devops-engineer` | CI/CD, déploiement, config infra | ❌ Code applicatif |
| `documentation-writer` | Docs, README, commentaires | ❌ Logique code, **invocation auto sans demande explicite** |

**Propriété des fichiers:**

| Pattern de Fichier | Agent Propriétaire | Autres BLOQUÉS |
|--------------------|-------------------|----------------|
| `**/*.test.{ts,tsx,js}` | `test-engineer` | ❌ Tous les autres |
| `**/__tests__/**` | `test-engineer` | ❌ Tous les autres |
| `**/components/**` | `frontend-specialist` | ❌ backend, test |
| `**/api/**`, `**/server/**` | `backend-specialist` | ❌ frontend |
| `**/prisma/**`, `**/drizzle/**` | `database-architect` | ❌ frontend |

---

## 🔄 Workflows (Slash Commands)

**Utiliser les workflows pour les tâches standardisées.**

| Command | Description | Utiliser Quand |
|---------|-------------|----------------|
| `/brainstorm` | Découverte socratique | Clarifier les besoins |
| `/create` | Créer nouvelle feature | Nouvelle application/feature |
| `/debug` | Déboguer problèmes | Erreurs, bugs |
| `/deploy` | Déployer application | Mise en production |
| `/enhance` | Améliorer code existant | Refactoring, optimisation |
| `/orchestrate` | Coordination multi-agents | Tâches complexes |
| `/plan` | Breakdown de tâches | Planification détaillée |
| `/preview` | Prévisualiser changements | Vérifier visuellement |
| `/status` | Vérifier statut projet | État du projet |
| `/test` | Exécuter tests | Validation |
| `/ui-ux-pro-max` | Design avec 50 styles | Design UI/UX |

---

## 🎯 Skills par Catégorie

### Frontend & UI
- `react-patterns` - React hooks, state, performance
- `nextjs-best-practices` - App Router, Server Components
- `tailwind-patterns` - Tailwind CSS v4
- `frontend-design` - Patterns UI/UX, design systems
- `ui-ux-pro-max` - 50 styles, 21 palettes, 50 fonts

### Backend & API
- `api-patterns` - REST, GraphQL, tRPC
- `nodejs-best-practices` - Node.js async, modules
- `python-patterns` - Standards Python, FastAPI

### Database
- `database-design` - Design de schéma, optimisation

### Testing & Quality
- `testing-patterns` - Jest, Vitest, stratégies
- `webapp-testing` - E2E, Playwright
- `tdd-workflow` - Test-driven development
- `code-review-checklist` - Standards de code review
- `lint-and-validate` - Linting, validation

### Security
- `vulnerability-scanner` - Audit sécurité, OWASP
- `red-team-tactics` - Sécurité offensive

### Architecture & Planning
- `app-builder` - Scaffolding full-stack
- `architecture` - Patterns de design système
- `plan-writing` - Planification de tâches
- `brainstorming` - Questionnement socratique

### Mobile
- `mobile-design` - Patterns UI/UX mobile

### Game Development
- `game-development` - Logique de jeu, mécaniques

### SEO & Growth
- `seo-fundamentals` - SEO, E-E-A-T, Core Web Vitals
- `geo-fundamentals` - Optimisation GenAI

### Shell/CLI
- `bash-linux` - Commandes Linux, scripting
- `powershell-windows` - Windows PowerShell

### Autres
- `clean-code` - Standards de code (Global)
- `behavioral-modes` - Personas d'agents
- `parallel-agents` - Patterns multi-agents
- `mcp-builder` - Model Context Protocol
- `documentation-templates` - Formats de docs
- `i18n-localization` - Internationalisation
- `performance-profiling` - Web Vitals, optimisation
- `systematic-debugging` - Troubleshooting

---

## 🔧 Scripts de Validation

**Deux niveaux de validation:**

### 1. checklist.py (Développement)
**Utiliser pendant le développement et pre-commit.**

```bash
python .agent/scripts/checklist.py .
```

**Vérifie:**
- Sécurité (vulnérabilités, secrets)
- Qualité du code (lint, types)
- Validation de schéma
- Suite de tests
- Audit UX
- Vérification SEO

### 2. verify_all.py (Pré-déploiement)
**Utiliser avant déploiement et releases.**

```bash
python .agent/scripts/verify_all.py . --url http://localhost:3000
```

**Vérifie tout dans checklist.py PLUS:**
- Lighthouse (Core Web Vitals)
- Playwright E2E
- Analyse de bundle
- Audit mobile
- Vérification i18n

---

## 📊 Workflow de Tâche Standard

### Pour Tâches Simples (Single Domain)

```
1. Identifier le domaine (frontend/backend/test/etc.)
2. Charger le Skill approprié
3. Suivre les instructions du Skill
4. Exécuter checklist.py
5. Vérifier avec getDiagnostics
```

### Pour Tâches Complexes (Multi-Domain)

```
1. Utiliser /orchestrate ou orchestrator agent
2. Vérifier PLAN.md existe (sinon créer avec project-planner)
3. Invoquer agents spécialisés dans l'ordre logique:
   - explorer-agent → Mapper le code
   - [domain-agents] → Analyser/implémenter
   - test-engineer → Vérifier changements
   - security-auditor → Vérification sécurité finale
4. Synthétiser les résultats
5. Exécuter verify_all.py
```

---

## 🔴 Checkpoints Obligatoires (Orchestration)

**Avant TOUTE invocation d'agent spécialisé:**

| Checkpoint | Vérification | Action si Échec |
|------------|--------------|-----------------|
| **PLAN.md existe** | `Read docs/PLAN.md` | Utiliser project-planner d'abord |
| **Type de projet valide** | WEB/MOBILE/BACKEND identifié | Demander à l'utilisateur ou analyser |
| **Routing d'agent correct** | Mobile → mobile-developer uniquement | Réassigner agents |

> 🔴 **Rappel:** PAS d'agents spécialisés sans PLAN.md vérifié.

---

## 🚫 Anti-Patterns à Éviter

| ❌ Ne Pas Faire | ✅ Faire |
|-----------------|----------|
| Lire tous les fichiers .agent/ | Lire uniquement les fichiers pertinents |
| Charger tous les Skills | Charger Skills à la demande |
| Invoquer agents hors domaine | Respecter les boundaries d'agents |
| Ignorer les scripts de validation | Exécuter checklist.py/verify_all.py |
| Créer docs sans demande | documentation-writer UNIQUEMENT si demandé |
| Orchestrer sans PLAN.md | Créer PLAN.md avec project-planner d'abord |
| Utiliser <3 agents pour orchestration | Minimum 3 agents différents |
| Assumer sans clarifier | Poser questions si ambiguïté |

---

## 📖 Référence Rapide

| Besoin | Agent | Skills |
|--------|-------|--------|
| Web App | `frontend-specialist` | react-patterns, nextjs-best-practices |
| API | `backend-specialist` | api-patterns, nodejs-best-practices |
| Mobile | `mobile-developer` | mobile-design |
| Database | `database-architect` | database-design |
| Sécurité | `security-auditor` | vulnerability-scanner |
| Tests | `test-engineer` | testing-patterns, webapp-testing |
| Debug | `debugger` | systematic-debugging |
| Plan | `project-planner` | brainstorming, plan-writing |

---

## 🎯 Intégration avec BroLab Fanbase

**Pour ce projet spécifique:**

1. **Stack Technique:** Next.js 14 + Convex + Clerk + Stripe
2. **Skills Prioritaires:**
   - `nextjs-best-practices` - App Router patterns
   - `react-patterns` - Composants React
   - `api-patterns` - Routes API
   - `database-design` - Schéma Convex
   - `frontend-design` - UI/UX
   - `testing-patterns` - Tests

3. **Agents Fréquents:**
   - `frontend-specialist` - Composants UI
   - `backend-specialist` - Convex functions
   - `test-engineer` - Tests
   - `security-auditor` - Auth Clerk + Stripe

4. **Validation:**
   - Toujours exécuter `checklist.py` après modifications
   - Utiliser `getDiagnostics` pour vérifier TypeScript
   - Tester manuellement les flows critiques

---

## 📝 Résumé des Règles Essentielles

1. ✅ **Progressive Disclosure** - Lire uniquement ce qui est nécessaire
2. ✅ **Skill Loading** - Charger Skills à la demande selon la tâche
3. ✅ **Agent Boundaries** - Respecter les domaines d'agents
4. ✅ **Validation Scripts** - Exécuter checklist.py/verify_all.py
5. ✅ **PLAN.md First** - Créer plan avant orchestration
6. ✅ **Minimum 3 Agents** - Pour orchestration complexe
7. ✅ **Clarify First** - Poser questions si ambiguïté
8. ✅ **Documentation-writer** - UNIQUEMENT si demandé explicitement

---

**Version:** Antigravity Kit v5.0
**Dernière mise à jour:** Janvier 2026
**Projet:** BroLab Fanbase
