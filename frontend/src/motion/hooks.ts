/**
 * Motion Design System — Hooks
 * ----------------------------
 * Reusable React hooks that make the variants/transitions/gestures easy to
 * apply consistently AND accessibly. Not used anywhere yet — this phase only
 * establishes the infrastructure.
 *
 * Every hook is reduced-motion aware: when the user prefers reduced motion,
 * each hook degrades to a no-op / instant result so consuming code doesn't have
 * to special-case accessibility.
 */
import { useCallback, useMemo, useRef } from 'react'
import type { CSSProperties } from 'react'
import {
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'
import type { Variants } from 'motion/react'

import { STAGGER, VIEWPORT } from './constants'
import { springSnappy } from './transitions'

/**
 * `usePrefersReducedMotion` — boolean flag for the user's OS-level
 * "reduce motion" preference.
 * WHEN: gate any animation you author. `true` means motion should be disabled.
 * Thin, semantic wrapper over motion's `useReducedMotion` (which returns
 * `boolean | null`) that always resolves to a definite boolean.
 */
export function usePrefersReducedMotion(): boolean {
  return useReducedMotion() ?? false
}

/**
 * `useStagger` — build a container/child variant pair for cascading reveals.
 * WHEN: orchestrating a group of elements that should animate in sequence
 * (grids, lists). Returns customized `container` and `item` variants so you can
 * tune timing per-usage without redefining variants.
 *
 * Under reduced motion, stagger/delay collapse to 0 so children appear at once.
 *
 * @param options.stagger     Gap (s) between each child. Defaults to STAGGER.stagger.
 * @param options.childDelay  Delay (s) before the first child. Defaults to STAGGER.childDelay.
 */
export function useStagger(options?: {
  stagger?: number
  childDelay?: number
}): { container: Variants; item: Variants } {
  const prefersReduced = usePrefersReducedMotion()
  const stagger = options?.stagger ?? STAGGER.stagger
  const childDelay = options?.childDelay ?? STAGGER.childDelay

  return useMemo(() => {
    const staggerChildren = prefersReduced ? 0 : stagger
    const delayChildren = prefersReduced ? 0 : childDelay

    const container: Variants = {
      hidden: {},
      visible: {
        transition: { staggerChildren, delayChildren },
      },
    }

    const item: Variants = {
      hidden: { opacity: 0, y: prefersReduced ? 0 : 8 },
      visible: { opacity: 1, y: 0 },
    }

    return { container, item }
  }, [prefersReduced, stagger, childDelay])
}

/**
 * `useInViewReveal` — attach to an element to know when it scrolls into view.
 * WHEN: driving scroll-triggered reveals. Returns a `ref` to spread on the
 * target and an `inView` boolean you map to your `animate` state, e.g.
 *   const { ref, inView } = useInViewReveal();
 *   <motion.div ref={ref} variants={cardReveal}
 *     initial="hidden" animate={inView ? 'visible' : 'hidden'} />
 *
 * Under reduced motion, `inView` is forced `true` so content is shown
 * immediately without waiting for scroll.
 *
 * @param options.once    Trigger only once. Defaults to VIEWPORT.once.
 * @param options.amount  Visible fraction required to trigger. Defaults to VIEWPORT.amount.
 */
export function useInViewReveal<
  T extends HTMLElement = HTMLDivElement,
>(options?: {
  once?: boolean
  amount?: number
}): { ref: React.RefObject<T | null>; inView: boolean } {
  const ref = useRef<T>(null)
  const prefersReduced = usePrefersReducedMotion()
  const inView = useInView(ref, {
    once: options?.once ?? VIEWPORT.once,
    amount: options?.amount ?? VIEWPORT.amount,
  })

  return { ref, inView: prefersReduced ? true : inView }
}

/**
 * `useMouseTilt` — subtle 3D tilt that follows the pointer across an element.
 * WHEN: feature cards / hero art where a gentle parallax adds depth. Returns a
 * `ref`, a `style` object (containing spring-driven `rotateX`/`rotateY` motion
 * values plus `transformPerspective`), and pointer handlers to spread:
 *   const { ref, style, onMouseMove, onMouseLeave } = useMouseTilt();
 *   <motion.div ref={ref} style={style}
 *     onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} />
 *
 * Tilt is intentionally small (max ~`maxTilt`°). Under reduced motion the
 * handlers are no-ops and no rotation is applied.
 *
 * @param options.maxTilt  Maximum rotation in degrees. Defaults to 6.
 */
export function useMouseTilt<T extends HTMLElement = HTMLDivElement>(options?: {
  maxTilt?: number
}): {
  ref: React.RefObject<T | null>
  style: CSSProperties
  onMouseMove: (event: React.MouseEvent<T>) => void
  onMouseLeave: () => void
} {
  const ref = useRef<T>(null)
  const prefersReduced = usePrefersReducedMotion()
  const maxTilt = options?.maxTilt ?? 6

  // Normalized pointer position in [-0.5, 0.5] on each axis.
  const px = useMotionValue(0)
  const py = useMotionValue(0)

  const rotateX = useSpring(
    useTransform(py, [-0.5, 0.5], [maxTilt, -maxTilt]),
    springSnappy,
  )
  const rotateY = useSpring(
    useTransform(px, [-0.5, 0.5], [-maxTilt, maxTilt]),
    springSnappy,
  )

  const onMouseMove = useCallback(
    (event: React.MouseEvent<T>) => {
      if (prefersReduced) return
      const node = ref.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      px.set((event.clientX - rect.left) / rect.width - 0.5)
      py.set((event.clientY - rect.top) / rect.height - 0.5)
    },
    [prefersReduced, px, py],
  )

  const onMouseLeave = useCallback(() => {
    px.set(0)
    py.set(0)
  }, [px, py])

  const style = useMemo<CSSProperties>(
    () =>
      prefersReduced
        ? {}
        : ({
            rotateX,
            rotateY,
            transformPerspective: 800,
            transformStyle: 'preserve-3d',
          } as unknown as CSSProperties),
    [prefersReduced, rotateX, rotateY],
  )

  return { ref, style, onMouseMove, onMouseLeave }
}
