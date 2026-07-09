import Section from './Section'

export default function HowItWorksPlaceholder() {
  return (
    <Section
      id="how-it-works"
      className="flex min-h-[700px] flex-col justify-center bg-white"
    >
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          How It Works
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
          This section will walk through the step-by-step process.
        </p>
      </div>
    </Section>
  )
}
