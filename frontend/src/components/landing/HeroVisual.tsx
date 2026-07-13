import { CheckCircle2, Lock, Radio, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { useCountUp, useMouseTilt } from '@/motion'

function ProgressBar({ value }: { value: number }) {
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-primary transition-all duration-700"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

/** Tiny monochrome sparkline with a gently pulsing tip — "live" graph motion. */
function Sparkline() {
  const points = [14, 11, 15, 9, 12, 6, 8, 4]
  const w = 108
  const h = 34
  const step = w / (points.length - 1)
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${p}`)
    .join(' ')
  const tipX = (points.length - 1) * step
  const tipY = points[points.length - 1]

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-8 w-full text-primary"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={`${path} L ${w} ${h} L 0 ${h} Z`}
        className="fill-primary/10"
        stroke="none"
      />
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={tipX}
        cy={tipY}
        r="2.5"
        className="hero-graph-tip fill-primary"
      />
    </svg>
  )
}

const DETECTED_SKILLS = [
  'Python',
  'React',
  'SQL',
  'Machine Learning',
  'Git',
] as const

const CAREER_MATCHES = [
  { role: 'AI Engineer', pct: 92, primary: true },
  { role: 'ML Engineer', pct: 87, primary: false },
  { role: 'Data Scientist', pct: 84, primary: false },
] as const

const MISSING_SKILLS = [
  'TensorFlow',
  'Docker',
  'Kubernetes',
  'FastAPI',
] as const

const ROADMAP = [
  { title: 'Machine Learning', status: 'Completed' },
  { title: 'Deep Learning', status: 'Current' },
  { title: 'MLOps', status: 'Locked' },
] as const

const ACTIVITY = [
  { text: 'Matched AI Engineer role', time: 'now' },
  { text: 'Parsed 5 skills from resume', time: '2s' },
  { text: 'Generated learning roadmap', time: '4s' },
] as const

const RING_RADIUS = 34
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS
const RING_READINESS = 68

function Divider() {
  return <div className="my-5 h-px w-full bg-border" />
}

/**
 * HeroVisual — the JobWeMet workspace rendered as a credible product window.
 *
 * It sits on a real perspective: `useMouseTilt` (capped at 4°, straight from the
 * motion system) tilts the whole window toward the cursor, a soft reflection and
 * layered shadow give depth, and window chrome + a live status rail + activity
 * feed + mini charts make it read as a running application rather than a mockup.
 * Reduced motion disables the tilt (the hook no-ops) and the pulse/shimmer.
 */
export default function HeroVisual() {
  const { ref, style, onMouseMove, onMouseLeave } = useMouseTilt({ maxTilt: 4 })
  const readiness = useCountUp(RING_READINESS, { duration: 1.4, delay: 0.3 })

  return (
    <div
      className="relative mx-auto w-full max-w-xl"
      style={{ perspective: 1400 }}
    >
      <motion.div
        ref={ref}
        style={style}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10 ring-1 ring-border/60"
      >
        {/* top reflection sheen */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-foreground/[0.04] to-transparent"
          aria-hidden="true"
        />

        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-5 py-3">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
          </span>
          <span className="ml-1.5 text-xs font-medium text-muted-foreground">
            JobWeMet Workspace
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            <Radio className="size-3 text-primary" aria-hidden="true" />
            AI online
          </span>
        </div>

        <div className="p-6 sm:p-7">
          {/* header + live status */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="size-5 text-primary" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  AI Skill Analysis
                </p>
                <p className="text-xs text-muted-foreground">Live Analysis</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-primary opacity-70" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              Analyzing…
            </span>
          </div>

          {/* live processing shimmer bar */}
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div className="hero-shimmer h-full w-full rounded-full" />
          </div>

          <Divider />

          {/* detected skills */}
          <div>
            <p className="mb-2.5 text-xs font-medium text-muted-foreground">
              Detected Skills
            </p>
            <ul className="flex flex-wrap gap-2">
              {DETECTED_SKILLS.map((skill) => (
                <li
                  key={skill}
                  className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-foreground"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>

          <Divider />

          {/* career prediction + sparkline */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Career Prediction
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                <span className="hero-graph-tip inline-block size-1.5 rounded-full bg-primary" />
                trending
              </span>
            </div>
            <div className="mb-4 rounded-lg border border-border bg-muted/20 px-3 py-2">
              <Sparkline />
            </div>
            <div className="space-y-4">
              {CAREER_MATCHES.map((match) => (
                <div key={match.role}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span
                      className={
                        match.primary
                          ? 'font-semibold text-foreground'
                          : 'text-muted-foreground'
                      }
                    >
                      {match.role}
                    </span>
                    <span
                      className={
                        match.primary
                          ? 'font-semibold text-foreground'
                          : 'text-muted-foreground'
                      }
                    >
                      {match.pct}%
                    </span>
                  </div>
                  <ProgressBar value={match.pct} />
                </div>
              ))}
            </div>
          </div>

          <Divider />

          {/* skill gap */}
          <div>
            <p className="mb-2.5 text-xs font-medium text-muted-foreground">
              Skill Gap
            </p>
            <ul className="flex flex-wrap gap-2">
              {MISSING_SKILLS.map((skill) => (
                <li
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1 text-xs font-medium text-muted-foreground"
                >
                  <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                  {skill}
                </li>
              ))}
            </ul>
          </div>

          <Divider />

          {/* learning roadmap */}
          <div>
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              Learning Roadmap
            </p>
            <ol className="space-y-0">
              {ROADMAP.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {step.status === 'Completed' ? (
                      <CheckCircle2 className="size-5 text-primary" />
                    ) : step.status === 'Current' ? (
                      <span className="inline-flex size-5 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                        <span className="size-2 animate-pulse rounded-full bg-primary" />
                      </span>
                    ) : (
                      <span className="inline-flex size-5 items-center justify-center rounded-full border border-border bg-muted/40">
                        <Lock className="size-3 text-muted-foreground" />
                      </span>
                    )}
                    {i < ROADMAP.length - 1 && (
                      <span className="my-1 w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div className="flex flex-1 items-center justify-between pb-6">
                    <span className="text-sm font-medium text-foreground">
                      {step.title}
                    </span>
                    <span
                      className={
                        step.status === 'Locked'
                          ? 'rounded-full bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground'
                          : 'rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'
                      }
                    >
                      {step.status}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <Divider />

          {/* confidence ring + activity feed */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div
              className="flex items-center gap-4"
              role="progressbar"
              aria-label="Overall career readiness"
              aria-valuenow={RING_READINESS}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="relative size-20 shrink-0">
                <svg
                  viewBox="0 0 80 80"
                  className="size-20 -rotate-90"
                  aria-hidden="true"
                >
                  <circle
                    cx="40"
                    cy="40"
                    r={RING_RADIUS}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="7"
                    className="text-muted-foreground/25"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r={RING_RADIUS}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={
                      RING_CIRCUMFERENCE * (1 - readiness / 100)
                    }
                    className="text-primary transition-all duration-300"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-foreground">
                  {readiness}%
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Career Readiness
                </p>
                <p className="text-xs text-muted-foreground">
                  Skills, matches &amp; roadmap
                </p>
              </div>
            </div>

            {/* live activity feed */}
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-primary opacity-70" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                </span>
                <p className="text-[11px] font-medium text-muted-foreground">
                  Live Activity
                </p>
              </div>
              <ul className="space-y-1.5">
                {ACTIVITY.map((item) => (
                  <li
                    key={item.text}
                    className="flex items-center justify-between gap-2 text-[11px]"
                  >
                    <span className="flex items-center gap-1.5 truncate text-foreground">
                      <CheckCircle2
                        className="size-3 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.text}</span>
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {item.time}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
