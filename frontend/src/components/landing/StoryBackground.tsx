/**
 * StoryBackground — one continuous layered backdrop for every section below
 * the Hero. Rendered once behind the story wrapper so the Statistics, Features,
 * How It Works, About, CTA and Footer sections share a single flowing surface
 * instead of alternating white/gray blocks. Monochrome, theme-aware, and fully
 * degrades under prefers-reduced-motion (the only animation is a slow spotlight
 * drift, which the CSS media query disables).
 */
export default function StoryBackground() {
  return (
    <div className="story-bg" aria-hidden="true">
      <div className="story-base absolute inset-0" />
      <div className="story-spotlight absolute inset-0" />
      <div className="story-mesh absolute inset-0" />
      <div className="story-grid absolute inset-0" />
      <svg className="story-noise absolute inset-0 h-full w-full">
        <filter id="story-noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#story-noise-filter)" />
      </svg>
    </div>
  )
}
