import { useEffect, useRef } from 'react'

/**
 * CursorSpotlight — a monochrome radial light that follows the pointer across the
 * hero. Implemented with a single rAF lerp that writes CSS custom properties
 * (`--mx` / `--my`) on a layer; the gradient itself is static, so only a cheap
 * transform-free var update happens per frame (no React re-render, no layout).
 *
 * Degrades gracefully: disabled entirely under prefers-reduced-motion and on
 * touch / coarse-pointer devices.
 */
export default function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarse = window.matchMedia('(hover: none)')
    if (reduce.matches || coarse.matches) return

    let raf = 0
    let curX = 0
    let curY = 0
    let tgtX = 0
    let tgtY = 0
    let running = false

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      tgtX = event.clientX - rect.left
      tgtY = event.clientY - rect.top
      if (!running) {
        running = true
        raf = requestAnimationFrame(loop)
      }
    }

    const loop = () => {
      curX += (tgtX - curX) * 0.16
      curY += (tgtY - curY) * 0.16
      el.style.setProperty('--mx', `${curX}px`)
      el.style.setProperty('--my', `${curY}px`)
      if (Math.abs(tgtX - curX) > 0.4 || Math.abs(tgtY - curY) > 0.4) {
        raf = requestAnimationFrame(loop)
      } else {
        running = false
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <div ref={ref} className="hero-layer hero-cursor" aria-hidden="true" />
}
