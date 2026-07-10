import { motion } from 'motion/react'
import {
  Brain,
  Check,
  FileText,
  GraduationCap,
  Lock,
  Network,
  Route,
  Sparkles,
  Target,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { fadeIn, fadeUp, staggerContainer, useMouseTilt } from '@/motion'

/**
 * AuthShowcase — the left panel of the auth layout.
 *
 * The brief: this is NOT another hero, and not a copy of the landing dashboard.
 * It sells the *promise* of the product — "this is what you unlock after you
 * sign in" — as a dark, monochrome "enter the workspace" scene in the spirit of
 * Cursor / Linear / Notion AI. A floating, light application window shows the
 * real pipeline (resume -> skills -> career -> roadmap) surrounded by small
 * floating modules, with feature highlights and trust stats below.
 *
 * Motion is assembled entirely from `src/motion`: `useMouseTilt` for the cursor
 * reactive 3D depth on the window and modules, `staggerContainer` + `fadeIn`/
 * `fadeUp` for staggered reveals. Everything degrades gracefully under
 * prefers-reduced-motion (the hook no-ops, CSS animates are disabled).
 */

/* ------------------------------------------------------------------ */
/*  The product window — the centre-piece illustration                 */
/* ------------------------------------------------------------------ */
function WorkspaceWindow() {
  const { ref, style, onMouseMove, onMouseLeave } = useMouseTilt({ maxTilt: 4 })

  return (
    <motion.div
      ref={ref}
      style={style}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative [transform-style:preserve-3d]"
    >
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-black/40 ring-1 ring-black/5"
      >
        {/* top reflection sheen */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/[0.03] to-transparent"
          aria-hidden="true"
        />

        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-zinc-300" />
            <span className="size-2.5 rounded-full bg-zinc-300" />
            <span className="size-2.5 rounded-full bg-zinc-300" />
          </span>
          <span className="ml-1.5 text-xs font-medium text-zinc-500">
            JobWeMet Workspace
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-600">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-zinc-900 opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-zinc-900" />
            </span>
            AI live
          </span>
        </div>

        <div className="space-y-3 p-4">
          {/* Resume uploaded */}
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-zinc-900">
                <FileText className="size-4 text-white" />
              </span>
              <div>
                <p className="text-xs font-semibold text-zinc-900">
                  resume.pdf
                </p>
                <p className="text-[11px] text-zinc-500">Uploaded</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-white">
              <Check className="size-3" />
              Parsed
            </span>
          </div>

          {/* AI analyzing */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-700">
              <Sparkles className="size-3.5 text-zinc-900" />
              AI is analyzing your resume
              <span
                className="ml-auto flex items-center gap-0.5"
                aria-hidden="true"
              >
                <span className="size-1 animate-bounce rounded-full bg-zinc-900 [animation-delay:-0.2s]" />
                <span className="size-1 animate-bounce rounded-full bg-zinc-900 [animation-delay:-0.1s]" />
                <span className="size-1 animate-bounce rounded-full bg-zinc-900" />
              </span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-zinc-200">
              <div className="hero-shimmer h-full w-full rounded-full" />
            </div>
          </div>

          {/* Skills extracted */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                Skills extracted
              </p>
              <span className="text-[11px] font-semibold text-zinc-900">5</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['Python', 'React', 'SQL', 'ML', 'Git'].map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Career predicted */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-900">AI Engineer</span>
              <span className="font-semibold text-zinc-900">92%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full rounded-full bg-zinc-900"
                style={{ width: '92%' }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-zinc-500">
              Best career match
            </p>
          </div>

          {/* Roadmap generated (progress timeline) */}
          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Roadmap generated
            </p>
            <ol className="space-y-0">
              {[
                { t: 'Machine Learning', s: 'completed' },
                { t: 'Deep Learning', s: 'current' },
                { t: 'MLOps', s: 'locked' },
              ].map((n, i, a) => (
                <li key={n.t} className="flex gap-2.5">
                  <div className="flex flex-col items-center">
                    {n.s === 'completed' ? (
                      <Check className="size-4 text-zinc-900" />
                    ) : n.s === 'current' ? (
                      <span className="inline-flex size-4 items-center justify-center rounded-full border border-zinc-900/30 bg-zinc-900/10">
                        <span className="size-1.5 animate-pulse rounded-full bg-zinc-900" />
                      </span>
                    ) : (
                      <span className="inline-flex size-4 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100">
                        <Lock className="size-2.5 text-zinc-400" />
                      </span>
                    )}
                    {i < a.length - 1 && (
                      <span className="my-1 w-px flex-1 bg-zinc-200" />
                    )}
                  </div>
                  <div className="flex flex-1 items-center justify-between pb-3">
                    <span className="text-xs font-medium text-zinc-800">
                      {n.t}
                    </span>
                    <span
                      className={
                        n.s === 'locked'
                          ? 'rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500'
                          : 'rounded-full bg-zinc-900/10 px-2 py-0.5 text-[10px] font-medium text-zinc-900'
                      }
                    >
                      {n.s}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Floating micro-modules around the window                          */
/* ------------------------------------------------------------------ */
interface ModuleConfig {
  title: string
  sub: string
  icon: LucideIcon
  pos: string
  size: string
  progress?: number
  badge?: string
  live?: boolean
  lgOnly?: boolean
}

const MODULES: ModuleConfig[] = [
  {
    title: 'Career Match',
    sub: 'AI Engineer · 92%',
    icon: Target,
    pos: '-right-6 -top-5',
    size: 'w-44',
    progress: 92,
    badge: 'New',
  },
  {
    title: 'Resume Parsed',
    sub: '5 skills extracted',
    icon: FileText,
    pos: '-left-8 top-1/4',
    size: 'w-40',
  },
  {
    title: 'Learning Progress',
    sub: '68% to job-ready',
    icon: TrendingUp,
    pos: '-right-6 -bottom-6',
    size: 'w-44',
    progress: 68,
  },
  {
    title: 'Skills Found',
    sub: '18 in your resume',
    icon: Network,
    pos: '-left-6 -top-12',
    size: 'w-36',
  },
  {
    title: 'AI Thinking',
    sub: 'Mapping skills…',
    icon: Sparkles,
    pos: '-left-6 -bottom-10',
    size: 'w-40',
    live: true,
    lgOnly: true,
  },
  {
    title: 'Roadmap Ready',
    sub: '3 steps generated',
    icon: GraduationCap,
    pos: '-right-10 top-1/2',
    size: 'w-36',
    lgOnly: true,
  },
]

function FloatingModule({ cfg, index }: { cfg: ModuleConfig; index: number }) {
  const { ref, style, onMouseMove, onMouseLeave } = useMouseTilt({ maxTilt: 3 })
  const Icon: LucideIcon = cfg.icon

  return (
    <motion.div
      ref={ref}
      style={style}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.35 + index * 0.08, duration: 0.5 }}
      className={`absolute ${cfg.pos} ${cfg.size} ${
        cfg.lgOnly ? 'hidden lg:block' : 'block'
      }`}
    >
      <div className="pointer-events-auto relative rounded-xl border border-zinc-200 bg-white p-2.5 shadow-xl shadow-black/20 ring-1 ring-black/5">
        {cfg.badge && (
          <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1.5 text-[10px] font-semibold text-white shadow-sm">
            {cfg.badge}
          </span>
        )}
        <div className="flex items-center gap-2">
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
            <Icon className="size-3.5 text-white" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-zinc-900">
              {cfg.title}
            </p>
            <p className="truncate text-[10px] text-zinc-500">{cfg.sub}</p>
          </div>
          {cfg.live && (
            <span className="ml-auto flex size-1.5 shrink-0">
              <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-zinc-900 opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-zinc-900" />
            </span>
          )}
        </div>
        {cfg.progress !== undefined && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-zinc-900"
              style={{ width: `${cfg.progress}%` }}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}

function FloatingModules() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      {MODULES.map((cfg, i) => (
        <FloatingModule key={cfg.title} cfg={cfg} index={i} />
      ))}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Feature highlights + trust strip                                  */
/* ------------------------------------------------------------------ */
const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Brain,
    title: 'AI Career Intelligence',
    desc: "Predicts the roles you're genuinely suited for.",
  },
  {
    icon: Route,
    title: 'Personalized Roadmaps',
    desc: 'A step-by-step path from where you are to job-ready.',
  },
  {
    icon: Target,
    title: 'Skill Gap Analysis',
    desc: 'Pinpoints exactly what to learn next.',
  },
]

const TRUST: { value: string; label: string }[] = [
  { value: '18', label: 'Skills Analysed' },
  { value: '92%', label: 'Match Accuracy' },
  { value: '1000+', label: 'Learning Resources' },
]

export default function AuthShowcase() {
  return (
    <aside className="relative hidden min-h-screen overflow-hidden bg-neutral-950 md:flex md:flex-col">
      {/* layered monochrome background */}
      <div className="auth-layer auth-spotlight" aria-hidden="true" />
      <div className="auth-layer auth-mesh" aria-hidden="true" />
      <div className="auth-layer auth-grid" aria-hidden="true" />
      <svg className="auth-layer auth-noise" aria-hidden="true">
        <filter id="auth-noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#auth-noise-filter)" />
      </svg>
      <div className="auth-layer auth-vignette" aria-hidden="true" />

      {/* content */}
      <div className="relative z-10 flex h-full flex-col justify-between gap-8 px-8 py-10 md:px-10 lg:px-14">
        {/* top: logo + tagline */}
        <header>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
              <Brain className="size-5 text-white" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-white">
              JobWeMet
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
            Your AI career copilot. Sign in to unlock a workspace that maps your
            skills to the career you&rsquo;re meant for.
          </p>
        </header>

        {/* middle: the workspace + floating modules */}
        <div className="relative flex flex-1 items-center justify-center">
          <div className="relative w-full max-w-md">
            <WorkspaceWindow />
            <FloatingModules />
          </div>
        </div>

        {/* bottom: feature highlights + trust */}
        <footer className="space-y-7">
          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {FEATURES.map((f) => {
              const Icon: LucideIcon = f.icon
              return (
                <motion.li
                  key={f.title}
                  variants={fadeUp}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                    <Icon className="size-3.5 text-white" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-neutral-100">
                      {f.title}
                    </p>
                    <p className="text-[11px] leading-snug text-neutral-400">
                      {f.desc}
                    </p>
                  </div>
                </motion.li>
              )
            })}
          </motion.ul>

          <div className="flex items-center justify-center divide-x divide-white/10">
            {TRUST.map((t) => (
              <div
                key={t.label}
                className="px-4 text-center first:pl-0 last:pr-0"
              >
                <p className="text-base font-semibold tracking-tight text-neutral-100">
                  {t.value}
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wide text-neutral-500">
                  {t.label}
                </p>
              </div>
            ))}
          </div>
        </footer>
      </div>
    </aside>
  )
}
