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

/** Faint connected-node illustration — pure decoration, monochrome. */
function AboutIllustration() {
  return (
    <svg
      className="pointer-events-none absolute -right-10 top-10 -z-0 h-72 w-72 text-foreground/[0.05]"
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M40 60 L100 40 L160 70 L140 130 L80 150 L30 120 Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M100 40 L100 110 L140 130 M100 110 L60 120 M100 110 L80 150"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {[
        [40, 60],
        [100, 40],
        [160, 70],
        [140, 130],
        [80, 150],
        [30, 120],
        [100, 110],
        [60, 120],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="currentColor" />
      ))}
    </svg>
  )
}

export default function AboutSection() {
  const { ref, inView } = useInViewReveal<HTMLDivElement>()
  return (
    <Section id="about">
      <AboutIllustration />
      <motion.div
        ref={ref}
        variants={fadeUp}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="relative grid gap-12 lg:grid-cols-2 lg:items-center"
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

        <div className="space-y-5">
          {/* Mission card */}
          <div className="rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-8">
            <p className="text-sm font-medium text-foreground">Our Mission</p>
            <p className="mt-2 text-sm text-muted-foreground">
              To turn the noise of job descriptions and vague requirements into
              a clear, evidence-based path from the skills you have to the
              career you&rsquo;re meant for.
            </p>
          </div>

          {/* Principles as cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            {PRINCIPLES.map((principle) => (
              <div
                key={principle.title}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <CheckCircle2
                  className="size-5 text-primary"
                  aria-hidden="true"
                />
                <p className="mt-2 text-sm font-medium text-foreground">
                  {principle.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>

          {/* Built with */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
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

            {/* Founder profile card */}
            <div className="mt-6 flex items-start gap-3 rounded-xl bg-muted/40 p-4">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                PD
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Pratham Dagli
                </p>
                <p className="text-xs text-muted-foreground">
                  Founder &amp; Engineer
                </p>
                <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                  <Code
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  Designed and built by a working engineer who lived this
                  problem first-hand.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Section>
  )
}
