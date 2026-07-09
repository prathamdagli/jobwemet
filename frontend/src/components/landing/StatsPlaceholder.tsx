import Section from './Section'

export default function StatsPlaceholder() {
  return (
    <Section
      id="stats"
      className="flex min-h-[600px] flex-col justify-center bg-white"
    >
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Statistics
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
          This section will display platform insights.
        </p>
      </div>
    </Section>
  )
}
