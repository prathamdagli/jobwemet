import type { ReactNode } from 'react'
import type { MotionValue } from 'motion/react'
import { motion, useTransform } from 'motion/react'
import {
  CheckCircle2,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { fadeIn, useMouseTilt, usePrefersReducedMotion } from '@/motion'

/**
 * HeroFloatingModules — premium "product notification" cards that float around
 * the dashboard window. They read as live signals from the app (career match,
 * resume parsed, AI processing, learning progress) rather than decorative boxes.
 *
 * Motion is assembled entirely from `src/motion`:
 *   - `useMouseTilt` gives each module a tiny cursor-reactive 3D tilt (≤3°)
 *   - `fadeIn` reveals them (opacity only, so it never fights the scroll `y`)
 *   - a `scrollYProgress` MotionValue drives a gentle divergent drift so the
 *     modules separate naturally as the hero scrolls away.
 * Everything collapses to a static layout under prefers-reduced-motion.
 */

type Spread = 'up' | 'down'

interface ModuleConfig {
  title: string
  sub: string
  icon: LucideIcon
  pos: string
  spread: Spread
  progress?: number
  badge?: string
  live?: boolean
}

const MODULES: ModuleConfig[] = [
  {
    title: 'Career Match',
    sub: 'AI Engineer · 92%',
    icon: Sparkles,
    pos: '-right-7 -top-5',
    spread: 'up',
    progress: 92,
    badge: 'New',
  },
  {
    title: 'Resume Parsed',
    sub: '5 skills extracted',
    icon: CheckCircle2,
    pos: '-left-9 top-1/3',
    spread: 'up',
  },
  {
    title: 'AI Processing',
    sub: 'Mapping your skills…',
    icon: Sparkles,
    pos: '-left-7 -bottom-9',
    spread: 'down',
    live: true,
  },
  {
    title: 'Learning Progress',
    sub: '68% to job-ready',
    icon: TrendingUp,
    pos: '-right-7 -bottom-5',
    spread: 'down',
    progress: 68,
  },
]

function ModuleCard({
  cfg,
  index,
  scrollYProgress,
}: {
  cfg: ModuleConfig
  index: number
  scrollYProgress: MotionValue<number>
}) {
  const prefersReduced = usePrefersReducedMotion()
  const {
    ref,
    style: tiltStyle,
    onMouseMove,
    onMouseLeave,
  } = useMouseTilt({
    maxTilt: 3,
  })

  // Divergent drift: top modules lift, bottom modules sink, as you scroll.
  const drift = prefersReduced ? 0 : cfg.spread === 'up' ? -16 : 16
  const y = useTransform(scrollYProgress, [0, 1], [0, drift])

  const style = prefersReduced ? tiltStyle : { ...tiltStyle, y }
  const Icon: LucideIcon = cfg.icon

  return (
    <motion.div
      ref={ref}
      style={style}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: 0.45 + index * 0.1, duration: 0.5 }}
      className={`absolute ${cfg.pos} hidden w-52 sm:block`}
    >
      <div className="pointer-events-auto relative rounded-xl border border-border bg-card p-3 shadow-xl shadow-primary/5 ring-1 ring-border/50">
        {cfg.badge && (
          <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground shadow-sm">
            {cfg.badge}
          </span>
        )}
        <div className="flex items-center gap-2.5">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="size-4 text-primary" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">
              {cfg.title}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {cfg.sub}
            </p>
          </div>
          {cfg.live && (
            <span className="ml-auto flex size-2 shrink-0">
              <span className="absolute inline-flex size-2 animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
          )}
        </div>
        {cfg.progress !== undefined && (
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${cfg.progress}%` }}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function HeroFloatingModules({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>
}): ReactNode {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {MODULES.map((cfg, i) => (
        <ModuleCard
          key={cfg.title}
          cfg={cfg}
          index={i}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </div>
  )
}
