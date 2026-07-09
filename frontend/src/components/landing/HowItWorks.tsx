import { motion } from 'motion/react'
import { Map, Sparkles, Trophy, Upload } from 'lucide-react'
import Section from './Section'
import { timelineReveal, useInViewReveal } from '@/motion'

const STEPS = [
  {
    title: 'Upload Resume',
    description:
      'Upload a resume or LinkedIn profile. Our AI extracts your technical and professional skills in seconds.',
    icon: Upload,
  },
  {
    title: 'AI Skill Analysis',
    description:
      'We analyze your strengths, identify missing skills, and generate career compatibility scores.',
    icon: Sparkles,
  },
  {
    title: 'Personalized Roadmap',
    description:
      'Get a customized learning roadmap with recommended courses, certifications, and prioritized next steps.',
    icon: Map,
  },
  {
    title: 'Become Job Ready',
    description:
      'Track your progress, measure your readiness, and apply to roles with confidence.',
    icon: Trophy,
  },
] as const

function TimelineStep({
  step,
  index,
}: {
  step: (typeof STEPS)[number]
  index: number
}) {
  const { ref, inView } = useInViewReveal<HTMLLIElement>()
  return (
    <motion.li
      ref={ref}
      variants={timelineReveal}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className="relative flex gap-5 sm:gap-6"
    >
      <div className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-card text-primary shadow-sm">
        <step.icon className="size-5" aria-hidden="true" />
      </div>
      <div className="flex-1 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Step {index + 1}
        </p>
        <h3 className="mt-1.5 text-lg font-semibold text-foreground">
          {step.title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
      </div>
    </motion.li>
  )
}

export default function HowItWorks() {
  return (
    <Section id="how-it-works" className="bg-white">
      <div className="mx-auto max-w-2xl text-center">
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

      <ol className="relative mx-auto mt-14 max-w-3xl">
        <div
          className="absolute left-6 top-6 bottom-6 w-0.5 -translate-x-1/2 bg-border"
          aria-hidden="true"
        />
        <div className="space-y-8 sm:space-y-10">
          {STEPS.map((step, i) => (
            <TimelineStep key={step.title} step={step} index={i} />
          ))}
        </div>
      </ol>
    </Section>
  )
}
