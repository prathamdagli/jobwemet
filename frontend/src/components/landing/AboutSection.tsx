import { CheckCircle2 } from 'lucide-react'
import Section from './Section'

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

export default function AboutSection() {
  return (
    <Section id="about" className="bg-[#FCFCFC]">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
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

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7">
          <p className="text-sm font-semibold text-foreground">
            What We Believe
          </p>
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
        </div>
      </div>
    </Section>
  )
}
