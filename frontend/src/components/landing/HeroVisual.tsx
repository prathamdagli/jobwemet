import { CheckCircle2, Lock, Puzzle, Sparkles, Target } from 'lucide-react'

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

const RING_RADIUS = 34
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS
const RING_READINESS = 68

export default function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      {/* subtle connection lines linking the card to its floating highlights */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full text-muted-foreground/30"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path
          d="M30% 80% C 20% 84%, 12% 90%, 2% 96%"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="3 5"
        />
        <path
          d="M82% 14% C 90% 10%, 96% 6%, 100% 2%"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="3 5"
        />
      </svg>

      {/* main dashboard card — live platform preview */}
      <div className="relative rounded-2xl border border-border bg-card p-7 shadow-2xl shadow-primary/5 ring-1 ring-border/60 sm:p-8">
        {/* header */}
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
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            Analyzing...
          </span>
        </div>

        <div className="my-6 h-px w-full bg-border" />

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

        <div className="my-6 h-px w-full bg-border" />

        {/* career prediction */}
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">
            Career Prediction
          </p>
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

        <div className="my-6 h-px w-full bg-border" />

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

        <div className="my-6 h-px w-full bg-border" />

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

        <div className="my-6 h-px w-full bg-border" />

        {/* confidence */}
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
                  RING_CIRCUMFERENCE * (1 - RING_READINESS / 100)
                }
                className="text-primary transition-all duration-1000"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-foreground">
              {RING_READINESS}%
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Overall Career Readiness
            </p>
            <p className="text-xs text-muted-foreground">
              Based on your skills, matches &amp; roadmap
            </p>
          </div>
        </div>
      </div>

      {/* floating highlight: skill gap — frames lower-left corner */}
      <div className="absolute -left-6 -bottom-7 hidden w-44 rounded-xl border border-border bg-background p-3 shadow-lg transition-transform duration-300 hover:-translate-y-1 sm:block">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary/10">
            <Puzzle className="size-4 text-primary" />
          </span>
          <div>
            <p className="text-xs font-semibold text-foreground">
              Skill Gap Found
            </p>
            <p className="text-xs text-muted-foreground">4 skills to learn</p>
          </div>
        </div>
      </div>

      {/* floating highlight: new job match — frames upper-right corner */}
      <div className="absolute -right-6 -top-6 hidden w-44 rounded-xl border border-border bg-background p-3 shadow-lg transition-transform duration-300 hover:-translate-y-1 sm:block">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary/10">
            <Target className="size-4 text-primary" />
          </span>
          <div>
            <p className="text-xs font-semibold text-foreground">
              New Job Match
            </p>
            <p className="text-xs text-muted-foreground">AI Engineer · 92%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
