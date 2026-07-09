import Section from './Section'

export default function TestimonialsPlaceholder() {
  return (
    <Section
      id="testimonials"
      className="flex min-h-[600px] flex-col justify-center bg-[#FCFCFC]"
    >
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Testimonials
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
          This section will feature stories from users who found their path.
        </p>
      </div>
    </Section>
  )
}
