/**
 * Motion Design System — Variants
 * -------------------------------
 * The reusable `Variants` catalog for the whole application. Every future
 * animation must be assembled from these — do NOT redefine one-off variants at
 * a call-site. Each variant is documented with WHEN to use it.
 *
 * Usage pattern (for future phases — not used yet):
 *   <motion.div variants={fadeUp} initial="hidden" animate="visible" />
 *   // or with scroll reveal:
 *   <motion.div variants={cardReveal} initial="hidden" whileInView="visible" />
 *
 * Convention: every variant exposes a `hidden` state and a `visible` state.
 * Exit-capable variants also expose `exit`. Only opacity/transform are animated
 * (GPU-friendly); no layout properties are ever touched.
 *
 * Accessibility: variants describe motion only. Disable them globally by
 * wrapping the tree in `<MotionConfig reducedMotion="user">` or by gating the
 * `animate`/`whileInView` prop with `usePrefersReducedMotion()` from ./hooks.
 */
import type { Variants } from 'motion/react'

import { DISTANCE, SCALE, STAGGER } from './constants'
import { gentle, normal, slow, smooth, spring } from './transitions'

/* ------------------------------------------------------------------ *
 * Fades
 * ------------------------------------------------------------------ */

/**
 * `fadeIn` — pure opacity fade, no movement.
 * WHEN: cross-fades, tooltips, backdrops, or anywhere a positional shift would
 * be distracting.
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: normal },
  exit: { opacity: 0, transition: smooth },
}

/**
 * `fadeUp` — fade while rising into place.
 * WHEN: the default entrance for content blocks, cards, and section headers.
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: DISTANCE.md },
  visible: { opacity: 1, y: 0, transition: normal },
  exit: { opacity: 0, y: DISTANCE.sm, transition: smooth },
}

/**
 * `fadeDown` — fade while descending into place.
 * WHEN: elements that logically enter from above (dropdowns, top notifications,
 * navbars revealing on load).
 */
export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -DISTANCE.md },
  visible: { opacity: 1, y: 0, transition: normal },
  exit: { opacity: 0, y: -DISTANCE.sm, transition: smooth },
}

/**
 * `fadeLeft` — fade while sliding in from the right (moving leftward).
 * WHEN: content entering from the right edge (side panels, "next" transitions).
 */
export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: DISTANCE.md },
  visible: { opacity: 1, x: 0, transition: normal },
  exit: { opacity: 0, x: DISTANCE.sm, transition: smooth },
}

/**
 * `fadeRight` — fade while sliding in from the left (moving rightward).
 * WHEN: content entering from the left edge (side panels, "back" transitions).
 */
export const fadeRight: Variants = {
  hidden: { opacity: 0, x: -DISTANCE.md },
  visible: { opacity: 1, x: 0, transition: normal },
  exit: { opacity: 0, x: -DISTANCE.sm, transition: smooth },
}

/* ------------------------------------------------------------------ *
 * Scales
 * ------------------------------------------------------------------ */

/**
 * `scaleIn` — fade while growing from slightly smaller to full size.
 * WHEN: elements that should "pop" into existence (badges, avatars, popovers,
 * emphasized stats). Uses a spring for a tactile settle.
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: SCALE.in },
  visible: { opacity: 1, scale: 1, transition: spring },
  exit: { opacity: 0, scale: SCALE.in, transition: smooth },
}

/**
 * `scaleOut` — fade while shrinking slightly.
 * WHEN: the exit counterpart for dismissable, emphasized surfaces (toasts,
 * confirmation chips). Pair `visible` here with a `scaleIn` entrance.
 */
export const scaleOut: Variants = {
  hidden: { opacity: 0, scale: SCALE.out },
  visible: { opacity: 1, scale: 1, transition: normal },
  exit: { opacity: 0, scale: SCALE.out, transition: smooth },
}

/* ------------------------------------------------------------------ *
 * Stagger orchestration
 * ------------------------------------------------------------------ */

/**
 * `staggerContainer` — parent orchestrator with no visual change of its own.
 * WHEN: wrap a group of children (each using `staggerChildren`/`fadeUp`/etc.)
 * so they reveal in a cascade. Controls timing only.
 */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: STAGGER.childDelay,
      staggerChildren: STAGGER.stagger,
    },
  },
  exit: {
    transition: {
      staggerChildren: STAGGER.staggerFast,
      staggerDirection: -1,
    },
  },
}

/**
 * `staggerChildren` — the per-item variant used inside `staggerContainer`.
 * WHEN: apply to each child of a stagger container (grid cards, list rows).
 * Inherits its reveal timing from the parent's stagger schedule.
 */
export const staggerChildren: Variants = {
  hidden: { opacity: 0, y: DISTANCE.sm },
  visible: { opacity: 1, y: 0, transition: normal },
  exit: { opacity: 0, y: DISTANCE.sm, transition: smooth },
}

/* ------------------------------------------------------------------ *
 * Route / overlay transitions
 * ------------------------------------------------------------------ */

/**
 * `pageTransition` — route-level enter/exit.
 * WHEN: wrap page content (inside an `AnimatePresence`) so navigations
 * cross-fade with a subtle rise instead of hard-cutting.
 */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: DISTANCE.sm },
  visible: { opacity: 1, y: 0, transition: normal },
  exit: { opacity: 0, y: -DISTANCE.sm, transition: smooth },
}

/**
 * `modalTransition` — centered dialog enter/exit.
 * WHEN: modal/dialog panels. Combines a fade with a gentle scale so the dialog
 * feels anchored to the screen center.
 */
export const modalTransition: Variants = {
  hidden: { opacity: 0, scale: SCALE.in },
  visible: { opacity: 1, scale: 1, transition: spring },
  exit: { opacity: 0, scale: SCALE.in, transition: smooth },
}

/**
 * `drawerTransition` — edge-anchored panel slide.
 * WHEN: side drawers/sheets sliding from the right. For a left-anchored drawer,
 * negate the `x` values at the call-site or add a mirrored variant later.
 */
export const drawerTransition: Variants = {
  hidden: { opacity: 0, x: '100%' },
  visible: { opacity: 1, x: 0, transition: gentle },
  exit: { opacity: 0, x: '100%', transition: smooth },
}

/* ------------------------------------------------------------------ *
 * Domain reveals (scroll-triggered by convention)
 * ------------------------------------------------------------------ */

/**
 * `cardReveal` — scroll-in reveal tuned for cards/tiles.
 * WHEN: dashboard tiles, course cards, career-match cards as they enter the
 * viewport. Slightly larger rise than a plain fadeUp for presence.
 */
export const cardReveal: Variants = {
  hidden: { opacity: 0, y: DISTANCE.md, scale: SCALE.in },
  visible: { opacity: 1, y: 0, scale: 1, transition: normal },
}

/**
 * `listReveal` — item variant for vertical lists revealing on scroll.
 * WHEN: rows in a list/table that should cascade in; use inside a
 * `staggerContainer`. Smaller nudge keeps long lists calm.
 */
export const listReveal: Variants = {
  hidden: { opacity: 0, y: DISTANCE.sm },
  visible: { opacity: 1, y: 0, transition: normal },
}

/**
 * `timelineReveal` — item variant for horizontal/timeline steps.
 * WHEN: roadmap timeline nodes/steps revealing in sequence; use inside a
 * `staggerContainer`. Enters from the left to imply forward progression.
 */
export const timelineReveal: Variants = {
  hidden: { opacity: 0, x: -DISTANCE.md },
  visible: { opacity: 1, x: 0, transition: normal },
}

/**
 * `heroReveal` — the marquee entrance for hero/landing sections.
 * WHEN: top-of-page hero content on first paint. Uses the slow, expressive
 * timing and a larger rise. Reserve for one or two elements per page.
 */
export const heroReveal: Variants = {
  hidden: { opacity: 0, y: DISTANCE.lg },
  visible: { opacity: 1, y: 0, transition: slow },
}

/**
 * `statReveal` — emphasized reveal for KPI/stat numbers.
 * WHEN: stat tiles and metric counters. Springs up with a slight scale so
 * figures feel confident when they land.
 */
export const statReveal: Variants = {
  hidden: { opacity: 0, y: DISTANCE.sm, scale: SCALE.in },
  visible: { opacity: 1, y: 0, scale: 1, transition: spring },
}

/**
 * `progressReveal` — horizontal grow for progress bars/meters.
 * WHEN: progress indicators. Animates `scaleX` from 0→1 (GPU-friendly) rather
 * than animating width. IMPORTANT: set `transform-origin: left` on the element
 * so it grows from the start edge.
 */
export const progressReveal: Variants = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: { opacity: 1, scaleX: 1, transition: gentle },
}

/**
 * Convenience map of every variant, for programmatic lookup by name.
 */
export const variants = {
  fadeIn,
  fadeUp,
  fadeDown,
  fadeLeft,
  fadeRight,
  scaleIn,
  scaleOut,
  staggerContainer,
  staggerChildren,
  pageTransition,
  modalTransition,
  drawerTransition,
  cardReveal,
  listReveal,
  timelineReveal,
  heroReveal,
  statReveal,
  progressReveal,
} as const

export type VariantName = keyof typeof variants
