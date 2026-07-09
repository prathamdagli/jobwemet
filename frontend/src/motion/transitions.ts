/**
 * Motion Design System — Transitions
 * ----------------------------------
 * Shared, named `Transition` objects. Variants and gestures reference these so
 * that timing/easing is defined in exactly one place. Never inline a duration
 * or easing at a call-site — pick the transition that matches the intent.
 *
 * Duration-based transitions:  fast · normal · slow · gentle · snappy · smooth
 * Spring-based transitions:     spring · springGentle · springSnappy
 */
import type { Transition } from 'motion/react'

import { DURATION, EASING, SPRING } from './constants'

/**
 * `fast` — 150ms smooth. Micro-interactions and tiny state changes where the
 * motion should be barely perceptible. Pairs well with hover/tap feedback.
 */
export const fast: Transition = {
  duration: DURATION.fast,
  ease: EASING.smooth,
}

/**
 * `normal` — 300ms gentle ease-out. The default transition for the majority of
 * enter animations and reveals. When in doubt, use this.
 */
export const normal: Transition = {
  duration: DURATION.normal,
  ease: EASING.gentle,
}

/**
 * `slow` — 500ms gentle ease-out. Deliberate, large-surface motion such as
 * hero and page-level reveals. Use sparingly to keep the product feeling quick.
 */
export const slow: Transition = {
  duration: DURATION.slow,
  ease: EASING.gentle,
}

/**
 * `gentle` — 300ms with the gentle ease-out curve. A soft, unhurried feel for
 * content that should "settle" into place (cards, panels).
 */
export const gentle: Transition = {
  duration: DURATION.normal,
  ease: EASING.gentle,
}

/**
 * `snappy` — 150ms with a sharp ease-out. Responsive, immediate feedback for
 * interactive UI (buttons, toggles, icon reactions).
 */
export const snappy: Transition = {
  duration: DURATION.fast,
  ease: EASING.snappy,
}

/**
 * `smooth` — 300ms symmetric ease-in-out. Balanced motion for elements that
 * both enter and exit (accordions, cross-fades, tab content).
 */
export const smooth: Transition = {
  duration: DURATION.normal,
  ease: EASING.smooth,
}

/**
 * `spring` — general-purpose physics spring. Natural, tactile motion for
 * elements that benefit from a slight settle (scale-ins, draggable widgets).
 */
export const spring: Transition = SPRING.default

/**
 * `springGentle` — softer, slower spring for larger surfaces (drawers, modals).
 */
export const springGentle: Transition = SPRING.gentle

/**
 * `springSnappy` — tight, quick spring for small interactive elements.
 */
export const springSnappy: Transition = SPRING.snappy

/**
 * Convenience map of every transition, for programmatic lookup by name.
 */
export const transitions = {
  fast,
  normal,
  slow,
  gentle,
  snappy,
  smooth,
  spring,
  springGentle,
  springSnappy,
} as const

export type TransitionName = keyof typeof transitions
