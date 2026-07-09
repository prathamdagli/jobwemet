import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
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
import { ProgressBar } from '@/components/dashboard/ProgressBar'

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
  return (
    <article
      aria-labelledby={headingId}
      className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3
            id={headingId}
            className="text-base font-semibold tracking-tight text-foreground"
          >
            {career.title}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {career.category}
          </p>
        </div>
        <span className="text-lg font-semibold tabular-nums text-foreground">
          {career.match}%
        </span>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{career.description}</p>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Briefcase
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <div>
            <dt className="text-xs text-muted-foreground">Experience</dt>
            <dd className="font-medium text-foreground">{career.experience}</dd>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Banknote
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <div>
            <dt className="text-xs text-muted-foreground">Salary range</dt>
            <dd className="font-medium text-foreground">{career.salary}</dd>
          </div>
        </div>
      </dl>

      <div className="mt-4">
        <ProgressBar value={career.match} label="Match" showValue />
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            Top required skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {career.topSkills.map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            Missing skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {career.missingSkills.map((skill) => (
              <Badge key={skill} variant="muted" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
        <Sparkles
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="text-xs text-foreground">{career.explanation}</p>
      </div>

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
    </article>
  )
}

export function TopMatchBanner({ career }: { career: Career }) {
  return (
    <section
      aria-label="Top career match"
      className="flex flex-col gap-4 rounded-2xl border border-border bg-primary p-6 text-primary-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="size-4" aria-hidden="true" />
          <span className="text-xs font-medium uppercase tracking-wide opacity-80">
            Best Career Match
          </span>
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {career.title}
        </h2>
        <p className="mt-1 text-sm opacity-80">
          {career.match}% AI Confidence · {career.explanation}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-4xl font-semibold tabular-nums">
          {career.match}%
        </span>
        <Badge
          variant="secondary"
          className="shrink-0 gap-1 bg-primary-foreground text-primary"
        >
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
          Excellent Fit
        </Badge>
      </div>
    </section>
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
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
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
    <li className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {label}
      </span>
      <span
        className={cn('text-sm font-semibold text-foreground', 'text-right')}
      >
        {value}
      </span>
    </li>
  )
}
