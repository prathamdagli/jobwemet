import { motion } from 'motion/react'
import { CheckCircle2, Code } from 'lucide-react'
import Section from './Section'
import { fadeUp, useInViewReveal } from '@/motion'

const PRINCIPLES = [
  {
    title: 'Clarity over noise',
    description:
      'We surface the few skills that matter, not a hundred you will never use.',
  },
  {
    title: 'Skills, not keywords',
    description:
      'Real capability beats a keyword-stuffed resume every single time.',
  },
  {
    title: 'A path, not a pile of links',
    description:
      'You get a sequenced roadmap, not a random list of courses to scroll past.',
  },
] as const

const TECH = [
  'React',
  'TypeScript',
  'Firebase',
  'Tailwind CSS',
  'AI / ML',
] as const

export default function AboutSection() {
  const { ref, inView } = useInViewReveal<HTMLDivElement>()
  return (
    <Section id="about" className="bg-[#FCFCFC]">
      <motion.div
        ref={ref}
        variants={fadeUp}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="grid gap-12 lg:grid-cols-2 lg:items-center"
      >
        <div>
          <p className="text-sm font-medium text-primary">Our Story</p>
          <h2
            id="about-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            Built From A Real Career Struggle
          </h2>
          <div className="mt-5 space-y-4 text-base text-muted-foreground">
            <p>
              JobWeMet began as a personal project. Like countless developers,
              our founder had the skills but no clear map of where they led
              &mdash; endless job descriptions, vague requirements, and no way
              to know which abilities actually mattered.
            </p>
            <p>
              So we built the tool we wished existed: one that reads your
              resume, understands your strengths, and lays out the exact path to
              the role you want. Today JobWeMet helps students, career
              switchers, and working engineers turn that confusion into a
              concrete plan.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-8">
          <p className="text-sm font-medium text-foreground">Our Mission</p>
          <p className="mt-2 text-sm text-muted-foreground">
            To turn the noise of job descriptions and vague requirements into a
            clear, evidence-based path from the skills you have to the career
            you&rsquo;re meant for.
          </p>

          <div className="my-6 h-px w-full bg-border" />

          <p className="text-sm font-medium text-foreground">What We Believe</p>
          <ul className="mt-4 space-y-4">
            {PRINCIPLES.map((principle) => (
              <li key={principle.title} className="flex gap-3">
                <CheckCircle2
                  className="size-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {principle.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {principle.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="my-6 h-px w-full bg-border" />

          <p className="text-sm font-medium text-foreground">Built With</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {TECH.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-foreground"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl bg-muted/40 p-4">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Code className="size-4" aria-hidden="true" />
            </span>
            <p className="text-sm text-muted-foreground">
              Designed and built by a working engineer who lived this problem
              first-hand.
            </p>
          </div>
        </div>
      </motion.div>
    </Section>
  )
}
