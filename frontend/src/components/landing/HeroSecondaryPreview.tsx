import { CheckCircle2 } from 'lucide-react'

const DETECTED_SKILLS = [
  'Python',
  'React',
  'SQL',
  'Machine Learning',
  'Git',
] as const

const MISSING_SKILLS = ['TensorFlow', 'Docker', 'Kubernetes'] as const

function MiniBar({ value }: { value: number }) {
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
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

/**
 * Secondary application module shown beneath the Hero CTAs. Mirrors the visual
 * language of the main dashboard (pills, dividers, progress indicators) so the
 * left column reads as a second, genuine product screenshot.
 */
export default function HeroSecondaryPreview() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm ring-1 ring-border/60 sm:p-5">
      {/* resume status */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Resume Uploaded
            </p>
            <p className="text-xs text-muted-foreground">Parsed moments ago</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-primary">
          <CheckCircle2 className="size-3.5" aria-hidden="true" />
          Successfully Parsed
        </span>
      </div>

      <div className="my-4 h-px w-full bg-border" />

      {/* detected skills */}
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Detected Skills
      </p>
      <div className="flex flex-wrap gap-2">
        {DETECTED_SKILLS.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-foreground"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="my-4 h-px w-full bg-border" />

      {/* match + progress */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Career Match
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            AI Engineer
          </p>
          <p className="text-xs text-muted-foreground">92% match</p>
          <div className="mt-2">
            <MiniBar value={92} />
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Learning Progress
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">68%</p>
          <p className="text-xs text-muted-foreground">to job-ready</p>
          <div className="mt-2">
            <MiniBar value={68} />
          </div>
        </div>
      </div>

      <div className="my-4 h-px w-full bg-border" />

      {/* missing skills */}
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Missing Skills
      </p>
      <div className="flex flex-wrap gap-2">
        {MISSING_SKILLS.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1 text-xs font-medium text-muted-foreground"
          >
            <span className="size-1.5 rounded-full bg-muted-foreground/50" />
            {skill}
          </span>
        ))}
      </div>
    </div>
  )
}
