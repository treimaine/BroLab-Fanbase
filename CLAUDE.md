# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product & Business Context

**BroLab Fanbase** — *"Your career isn't an algorithm."* A mobile-first platform where artists build a personal hub ("one link") to connect and sell directly to fans (music, video, event tickets), bypassing algorithmic gatekeeping.

Two-sided model with distinct roles:
- **Artists** manage a public hub, links, events, and digital products; sell directly to fans; track revenue and payouts.
- **Fans** follow artists, buy digital content/tickets, get a personalized feed, and manage purchases/downloads.

**Revenue model** (important — affects payment code):
- Platform revenue comes **only from artist subscriptions** (Clerk Billing: Free vs. Premium $19.99/mo).
- Fan purchases go **directly to the artist** via Stripe Connect — the platform takes **no commission** on sales. Do not add application fees to the fan checkout flow.
- **Free vs Premium limits** (see `convex/subscriptions.ts` `PLAN_LIMITS`): Free = 5 products / 5 events / 5 links, audio-only, 50MB max; Premium = unlimited, video enabled, 500MB max.
- **Soft-lock / grandfathering:** downgrading never deletes content. Existing items stay accessible; only *creation* of new items is blocked while over the Free limit. Preserve this behavior in any limit-enforcement change.

## Commands

```bash
npm run dev              # Next.js dev server (Turbopack). Run `npx convex dev` in a SEPARATE terminal.
npx convex dev           # Convex backend — required for the app to function locally
npm run build            # Production build
npm run lint             # ESLint (next lint)
npx tsc --noEmit         # Type check (no dedicated npm script)
npm run build:analyze    # Build with bundle analyzer (ANALYZE=true)
npm run diagnose         # scripts/fix-production-config.js — diagnose prod/env config issues
npm run security:check   # npm outdated + npm audit
```

There is **no test runner configured**. Verification scripts under `scripts/` (`verify-*.ts`, `validate-checkout-flow.ts`, `integration-health-check.js`) are standalone Node/tsx scripts, not a unit test suite.

## Architecture

Next.js 15 **App Router** (React 19, TypeScript) frontend + **Convex** reactive backend. Auth/billing via **Clerk**, direct-to-artist payments via **Stripe Connect**, transactional email via **Resend/React Email**.

### Route groups (`src/app/`)
Access is segmented by Clerk role and enforced in `src/middleware.ts`:
- `(marketing)` — public landing, pricing, features, legal.
- `(auth)` — `sign-in`, `sign-up`, `onboarding` (role selection).
- `(artist)/dashboard/*` — **requires `role === "artist"`**.
- `(fan)/me/*` — **requires `role === "fan"`**; `/me` redirects to `/me/[username]`.
- `(public)/[artistSlug]` — public artist hub, viewable by anyone.
- `api/` — Route Handlers: `stripe/webhook`, `clerk/webhook`, `billing/*`, `onboarding/set-role`, `health`.

### Auth & role model
- Roles live in Clerk `publicMetadata.role` (`"artist"` | `"fan"`). `middleware.ts` reads the role per-request and redirects: no role → `/onboarding`; wrong role → the user's correct home.
- Subscription state also lives in Clerk `publicMetadata.subscription` (`{ plan, status, currentPeriodEnd }`) — **Clerk Billing is the source of truth**, not Convex.
- Users are synced Clerk → Convex `users` table (keyed by `clerkUserId`) via `clerk/webhook`.

### Convex backend (`convex/`)
- `schema.ts` is the single source of truth for tables/indexes. Core tables: `users`, `artists`, `links`, `events`, `products`, `follows`, `orders`/`orderItems`, `paymentMethods`, `downloads`, plus idempotency (`processedEvents`, `emailEvents`) and audit (`securityLogs`).
- **Function convention** (see `convex/products.ts`): each domain file has local helpers `getUserFromIdentity`, `getArtistForUser`, and `verify<Resource>Ownership` that re-check `ctx.auth.getUserIdentity()` → `users` row → ownership on **every** mutation. Follow this pattern — never trust a client-supplied owner id.
- **Subscription limits are enforced server-side** in mutations via `canCreateProduct`/`canCreateEvent`/`canCreateLink`/`canUploadVideo` + `enforceLimit` from `subscriptions.ts`. The frontend also reads `getCurrentSubscription`/`getCurrentUsage` for display, but the mutation check is the real gate.
- Queries always use `.withIndex(...)`, not full scans.

### Payments (Stripe Connect + Clerk Billing — two separate flows)
1. **Fan purchases** → `api/stripe/checkout` creates a Checkout Session with the artist's Connect account as destination → `api/stripe/webhook` verifies the signature and forwards to a Convex action (`convex/stripe.ts`) that creates the `order`/`orderItems` and grants download entitlement. Idempotency via the `processedEvents` table — webhooks are safe to retry.
2. **Artist subscriptions** → `api/billing/*` drives the Clerk Billing portal (upgrade / manage).
- `api/stripe/checkout` and `api/clerk/webhook` / `api/stripe/webhook` are the only routes exempted from auth in `middleware.ts`.

### Client state & media
- **Zustand** stores in `src/lib/stores/` — notably `player-store.ts` powers a global audio/video player that persists across navigation.
- **Responsive:** mobile-first, breakpoint at `768px` (`md:`). Mobile = TopBar + BottomNav + Sheet drawer; desktop = persistent sidebar.
- **Theming:** `next-themes` (light/dark, system detection, lavender accent).
- UI is **shadcn/ui** (Radix primitives in `src/components/ui/`, config in `components.json`), Tailwind CSS 3.4, Framer Motion, Lucide icons. Forms use React Hook Form + Zod.

### Security infrastructure (`src/lib/`)
- `api-rate-limit.ts` / `rate-limiter.ts` — API route rate limiting (`RATE_LIMITS`).
- `security-logger.ts` — logs unauthorized access to the `securityLogs` table; use `GENERIC_ERROR_MESSAGES` for client-facing errors (avoid leaking internals).
- `file-validation.ts` — validates uploads against plan file-type/size limits.
- CSP and other hardened headers are configured in `next.config.mjs`; Clerk domain config is sensitive — see `fix()` commits and `scripts/fix-production-config.js` before changing headers.

## Conventions
- `@/*` → `src/*` (tsconfig path alias). Convex is imported as `@/../convex/_generated/api`.
- ESM project (`"type": "module"`); config files use `.mjs`.
- Convex function files carry a header comment listing the requirement IDs (e.g. `R-CLERK-SUB-1.2`, `18.5`) each function satisfies — keep these in sync when modifying behavior.
- Extensive operational docs live in `docs/` (subscription plans/testing, Stripe local webhooks, checkout validation, email deliverability, Next.js 15 migration).
