import { Map, Sparkles, Trophy, Upload } from 'lucide-react'
import Section from './Section'

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
          className="absolute left-5 top-5 bottom-5 w-px bg-border"
          aria-hidden="true"
        />
        <div className="space-y-10">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative flex gap-5">
              <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-primary">
                <step.icon className="size-5" aria-hidden="true" />
              </div>
              <div className="flex-1 pt-1.5">
                <p className="text-xs font-medium text-primary">Step {i + 1}</p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </div>
      </ol>
    </Section>
  )
}
