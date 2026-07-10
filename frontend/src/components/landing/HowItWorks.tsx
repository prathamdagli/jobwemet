import { motion } from 'motion/react'
import {
  Check,
  Map,
  Sparkles,
  Trophy,
  Upload,
  type LucideIcon,
} from 'lucide-react'
import Section from './Section'
import { timelineReveal, useInViewReveal } from '@/motion'

const STEPS: {
  title: string
  description: string
  icon: LucideIcon
  mini: 'upload' | 'analyze' | 'roadmap' | 'ready'
}[] = [
  {
    title: 'Upload Resume',
    description:
      'Upload a resume or LinkedIn profile. Our AI extracts your technical and professional skills in seconds.',
    icon: Upload,
    mini: 'upload',
  },
  {
    title: 'AI Skill Analysis',
    description:
      'We analyze your strengths, identify missing skills, and generate career compatibility scores.',
    icon: Sparkles,
    mini: 'analyze',
  },
  {
    title: 'Personalized Roadmap',
    description:
      'Get a customized learning roadmap with recommended courses, certifications, and prioritized next steps.',
    icon: Map,
    mini: 'roadmap',
  },
  {
    title: 'Become Job Ready',
    description:
      'Track your progress, measure your readiness, and apply to roles with confidence.',
    icon: Trophy,
    mini: 'ready',
  },
]

/** Compact "mini screenshot" revealed when a step card is hovered. */
function StepMini({ kind }: { kind: (typeof STEPS)[number]['mini'] }) {
  if (kind === 'upload') {
    return (
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
        <span className="flex items-center gap-2 text-xs font-medium text-foreground">
          <Upload className="size-3.5" aria-hidden="true" /> resume.pdf
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
          <Check className="size-3" aria-hidden="true" /> Parsed
        </span>
      </div>
    )
  }
  if (kind === 'analyze') {
    return (
      <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
          AI is analyzing
          <span
            className="ml-auto flex items-center gap-0.5"
            aria-hidden="true"
          >
            <span className="size-1 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
            <span className="size-1 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
            <span className="size-1 animate-bounce rounded-full bg-primary" />
          </span>
        </div>
        <div className="hero-shimmer mt-2 h-1 w-full rounded-full" />
      </div>
    )
  }
  if (kind === 'roadmap') {
    return (
      <ol className="space-y-0 rounded-lg border border-border bg-muted/30 px-3 py-2">
        {['Machine Learning', 'Deep Learning', 'MLOps'].map((t, i, a) => (
          <li key={t} className="flex gap-2.5">
            <span className="flex flex-col items-center">
              <span
                className={
                  i === a.length - 1
                    ? 'size-2.5 rounded-full border border-border'
                    : 'size-2.5 rounded-full bg-primary'
                }
              />
              {i < a.length - 1 && (
                <span className="my-1 w-px flex-1 bg-border" />
              )}
            </span>
            <span className="pb-2 text-[11px] text-foreground">{t}</span>
          </li>
        ))}
      </ol>
    )
  }
  // ready
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
      <span className="inline-flex size-9 items-center justify-center rounded-full border-2 border-primary text-xs font-semibold text-primary">
        68%
      </span>
      <div>
        <p className="text-xs font-medium text-foreground">Job ready</p>
        <p className="text-[10px] text-muted-foreground">
          Readiness score live
        </p>
      </div>
    </div>
  )
}

function TimelineStep({
  step,
  index,
}: {
  step: (typeof STEPS)[number]
  index: number
}) {
  const { ref, inView } = useInViewReveal<HTMLLIElement>()
  const Icon: LucideIcon = step.icon
  return (
    <motion.li
      ref={ref}
      variants={timelineReveal}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className="group relative flex gap-5 sm:gap-6"
    >
      {/* node with number badge + active pulse */}
      <div className="relative z-10 flex size-12 shrink-0 items-center justify-center">
        <span className="absolute inline-flex size-12 animate-ping rounded-full bg-primary/10" />
        <span className="relative inline-flex size-12 items-center justify-center rounded-full border border-border bg-card text-primary shadow-sm">
          <span className="text-sm font-semibold tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
        </span>
      </div>

      {/* card — expands on hover to reveal a mini screenshot */}
      <div className="flex-1 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Step {index + 1}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">
              {step.title}
            </h3>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>

        {/* hover-revealed mini UI */}
        <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr]">
          <div className="overflow-hidden">
            <div className="pt-4">
              <StepMini kind={step.mini} />
            </div>
          </div>
        </div>
      </div>
    </motion.li>
  )
}

export default function HowItWorks() {
  const { ref, inView } = useInViewReveal<HTMLDivElement>({ amount: 0.2 })
  return (
    <Section id="how-it-works">
      <div className="relative mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-primary">How It Works</p>
        <h2
          id="how-it-works-heading"
          className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          A Clear Path From Resume To Job-Ready
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          Four steps turn the skills you have today into the career you&rsquo;re
          meant for &mdash; with AI doing the heavy lifting.
        </p>
      </div>

      <div ref={ref} className="relative mx-auto mt-14 max-w-3xl">
        {/* animated connecting line — draws downward as the section reveals */}
        <motion.div
          className="absolute left-6 top-6 bottom-6 w-0.5 -translate-x-1/2 origin-top bg-gradient-to-b from-primary/40 via-border to-transparent"
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        />
        <ol className="space-y-8 sm:space-y-10">
          {STEPS.map((step, i) => (
            <TimelineStep key={step.title} step={step} index={i} />
          ))}
        </ol>
      </div>
    </Section>
  )
}
