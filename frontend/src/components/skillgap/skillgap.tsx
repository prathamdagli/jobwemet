import { motion } from 'motion/react'
import { CheckCircle2, Clock, Plus, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/dashboard/ProgressBar'
import { listReveal, staggerChildren } from '@/motion'

export function SkillCategoryGroup({
  title,
  skills,
  tone = 'detected',
}: {
  title: string
  skills: string[]
  tone?: 'detected' | 'missing'
}) {
  const isMissing = tone === 'missing'
  const Icon = isMissing ? Plus : CheckCircle2
  return (
    <motion.div variants={staggerChildren}>
      <div className="mb-2.5 flex items-center gap-2">
        <Icon className="size-3.5 text-muted-foreground" aria-hidden="true" />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
        <span className="text-[0.65rem] font-medium tabular-nums text-muted-foreground/70">
          {skills.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge
            key={skill}
            variant={isMissing ? 'muted' : 'outline'}
            className="px-2.5 py-1 text-sm"
          >
            {skill}
          </Badge>
        ))}
      </div>
    </motion.div>
  )
}

function priorityBadgeVariant(priority: 'High' | 'Medium') {
  return priority === 'High' ? 'soft' : 'muted'
}

function difficultyBadgeVariant(difficulty: string) {
  if (difficulty === 'Hard') return 'default'
  if (difficulty === 'Medium') return 'outline'
  return 'secondary'
}

/** Decorative readiness cue derived from learning difficulty — purely visual. */
function gapReadiness(difficulty: string): number {
  if (difficulty === 'Easy') return 45
  if (difficulty === 'Hard') return 12
  return 25
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
  const readiness = gapReadiness(difficulty)
  return (
    <motion.li
      variants={listReveal}
      className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-[box-shadow,border-color] duration-300 hover:border-foreground/15 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background"
          aria-hidden="true"
        >
          {rank}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">{skill}</span>
            <Badge
              variant={priorityBadgeVariant(priority)}
              size="xs"
              className="gap-1"
            >
              {priority}
            </Badge>
            <Badge
              variant={difficultyBadgeVariant(difficulty)}
              size="xs"
              className="gap-1"
            >
              {difficulty}
            </Badge>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex shrink-0 items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              {time}
            </span>
            <ProgressBar
              value={readiness}
              size="sm"
              className="max-w-[140px] flex-1"
            />
          </div>
        </div>
      </div>
    </motion.li>
  )
}

export function RecommendationItem({ text }: { text: string }) {
  return (
    <motion.li
      variants={listReveal}
      className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 p-3"
    >
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground/10">
        <Sparkles className="size-3 text-foreground" aria-hidden="true" />
      </span>
      <span className="text-sm leading-relaxed text-foreground">{text}</span>
    </motion.li>
  )
}
