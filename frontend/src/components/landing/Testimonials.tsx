import { Star } from 'lucide-react'
import Section from './Section'

const TESTIMONIALS = [
  {
    name: 'Maya Patel',
    role: 'Computer Science Student',
    quote:
      'I had a stack of side projects but no idea which roles fit me. JobWeMet mapped my skills to AI Engineering and showed the exact courses to take.',
    initials: 'MP',
  },
  {
    name: 'Daniel Osei',
    role: 'Career Switcher',
    quote:
      'Moving from teaching into tech felt impossible. The skill-gap breakdown made the path concrete instead of overwhelming.',
    initials: 'DO',
  },
  {
    name: 'Lena Novak',
    role: 'Frontend Developer',
    quote:
      'The roadmap kept me accountable. Six months in, I landed a product-engineer role I would have overlooked before.',
    initials: 'LN',
  },
] as const

export default function Testimonials() {
  return (
    <Section id="testimonials" className="bg-[#FCFCFC]">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-primary">Testimonials</p>
        <h2
          id="testimonials-heading"
          className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Real People, Real Career Shifts
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          JobWeMet is built for students, career switchers, and working
          developers alike.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <div
              className="flex gap-0.5 text-primary"
              role="img"
              aria-label="Rated 5 out of 5"
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4" fill="currentColor" />
              ))}
            </div>
            <blockquote className="text-sm text-foreground">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-auto flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {t.initials}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  )
}
