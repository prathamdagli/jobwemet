/**
 * Motion Design System — Public API (barrel)
 * ------------------------------------------
 * The single entry point for all motion primitives. Import everything motion
 * from here so the system stays centralized and duplication-free:
 *
 *   import { fadeUp, normal, cardHover, useInViewReveal } from '@/motion';
 *
 * Modules:
 *   constants   — foundational tokens (durations, easings, distances, limits)
 *   transitions — named `Transition` objects (fast · normal · slow · spring …)
 *   variants    — the reusable `Variants` catalog (fadeUp, cardReveal, …)
 *   gestures    — hover/tap interaction presets (cardHover, buttonHover, …)
 *   hooks       — reduced-motion-aware React hooks
 *
 * Nothing here is wired into any page yet — this is infrastructure only.
 */
export * from './constants'
export * from './transitions'
export * from './variants'
export * from './gestures'
export * from './hooks'
