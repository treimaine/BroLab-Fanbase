## Relations
@code_style/tailwind_conventions.md
@structure/component_library.md

## Raw Concept
**Task:**
Establish UI/UX Design System for BroLab Fanbase

**Changes:**
- Implemented SuperDesign aesthetic with lavender primary color.
- Configured serif (Playfair Display) and sans (Inter) font families.
- Set global border-radius to 1rem for rounded-2xl look.
- Added light/dark theme support with HSL variables.

**Files:**
- src/app/globals.css
- tailwind.config.ts
- src/components/ui/button.tsx
- src/components/hub/hub-header.tsx
- src/components/feed/feed-card.tsx

**Flow:**
Design system applied via Tailwind classes and CSS variables across all components.

**Timestamp:** 2026-01-14

## Narrative
### Structure
- src/app/globals.css: Theme variables and base styles.
- tailwind.config.ts: Font and radius configuration.
- src/components/ui/: Shadcn UI base components.
- src/components/hub/hub-header.tsx: Example of artist-specific branding.
- src/components/feed/feed-card.tsx: Example of content cards and CTAs.

### Dependencies
- Lucide React for icons
- Framer Motion for animations (mentioned in PRD)
- Shadcn/UI for base components
- Next.js Image for optimized media
- Tailwind CSS for styling with HSL variables

### Features
- SuperDesign Aesthetic: Lavender accent (#8B5CF6), soft borders, generous spacing.
- Mobile-first responsive layouts.
- Typography: Playfair Display (Serif) for H1-H3, Inter (Sans) for body.
- Theme: Light (99% bg) and Dark (6% bg) support via CSS variables.
- Components: Cards with backdrop-blur, rounded-full pills, skeleton loaders.
- Icons: Lucide React (4x4 or 5x5) with gap-2 in buttons.
- States: Hover transitions, focus-visible rings, disabled opacity.
