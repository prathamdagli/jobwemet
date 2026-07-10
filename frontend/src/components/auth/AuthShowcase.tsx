import { motion } from 'motion/react'
import { Brain, Check, FileText } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { usePrefersReducedMotion } from '@/motion'

/**
 * AuthShowcase — the left panel of the auth layout, presented as a premium
 * product preview in the spirit of Linear / Stripe / Clerk / Vercel auth pages.
 *
 * A large wordmark (a link home), a small caption, a per-page title and a
 * one-line description sit above a single, realistic JobWeMet application
 * window rendered with glassmorphism, a macOS-style title bar and a quiet
 * dark environment. Motion is intentionally minimal: a fade-in, a small hover
 * lift, one-shot progress + readiness animations and a faint shimmer on the
 * upload card.
 *
 * No HUD, no floating widgets, no orbiting nodes — just the product.
 */

const SKILLS = ['Python', 'React', 'SQL', 'Docker'] as const

const ROADMAP = [
  { label: 'Machine Learning', state: 'done' as const },
  { label: 'Deep Learning', state: 'active' as const },
  { label: 'MLOps', state: 'todo' as const },
]

type PageConfig = {
  heading: string
  sub: string
  lead: string
  cta: string
  to: string
}

const PAGES: Record<string, PageConfig> = {
  '/login': {
    heading: 'Your AI Career Workspace',
    sub: 'Resume analysis, career matching, learning roadmap, and skill insights — all in one intelligent workspace.',
    lead: 'New to JobWeMet?',
    cta: 'Create an account',
    to: '/register',
  },
  '/register': {
    heading: 'Build Your Career Intelligence',
    sub: 'Create your account and discover the careers your skills are best suited for.',
    lead: 'Already have an account?',
    cta: 'Sign in',
    to: '/login',
  },
  '/forgot-password': {
    heading: 'Recover Your Workspace',
    sub: 'Reset your password and continue where you left off.',
    lead: 'Remembered your password?',
    cta: 'Back to Sign in',
    to: '/login',
  },
}

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
    <div className="relative size-[7rem] shrink-0">
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
          strokeWidth={10}
          fill="none"
        />
        <motion.circle
          cx={50}
          cy={50}
          r={42}
          stroke="white"
          strokeWidth={10}
          strokeLinecap="round"
          fill="none"
          initial={prefersReduced ? false : { pathLength: 0 }}
          animate={{ pathLength: value / 100 }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.35 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-semibold tracking-tight text-white">
          {value}%
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
      className="group relative w-full max-w-[31rem] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_30px_60px_-28px_rgba(0,0,0,0.55)] ring-1 ring-inset ring-white/10 backdrop-blur-2xl"
      initial={prefersReduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={{
        y: -4,
        boxShadow: '0 40px 80px -28px rgba(0,0,0,0.7)',
      }}
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
      <div className="relative flex items-center justify-center border-b border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-sm">
        <div className="absolute left-4 flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-white/25" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/10" />
        </div>
        <span className="text-xs font-medium text-white/40">
          JobWeMet — Career Dashboard
        </span>
      </div>

      {/* body */}
      <div className="relative space-y-6 p-7">
        {/* resume upload */}
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-white/5 text-white/70 ring-1 ring-white/10">
            <FileText className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[13px] font-medium text-white/90">
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
                className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[13px] text-white/75"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* career match */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-white/40">
                Career Match
              </p>
              <p className="mt-0.5 text-[13px] font-medium text-white/90">
                AI Engineer
              </p>
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">
              92%
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-700/50">
            <motion.div
              className="h-full rounded-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.35)]"
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
              <li
                key={r.label}
                className="flex items-center gap-2.5 text-[13px]"
              >
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

        {/* recommended next step */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-white/40">
            Recommended Next Step
          </p>
          <p className="mt-1 text-[13px] font-medium text-white/90">
            Docker Fundamentals
          </p>
          <p className="mt-0.5 text-[11px] text-white/40">
            Estimated time &middot; 6 hours
          </p>
          <button
            type="button"
            className="mt-2.5 inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/80 transition-colors duration-200 hover:border-white/30 hover:text-white"
          >
            Continue
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>

        {/* overall readiness */}
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
          <div>
            <p className="text-[13px] text-white/60">
              You&rsquo;re almost job-ready.
            </p>
            <p className="mt-1 text-[11px] text-white/35">
              A few steps from your target role.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <ReadinessRing value={68} prefersReduced={prefersReduced} />
            <p className="mt-1 text-[10px] uppercase tracking-wide text-white/40">
              Overall Readiness
            </p>
          </div>
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
  const { pathname } = useLocation()
  const cfg = PAGES[pathname] ?? PAGES['/login']

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
      <div className="relative z-10 flex h-full flex-col items-center justify-between gap-10 px-8 py-10 md:px-10 lg:px-14">
        {/* top: brand (links home) + per-page welcome */}
        <header className="flex flex-col items-center text-center">
          <Link
            to="/"
            className="inline-flex w-fit cursor-pointer items-center gap-3 rounded-2xl opacity-95 outline-none transition-[transform,opacity] duration-200 hover:-translate-y-px hover:opacity-100 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
          >
            <span className="flex size-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <Brain className="size-7 text-white" />
            </span>
            <span className="text-3xl font-semibold tracking-tight text-white">
              JobWeMet
            </span>
          </Link>
          <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">
            AI Career Intelligence
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {cfg.heading}
          </h1>
          <p className="mt-3 mx-auto max-w-sm text-center text-sm leading-relaxed text-neutral-400">
            {cfg.sub}
          </p>
        </header>

        {/* middle: one large product mockup, centered with breathing room */}
        <div className="relative flex flex-1 items-center justify-center px-10">
          <ProductWindow prefersReduced={prefersReduced} />
        </div>

        {/* bottom: contextual navigation */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-neutral-400">{cfg.lead}</span>
          <Link
            to={cfg.to}
            className="font-medium text-white/80 outline-none transition-colors duration-200 hover:text-white focus-visible:underline"
          >
            {cfg.cta}
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}
