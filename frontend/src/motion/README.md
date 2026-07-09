# Motion Design System

The single, centralized motion vocabulary for the application. Every animation
in the product must be assembled from these primitives — **do not** define
one-off variants, durations, or easings at a call-site.

> Status: **infrastructure only.** Nothing here is wired into any page yet.

## Import

```ts
import { fadeUp, normal, cardHover, useInViewReveal } from '@/motion'
```

## Principles

- **GPU-accelerated only.** Animate `opacity` and `transform`
  (`translate` / `scale` / `rotate`) exclusively. Never animate `width`,
  `height`, `top`, `left`, `margin`, or other layout properties.
- **Subtle interactions.** Hover gestures never exceed `scale 1.02` or
  `translateY -4px`.
- **Accessible by default.** Everything respects `prefers-reduced-motion`.
  Prefer wrapping the app in `<MotionConfig reducedMotion="user">`, or gate
  animations with `usePrefersReducedMotion()`. The hooks already degrade to
  instant/no-op under reduced motion.
- **One source of truth.** Timing and easing live in `constants.ts` →
  `transitions.ts`. Motion shapes live in `variants.ts` / `gestures.ts`.

## Modules

| File             | What it holds                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------- |
| `constants.ts`   | Tokens: durations, easings, springs, distances, stagger, limits.                         |
| `transitions.ts` | Named `Transition`s: fast, normal, slow, gentle, snappy, smooth, spring(+gentle/snappy). |
| `variants.ts`    | The reusable `Variants` catalog (18 variants, see below).                                |
| `gestures.ts`    | Hover/tap presets: card, button, icon, image, widget, link.                              |
| `hooks.ts`       | `usePrefersReducedMotion`, `useStagger`, `useInViewReveal`, `useMouseTilt`.              |
| `index.ts`       | Barrel — import everything from `@/motion`.                                              |

## Variants — when to use

| Variant            | Use for                                                      |
| ------------------ | ------------------------------------------------------------ |
| `fadeIn`           | Cross-fades, tooltips, backdrops (no movement).              |
| `fadeUp`           | Default entrance for content blocks, cards, section headers. |
| `fadeDown`         | Elements entering from above (dropdowns, top notices).       |
| `fadeLeft`         | Content entering from the right edge.                        |
| `fadeRight`        | Content entering from the left edge.                         |
| `scaleIn`          | Elements that "pop" in (badges, avatars, popovers, stats).   |
| `scaleOut`         | Exit counterpart for dismissable emphasized surfaces.        |
| `staggerContainer` | Parent orchestrator for cascading child reveals.             |
| `staggerChildren`  | Per-item variant inside a stagger container.                 |
| `pageTransition`   | Route-level enter/exit (inside `AnimatePresence`).           |
| `modalTransition`  | Centered dialog/modal panels.                                |
| `drawerTransition` | Edge-anchored side drawers/sheets.                           |
| `cardReveal`       | Scroll-in reveal for cards/tiles.                            |
| `listReveal`       | List rows cascading in (inside a stagger container).         |
| `timelineReveal`   | Roadmap/timeline steps revealing in sequence.                |
| `heroReveal`       | Marquee entrance for hero/landing sections.                  |
| `statReveal`       | Emphasized reveal for KPI/stat numbers.                      |
| `progressReveal`   | Progress bars via `scaleX` (set `transform-origin: left`).   |

## Usage patterns (for future phases)

```tsx
// Basic reveal
<motion.div variants={fadeUp} initial="hidden" animate="visible" />

// Scroll reveal
const { ref, inView } = useInViewReveal();
<motion.div ref={ref} variants={cardReveal}
  initial="hidden" animate={inView ? 'visible' : 'hidden'} />

// Staggered group
const { container, item } = useStagger();
<motion.ul variants={container} initial="hidden" animate="visible">
  {rows.map((r) => <motion.li key={r.id} variants={item} />)}
</motion.ul>

// Hover gesture
<motion.button {...buttonHover}>Save</motion.button>
```
