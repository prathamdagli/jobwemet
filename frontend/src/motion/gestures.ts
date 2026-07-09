/**
 * Motion Design System — Gestures
 * -------------------------------
 * Reusable hover/tap interaction presets. Each export is a plain object you
 * spread onto a `motion` element's gesture props (for future phases):
 *
 *   <motion.button {...buttonHover}>…</motion.button>
 *   <motion.div {...cardHover}>…</motion.div>
 *
 * Hard limits (enforced here, defined in constants.ts → GESTURE_LIMITS):
 *   - scale never exceeds 1.02
 *   - translateY never lifts more than 4px (y: -4)
 * Keep every interaction subtle. Only opacity/transform are used (GPU-friendly).
 *
 * Accessibility: these presets describe motion only. Under
 * prefers-reduced-motion, wrap the tree in `<MotionConfig reducedMotion="user">`
 * or gate the spread with `usePrefersReducedMotion()` from ./hooks.
 */
import type { TargetAndTransition, Transition } from 'motion/react'

import { GESTURE_LIMITS } from './constants'
import { fast, snappy, springSnappy } from './transitions'

/** Shape of a gesture preset: the props spread onto a `motion` element. */
export interface GesturePreset {
  whileHover?: TargetAndTransition
  whileTap?: TargetAndTransition
  transition?: Transition
}

const { maxScale, maxTranslateY } = GESTURE_LIMITS

/**
 * `cardHover` — subtle lift for interactive cards/tiles.
 * WHEN: clickable cards (course cards, career matches, dashboard tiles).
 * Lifts by 4px and scales a hair; presses slightly on tap.
 */
export const cardHover: GesturePreset = {
  whileHover: { y: maxTranslateY, scale: maxScale },
  whileTap: { scale: 0.99 },
  transition: springSnappy,
}

/**
 * `buttonHover` — responsive feedback for buttons.
 * WHEN: primary/secondary buttons and CTAs. Gentle grow on hover, small press
 * on tap for a tactile click feel.
 */
export const buttonHover: GesturePreset = {
  whileHover: { scale: maxScale },
  whileTap: { scale: 0.98 },
  transition: snappy,
}

/**
 * `iconHover` — playful nudge for interactive icons.
 * WHEN: icon buttons and icon-only affordances. Slightly larger scale ceiling
 * is acceptable visually on tiny elements but still capped at 1.02.
 */
export const iconHover: GesturePreset = {
  whileHover: { scale: maxScale, y: -2 },
  whileTap: { scale: 0.95 },
  transition: snappy,
}

/**
 * `imageHover` — gentle zoom for images/thumbnails.
 * WHEN: media thumbnails and cover images inside a clipped container
 * (`overflow-hidden`) so the scale reads as a zoom. Scale-only, no lift.
 */
export const imageHover: GesturePreset = {
  whileHover: { scale: maxScale },
  transition: fast,
}

/**
 * `widgetHover` — soft lift for larger dashboard widgets/panels.
 * WHEN: sizeable containers where a full card lift would feel heavy. Lifts less
 * (2px) and does not scale, keeping big surfaces grounded.
 */
export const widgetHover: GesturePreset = {
  whileHover: { y: -2 },
  transition: springSnappy,
}

/**
 * `linkHover` — minimal feedback for text links.
 * WHEN: inline/text links and nav items where scaling would shift layout.
 * Uses opacity only — no transform — so surrounding text never reflows.
 */
export const linkHover: GesturePreset = {
  whileHover: { opacity: 0.7 },
  transition: fast,
}

/**
 * Convenience map of every gesture, for programmatic lookup by name.
 */
export const gestures = {
  cardHover,
  buttonHover,
  iconHover,
  imageHover,
  widgetHover,
  linkHover,
} as const

export type GestureName = keyof typeof gestures
