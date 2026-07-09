import { Clock, Signal, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function SkillCategoryGroup({
  title,
  skills,
  tone = 'detected',
}: {
  title: string
  skills: string[]
  tone?: 'detected' | 'missing'
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge
            key={skill}
            variant={tone === 'missing' ? 'muted' : 'outline'}
            className="px-2.5 py-1 text-sm"
          >
            {skill}
          </Badge>
        ))}
      </div>
    </div>
  )
}

export function PriorityItem({
  rank,
  skill,
  priority,
  time,
  difficulty,
}: {
  rank: number
  skill: string
  priority: 'High' | 'Medium'
  time: string
  difficulty: string
}) {
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
          {rank}
        </span>
        <span className="font-medium text-foreground">{skill}</span>
        <Badge
          variant={priority === 'High' ? 'secondary' : 'outline'}
          className="gap-1"
        >
          {priority} Priority
        </Badge>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" aria-hidden="true" />
          {time}
        </span>
        <span className="flex items-center gap-1">
          <Signal className="size-3.5" aria-hidden="true" />
          {difficulty}
        </span>
      </div>
    </li>
  )
}

export function RecommendationItem({ text }: { text: string }) {
  return (
    <li className="flex gap-2.5">
      <Sparkles
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <span className="text-sm text-foreground">{text}</span>
    </li>
  )
}
