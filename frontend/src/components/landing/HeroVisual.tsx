import { BookOpen, CheckCircle2, Code2, TrendingUp } from 'lucide-react'

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
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

const MISSING_SKILLS = ['TensorFlow', 'Docker', 'Kubernetes'] as const

export default function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      {/* subtle connection lines behind the dashboard */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full text-muted-foreground/25"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path
          d="M50% 14% C 30% 14%, 28% 60%, 12% 78%"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 5"
        />
        <path
          d="M86% 22% C 92% 40%, 92% 60%, 88% 76%"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 5"
        />
      </svg>

      {/* main dashboard card */}
      <div className="relative rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-muted">
              <Code2 className="size-5 text-primary" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Skill Analysis
              </p>
              <p className="text-xs text-muted-foreground">
                Live profile snapshot
              </p>
            </div>
          </div>
          <span className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            AI
          </span>
        </div>

        {/* top skill */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Python</span>
            <span className="font-medium text-foreground">95%</span>
          </div>
          <ProgressBar value={95} />
        </div>

        <div className="my-5 h-px w-full bg-border" />

        {/* career match */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Best Career Match</p>
            <p className="text-sm font-semibold text-foreground">AI Engineer</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            <TrendingUp className="size-3.5" />
            92% Match
          </span>
        </div>

        {/* missing skills */}
        <div className="mt-5">
          <p className="mb-2 text-xs text-muted-foreground">Missing Skills</p>
          <div className="flex flex-wrap gap-2">
            {MISSING_SKILLS.map((skill) => (
              <span
                key={skill}
                className="rounded-md border border-dashed border-border px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* recommended course */}
        <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">
              Recommended Course
            </p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Machine Learning Specialization
          </p>
          <div className="mt-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">68%</span>
            </div>
            <ProgressBar value={68} />
          </div>
        </div>
      </div>

      {/* floating highlight: skill gap */}
      <div className="absolute -left-5 bottom-10 hidden w-44 rounded-xl border border-border bg-background p-3 shadow-lg sm:block">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-md bg-muted">
            <CheckCircle2 className="size-4 text-primary" />
          </span>
          <div>
            <p className="text-xs font-semibold text-foreground">
              Skill Gap Detected
            </p>
            <p className="text-xs text-muted-foreground">3 skills to learn</p>
          </div>
        </div>
      </div>

      {/* floating highlight: roadmap progress */}
      <div className="absolute -right-4 -top-6 hidden w-40 rounded-xl border border-border bg-background p-3 text-right shadow-lg sm:block">
        <p className="text-2xl font-semibold tracking-tight text-foreground">
          68%
        </p>
        <p className="text-xs text-muted-foreground">Roadmap Complete</p>
      </div>
    </div>
  )
}
