import CursorSpotlight from './CursorSpotlight'

/**
 * HeroBackground — the layered depth stack behind the hero content.
 *
 * Layers (back → front), every one monochrome (built from `--foreground` via
 * color-mix) so the palette stays neutral — no hue, no rainbow, no neon:
 *   1. spotlight  — static radial focus at centre
 *   2. mesh       — three soft neutral depth blobs
 *   3. grid       — faint engineering grid, masked to fade at the edges
 *   4. noise      — grayscale grain for a filmic, expensive feel
 *   5. vignette   — slow breathing darkening at the corners (CSS keyframe)
 *   6. cursor     — the JS-driven spotlight that tracks the pointer
 *
 * The whole stack is `pointer-events-none` and decorative (`aria-hidden`).
 */
export default function HeroBackground() {
  return (
    <div className="hero-layer" aria-hidden="true">
      <div className="hero-layer hero-spotlight" />
      <div className="hero-layer hero-mesh" />
      <div className="hero-layer hero-grid" />

      {/* grayscale grain */}
      <svg className="hero-layer hero-noise" preserveAspectRatio="none">
        <filter id="heroNoise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={2}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#heroNoise)" />
      </svg>

      <div className="hero-layer hero-vignette" />
      <CursorSpotlight />
    </div>
  )
}
