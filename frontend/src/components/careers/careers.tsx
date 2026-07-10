import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import {
  ArrowUpRight,
  Banknote,
  Briefcase,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CircularProgress } from '@/components/dashboard/CircularProgress'
import { ProgressBar } from '@/components/dashboard/ProgressBar'
import {
  GESTURE_LIMITS,
  cardReveal,
  heroReveal,
  listReveal,
  springSnappy,
  useCountUp,
  useInViewReveal,
} from '@/motion'

export interface Career {
  id: string
  title: string
  match: number
  description: string
  experience: string
  salary: string
  category: string
  topSkills: string[]
  missingSkills: string[]
  explanation: string
}

export function CareerCard({ career }: { career: Career }) {
  const headingId = `career-${career.id}-title`
  const panelId = `career-${career.id}-panel`
  const [open, setOpen] = useState(false)

  return (
    <motion.article
      variants={cardReveal}
      whileHover={{ y: GESTURE_LIMITS.maxTranslateY }}
      transition={springSnappy}
      aria-labelledby={headingId}
      className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-[box-shadow,border-color] duration-300 hover:border-foreground/15 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            id={headingId}
            className="truncate text-base font-semibold tracking-tight text-foreground"
          >
            {career.title}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {career.category} · {career.experience}
          </p>
        </div>
        <span className="shrink-0 text-lg font-semibold tabular-nums text-foreground">
          {career.match}%
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
        {career.description}
      </p>

      <div className="mt-4">
        <ProgressBar value={career.match} label="Match confidence" showValue />
      </div>

      {/* Progressive disclosure — collapse the detail, reveal on demand */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="mt-4 inline-flex w-fit items-center gap-1 text-xs font-medium text-foreground outline-none transition-colors hover:text-foreground/70 focus-visible:rounded focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {open ? 'Hide details' : 'Why this matches'}
        <ChevronDown
          className={cn(
            'size-3.5 transition-transform duration-200',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <motion.div
          id={panelId}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="mt-4 space-y-4 border-t border-border pt-4">
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Sparkles className="size-3.5" aria-hidden="true" />
                AI reason
              </p>
              <p className="text-xs leading-relaxed text-foreground">
                {career.explanation}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Banknote
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Salary range
                  </dt>
                  <dd className="font-medium text-foreground">
                    {career.salary}
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-xs text-muted-foreground">Experience</dt>
                  <dd className="font-medium text-foreground">
                    {career.experience}
                  </dd>
                </div>
              </div>
            </dl>

            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                Top required skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {career.topSkills.map((skill) => (
                  <Badge key={skill} variant="soft" size="xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {career.missingSkills.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Skills to close the gap
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {career.missingSkills.map((skill) => (
                    <Badge key={skill} variant="muted" size="xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button size="lg" className="flex-1" render={<Link to="/roadmap" />}>
          View Roadmap
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          render={<Link to="/skills" />}
        >
          View Details
        </Button>
      </div>
    </motion.article>
  )
}

export function TopMatchBanner({ career }: { career: Career }) {
  const { ref, inView } = useInViewReveal<HTMLElement>()
  const match = Math.round(useCountUp(career.match))
  return (
    <motion.section
      ref={ref}
      variants={heroReveal}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      aria-label="Top career match"
      className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-foreground/10 bg-gradient-to-br from-muted/50 to-card p-6 shadow-md md:flex-row md:items-center md:p-8"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-foreground/70" aria-hidden="true" />
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            #1 Career Match
          </span>
          <Badge variant="soft" size="xs" className="gap-1">
            <ArrowUpRight className="size-3" aria-hidden="true" />
            Excellent fit
          </Badge>
        </div>

        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {career.title}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {career.category} · {career.experience}
        </p>

        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {career.explanation}
        </p>

        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
          <div>
            <dt className="text-xs text-muted-foreground">Salary range</dt>
            <dd className="text-sm font-semibold text-foreground">
              {career.salary}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Field</dt>
            <dd className="text-sm font-semibold text-foreground">
              {career.category}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Experience</dt>
            <dd className="text-sm font-semibold text-foreground">
              {career.experience}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex shrink-0 items-center justify-center">
        <CircularProgress
          value={career.match}
          size={196}
          strokeWidth={14}
          label="AI confidence"
        >
          <span className="text-5xl font-semibold tracking-tight text-foreground">
            {match}%
          </span>
          <span className="mt-1 text-xs text-muted-foreground">
            AI Confidence
          </span>
        </CircularProgress>
      </div>
    </motion.section>
  )
}

interface FilterSelectProps {
  label: string
  options: string[]
}

export function FilterSelect({ label, options }: FilterSelectProps) {
  const id = `filter-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          aria-label={label}
          defaultValue={options[0]}
          className="w-full appearance-none rounded-lg border border-border bg-background py-2 pl-3 pr-8 text-sm text-foreground outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

export function InsightRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <motion.li
      variants={listReveal}
      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5"
    >
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {label}
      </span>
      <span className="text-right text-sm font-semibold text-foreground">
        {value}
      </span>
    </motion.li>
  )
}
