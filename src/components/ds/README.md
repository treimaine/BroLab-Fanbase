# Design System (`@/components/ds`)

Reusable, token-driven building blocks extracted from the marketing landing page.
Import from the barrel: `import { Section, SectionHeading, GlassCard, ... } from "@/components/ds"`.

## Where things live (what to edit)

| Layer | File | Change this to… |
| --- | --- | --- |
| **Color / theme tokens** | `src/app/globals.css` (`:root`, `.dark`) | Restyle brand color, background, borders, radius, glow shadows, section rhythm |
| **Utility mappings** | `tailwind.config.ts` | Expose new tokens as Tailwind classes (`rounded-card`, `shadow-glow`, `py-section`, `ease-signature`, `animate-float`) |
| **Motion presets** | `src/lib/motion.ts` | Tune every animation at once (easing curve, durations, stagger) |
| **Primitives** | `src/components/ds/*` | Change structural/variant defaults of a component |

Because every primitive reads CSS variables + Tailwind tokens, editing `globals.css`
(e.g. `--primary`, `--radius-card`, `--ease-signature`) restyles the whole app.

## Design tokens added

```css
--radius-card: 2rem;   /* rounded-card  → big glass cards          */
--radius-hub:  2.5rem; /* rounded-hub   → hero/CTA panels          */
--ease-signature: cubic-bezier(0.21, 0.47, 0.32, 0.98); /* ease-signature */
--section-py: 8rem;    /* py-section    → standard section rhythm  */
--shadow-glow / --shadow-glow-lg;  /* shadow-glow / shadow-glow-lg */
```

## Primitives

- **`<Section>`** — page section wrapper. Props: `spacing` (`default|compact|none`),
  `size` (`default|narrow|prose`), `container`, `backdrop`, `overflow`.
- **`<SectionHeading>`** — eyebrow + serif title + subtitle, pre-animated.
  Use `<Highlight>` inside `title` for the italic-primary emphasis.
- **`<GlassCard>`** — frosted card. Props: `radius` (`md|lg|xl`), `padding`
  (`none|sm|md|lg|xl`), `interactive`. Animate via `motion.create(GlassCard)`.
- **`<Eyebrow>`** — pill label. `variant` (`outline|solid`), `dot` (pulsing status dot).
- **`<GradientBackdrop>`** — decorative blurred orbs (`variant` `section|hero`).
- **`<CtaPill>`** — inline "prompt → action" pill (`label`, `action`, `href`/`onClick`).
- **`<Reveal>`** — scroll-into-view motion wrapper (`as`, `variants`, `delay`, `trigger`).

## Motion presets (`@/lib/motion`)

`fadeInUp`, `fadeIn`, `cardReveal`, `scaleIn`, `staggerContainer`, `floatTransition()`,
plus `EASE_SIGNATURE` and `VIEWPORT_ONCE`. Put `staggerContainer` on a parent `<Reveal>`
and `cardReveal` on each child for orchestrated grids.

## Example

```tsx
<Section backdrop={<GradientBackdrop />}>
  <SectionHeading
    eyebrow="New"
    title={<>Simple by <Highlight>design.</Highlight></>}
    subtitle="From zero to live in under 10 minutes."
  />
  <Reveal variants={staggerContainer} className="grid gap-6 md:grid-cols-3">
    {items.map((it) => (
      <MotionGlassCard key={it.id} variants={cardReveal}>…</MotionGlassCard>
    ))}
  </Reveal>
</Section>
```
