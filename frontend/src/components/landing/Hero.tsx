import HeroBadge from './HeroBadge'
import HeroButtons from './HeroButtons'
import HeroVisual from './HeroVisual'

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-32 lg:pt-40">
      <div className="mx-auto grid max-w-[1280px] items-center gap-16 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-6">
          <HeroBadge />
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Transform Your Skills Into{' '}
            <span className="text-primary">Career Opportunities</span> With AI
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            JobWeMet reads your resume to understand the skills you already
            have, predicts the careers you are best suited for, and pinpoints
            exactly what is missing to reach them.
          </p>
          <p className="max-w-xl text-lg text-muted-foreground">
            From there it builds a personalized learning roadmap, recommends the
            right courses, and tracks your progress until you are truly
            job-ready.
          </p>
          <HeroButtons />
        </div>
        <div className="relative">
          <HeroVisual />
        </div>
      </div>
    </section>
  )
}
