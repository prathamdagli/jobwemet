import { motion } from 'motion/react'
import { Brain, Check, FileText } from 'lucide-react'
import { usePrefersReducedMotion } from '@/motion'

/**
 * AuthShowcase — the left panel of the auth layout, presented as a premium
 * product preview in the spirit of Linear / Stripe / Clerk / Vercel auth pages.
 *
 * A large wordmark and welcome line sit above a single, realistic JobWeMet
 * application window rendered with glassmorphism, a macOS-style title bar and
 * a quiet dark environment. Motion is intentionally minimal: a fade-in, a
 * small hover lift, one-shot progress + readiness animations and a faint
 * shimmer on the upload card.
 *
 * No HUD, no floating widgets, no orbiting nodes — just the product.
 */

const SKILLS = ['Python', 'React', 'SQL', 'Docker'] as const

const ROADMAP = [
  { label: 'Machine Learning', state: 'done' as const },
  { label: 'Deep Learning', state: 'active' as const },
  { label: 'MLOps', state: 'todo' as const },
]

/* ------------------------------------------------------------------ */
/*  Readiness ring (animates once on mount)                           */
/* ------------------------------------------------------------------ */
function ReadinessRing({
  value,
  prefersReduced,
}: {
  value: number
  prefersReduced: boolean
}) {
  return (
    <div className="relative size-24 shrink-0">
      <svg
        viewBox="0 0 100 100"
        className="size-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={50}
          cy={50}
          r={42}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={8}
          fill="none"
        />
        <motion.circle
          cx={50}
          cy={50}
          r={42}
          stroke="white"
          strokeWidth={8}
          strokeLinecap="round"
          fill="none"
          initial={prefersReduced ? false : { pathLength: 0 }}
          animate={{ pathLength: value / 100 }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.35 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tracking-tight text-white">
          {value}%
        </span>
        <span className="text-[9px] uppercase tracking-wide text-white/40">
          Ready
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  The product window mockup                                          */
/* ------------------------------------------------------------------ */
function ProductWindow({ prefersReduced }: { prefersReduced: boolean }) {
  return (
    <motion.div
      className="group relative w-full max-w-[34rem] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_40px_80px_-24px_rgba(0,0,0,0.75)] backdrop-blur-2xl"
      initial={prefersReduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
    >
      {/* glass reflection */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0.07), transparent)',
        }}
        aria-hidden="true"
      />

      {/* macOS-style title bar */}
      <div className="relative flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="size-3 rounded-full bg-white/20" />
        <span className="size-3 rounded-full bg-white/12" />
        <span className="size-3 rounded-full bg-white/[0.06]" />
        <span className="ml-3 text-xs font-medium text-white/40">
          JobWeMet — Career Dashboard
        </span>
      </div>

      {/* body */}
      <div className="relative space-y-5 p-5">
        {/* resume upload */}
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-white/5 text-white/70 ring-1 ring-white/10">
            <FileText className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium text-white/90">
                Resume.pdf
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/70">
                <Check className="size-3" aria-hidden="true" /> Uploaded
              </span>
            </div>
            <div className="hero-shimmer mt-2 h-0.5 w-full rounded-full" />
          </div>
        </div>

        {/* skills detected */}
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-white/40">
            Skills detected
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SKILLS.map((s) => (
              <span
                key={s}
                className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/75"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* career match */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-white/40">
                Career Match
              </p>
              <p className="mt-0.5 text-sm font-medium text-white/90">
                AI Engineer
              </p>
            </div>
            <span className="text-2xl font-semibold tracking-tight text-white">
              92%
            </span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-white/70"
              initial={prefersReduced ? false : { width: 0 }}
              animate={{ width: '92%' }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
            />
          </div>
        </div>

        {/* learning roadmap */}
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-white/40">
            Learning Roadmap
          </p>
          <ul className="mt-2 space-y-2">
            {ROADMAP.map((r) => (
              <li key={r.label} className="flex items-center gap-2.5 text-sm">
                <span
                  className={
                    r.state === 'done'
                      ? 'flex size-4 items-center justify-center rounded-full bg-white/80 text-neutral-950'
                      : r.state === 'active'
                        ? 'size-4 rounded-full border-2 border-white/70'
                        : 'size-4 rounded-full border-2 border-white/20'
                  }
                >
                  {r.state === 'done' && (
                    <Check className="size-3" aria-hidden="true" />
                  )}
                  {r.state === 'active' && (
                    <span className="size-1.5 rounded-full bg-white/70" />
                  )}
                </span>
                <span
                  className={
                    r.state === 'todo' ? 'text-white/40' : 'text-white/80'
                  }
                >
                  {r.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* overall readiness */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-white/40">
              Overall Readiness
            </p>
            <p className="mt-1 text-sm text-white/60">
              You&rsquo;re almost job-ready.
            </p>
          </div>
          <ReadinessRing value={68} prefersReduced={prefersReduced} />
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Background: very faint particles                                   */
/* ------------------------------------------------------------------ */
function Particles({ prefersReduced }: { prefersReduced: boolean }) {
  const dots = [
    { x: '20%', y: '26%', d: 2, dur: 6 },
    { x: '78%', y: '32%', d: 1.5, dur: 7 },
    { x: '32%', y: '80%', d: 2, dur: 6.5 },
    { x: '70%', y: '74%', d: 1.5, dur: 7.5 },
  ]
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    >
      {dots.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white/70"
          style={{ left: s.x, top: s.y, width: s.d, height: s.d }}
          animate={prefersReduced ? undefined : { opacity: [0.06, 0.18, 0.06] }}
          transition={{ duration: s.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Panel                                                             */
/* ------------------------------------------------------------------ */
export default function AuthShowcase() {
  const prefersReduced = usePrefersReducedMotion()

  return (
    <aside className="relative hidden min-h-screen overflow-hidden bg-neutral-950 md:flex md:flex-col">
      {/* quiet dark environment */}
      <div className="auth-layer auth-spotlight" aria-hidden="true" />
      <div className="auth-layer auth-grid" aria-hidden="true" />
      <Particles prefersReduced={prefersReduced} />
      <div
        className="auth-layer"
        style={{
          background:
            'radial-gradient(120% 120% at 50% 40%, transparent 55%, rgba(0,0,0,0.6) 100%)',
        }}
        aria-hidden="true"
      />
      <div className="auth-layer auth-vignette" aria-hidden="true" />

      {/* content */}
      <div className="relative z-10 flex h-full flex-col justify-between gap-10 px-8 py-10 md:px-10 lg:px-14">
        {/* top: brand + welcome */}
        <header>
          <div className="flex items-center gap-3">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <Brain className="size-7 text-white" />
            </span>
            <span className="text-3xl font-semibold tracking-tight text-white">
              JobWeMet
            </span>
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-400">
            Your intelligent workspace is ready &mdash; pick up right where your
            career map left off.
          </p>
        </header>

        {/* middle: one large product mockup */}
        <div className="relative flex flex-1 items-center justify-center">
          <ProductWindow prefersReduced={prefersReduced} />
        </div>

        {/* intentionally empty */}
        <div aria-hidden="true" className="hidden" />
      </div>
    </aside>
  )
}
