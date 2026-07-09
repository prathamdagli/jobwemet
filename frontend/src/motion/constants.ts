/**
 * Motion Design System — Constants
 * --------------------------------
 * Foundational, unit-less tokens that every transition, variant, gesture and
 * hook in this system is built from. Nothing here animates on its own; these
 * are the shared primitives that guarantee a single, consistent motion
 * "vocabulary" across the entire application.
 *
 * Rules of the system (see also transitions.ts / variants.ts / gestures.ts):
 *  - GPU-accelerated properties only (opacity, transform: translate/scale/rotate).
 *  - Never animate layout properties (width, height, top, left, margin, padding).
 *  - Keep interactions subtle (see GESTURE_LIMITS below).
 *  - Every animation must be able to disable itself under prefers-reduced-motion.
 */

/**
 * Duration tokens (seconds). Consumed by `transitions.ts`.
 * Keep the ladder short and predictable — do not invent per-component values.
 */
export const DURATION = {
  /** Micro-interactions: hovers, taps, tiny state flips. */
  fast: 0.15,
  /** Default for most enter/exit and reveal animations. */
  normal: 0.3,
  /** Deliberate, large-surface motion (page/hero reveals). */
  slow: 0.5,
} as const

/**
 * Easing curves (cubic-bezier tuples). A small, opinionated set so the whole
 * product feels like it moves with one hand.
 */
export const EASING = {
  /** Balanced ease-in-out — the default for symmetric motion. */
  smooth: [0.4, 0, 0.2, 1],
  /** Ease-out — good for entrances (fast start, gentle settle). */
  gentle: [0.22, 1, 0.36, 1],
  /** Sharp ease-out — for snappy, responsive UI feedback. */
  snappy: [0.16, 1, 0.3, 1],
  /** Ease-in — for exits (gentle start, quick departure). */
  exit: [0.4, 0, 1, 1],
} as const

/**
 * Spring physics presets. Consumed by spring-based transitions/gestures.
 * Tuned to feel responsive without overshooting distractingly.
 */
export const SPRING = {
  /** General-purpose spring. */
  default: { type: 'spring', stiffness: 300, damping: 30, mass: 1 },
  /** Softer, slower settle — for larger surfaces. */
  gentle: { type: 'spring', stiffness: 180, damping: 26, mass: 1 },
  /** Tight, quick spring — for small interactive elements. */
  snappy: { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 },
} as const

/**
 * Distance tokens (px). Directional fades translate by these amounts.
 * Kept small so entrances read as "settling in", not "flying in".
 */
export const DISTANCE = {
  /** Subtle nudge — list items, stats, small cards. */
  sm: 8,
  /** Default reveal distance. */
  md: 16,
  /** Larger, more expressive reveals (hero/page). */
  lg: 24,
} as const

/**
 * Stagger timing tokens (seconds). Consumed by stagger containers and
 * `useStagger`. `childDelay` offsets the first child; `stagger` is the gap
 * between successive children.
 */
export const STAGGER = {
  /** Delay before the first child begins. */
  childDelay: 0.1,
  /** Gap between each child. */
  stagger: 0.08,
  /** Tighter gap for long lists. */
  staggerFast: 0.05,
} as const

/**
 * Scale tokens for enter/exit and hover feedback.
 * `hoverMax` is the hard ceiling for gesture scale (never exceed 1.02).
 */
export const SCALE = {
  /** Starting scale for scaleIn (grows into place). */
  in: 0.96,
  /** Ending scale for scaleOut (shrinks away). */
  out: 0.98,
  /** Maximum allowed hover scale — do not exceed. */
  hoverMax: 1.02,
  /** Tap/press feedback scale. */
  tap: 0.98,
} as const

/**
 * Hard limits for interaction gestures. Enforced by convention in
 * `gestures.ts`; documented here as the single source of truth.
 */
export const GESTURE_LIMITS = {
  /** Never scale a hovered element beyond this. */
  maxScale: 1.02,
  /** Never lift a hovered element more than this many px (negative = up). */
  maxTranslateY: -4,
} as const

/** Viewport config for scroll-reveal (`useInViewReveal`, reveal variants). */
export const VIEWPORT = {
  /** Trigger once — do not re-animate on scroll back. */
  once: true,
  /** Fraction of the element that must be visible to trigger. */
  amount: 0.2,
} as const
