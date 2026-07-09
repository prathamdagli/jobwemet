import Section from './Section'

export default function CTAPlaceholder() {
  return (
    <Section
      id="cta"
      className="flex min-h-[500px] flex-col justify-center bg-white"
    >
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Get Started
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
          This section will invite visitors to begin their journey.
        </p>
      </div>
    </Section>
  )
}
