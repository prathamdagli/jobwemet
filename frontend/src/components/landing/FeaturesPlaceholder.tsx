import Section from './Section'

export default function FeaturesPlaceholder() {
  return (
    <Section
      id="features"
      className="flex min-h-[700px] flex-col justify-center bg-[#FCFCFC]"
    >
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Features
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
          This section will showcase the platform&rsquo;s core capabilities.
        </p>
      </div>
    </Section>
  )
}
