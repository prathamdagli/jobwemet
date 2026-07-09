import { Button } from '@/components/ui/button'
import Section from './Section'

export default function CTASection() {
  return (
    <Section id="cta" className="bg-white">
      <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card px-6 py-16 text-center sm:px-12 sm:py-20">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Ready To Map Your Career With AI?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          Start free &mdash; upload a resume and see your personalized career
          roadmap in minutes.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="gap-2 px-7 shadow-sm transition-all duration-300 hover:-translate-y-px hover:shadow-md"
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="gap-2 px-7 transition-all duration-300 hover:-translate-y-px hover:shadow-sm"
          >
            Explore Platform
          </Button>
        </div>
      </div>
    </Section>
  )
}
