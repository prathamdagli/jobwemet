import { useEffect, useState } from 'react'
import { animate, useReducedMotion } from 'motion/react'

/**
 * `useCountUp` — count a number up to `target` once, on mount / when target
 * changes. Built for KPI/stat/percentage counters (dashboard metrics, skill %,
 * career %, roadmap %, landing statistics).
 *
 * - Never loops: animates a single ease-out tween to the target value.
 * - Respects `prefers-reduced-motion`: when reduced, snaps straight to the
 *   target with no animation.
 *
 * @param target    The value to count up to.
 * @param duration  Tween length in seconds (default 1.2).
 * @param delay     Delay before the tween starts, in seconds (default 0).
 * @param decimals  Decimal places to keep in the returned number (default 0).
 */
export function useCountUp(
  target: number,
  options?: { duration?: number; delay?: number; decimals?: number },
): number {
  const prefersReduced = useReducedMotion()
  const { duration = 1.2, delay = 0, decimals = 0 } = options ?? {}
  const factor = 10 ** decimals

  const [value, setValue] = useState(0)
  const display = prefersReduced ? target : value

  useEffect(() => {
    if (prefersReduced) return

    const controls = animate(0, target, {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        setValue(Math.round(latest * factor) / factor)
      },
    })

    return () => controls.stop()
  }, [target, duration, delay, factor, prefersReduced])

  return display
}
