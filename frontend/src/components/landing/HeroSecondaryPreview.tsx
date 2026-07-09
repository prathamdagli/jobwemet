import { Fragment } from 'react'
import { Check } from 'lucide-react'

const DETECTED_SKILLS = [
  'Python',
  'React',
  'SQL',
  'Machine Learning',
  'Git',
] as const

const MISSING_SKILLS = ['TensorFlow', 'Docker', 'Kubernetes'] as const

const WORKFLOW = [
  { label: 'Resume', state: 'done' },
  { label: 'Analyze', state: 'done' },
  { label: 'Predict', state: 'done' },
  { label: 'Roadmap', state: 'done' },
] as const

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
 * Secondary application module shown beneath the Hero CTAs. Presented as a real
 * product window (chrome + live status) with the end-to-end workflow surfaced as
 * a completed step strip, so the left column reads as a genuine screenshot of
 * JobWeMet rather than another bordered information card.
 */
export default function HeroSecondaryPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-primary/5 ring-1 ring-border/60">
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
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />
          Live
        </span>
      </div>

      <div className="p-6">
        {/* completed workflow */}
        <div className="flex items-center py-0.5">
          {WORKFLOW.map((step, i) => (
            <Fragment key={step.label}>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check
                    className="size-3"
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                </span>
                <span className="text-xs font-medium text-foreground">
                  {step.label}
                </span>
              </div>
              {i < WORKFLOW.length - 1 && (
                <span
                  className="mx-2 h-px flex-1 bg-border"
                  aria-hidden="true"
                />
              )}
            </Fragment>
          ))}
        </div>

        <div className="my-6 h-px w-full bg-border" />

        {/* detected + missing skills, side by side */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              Detected Skills
            </p>
            <div className="flex flex-wrap gap-2.5">
              {DETECTED_SKILLS.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              Missing Skills
            </p>
            <div className="flex flex-wrap gap-2.5">
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
        </div>

        <div className="my-6 h-px w-full bg-border" />

        {/* match + progress */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Career Match
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              AI Engineer
            </p>
            <p className="text-xs text-muted-foreground">92% match</p>
            <div className="mt-3">
              <MiniBar value={92} />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Learning Progress
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">68%</p>
            <p className="text-xs text-muted-foreground">to job-ready</p>
            <div className="mt-3">
              <MiniBar value={68} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
