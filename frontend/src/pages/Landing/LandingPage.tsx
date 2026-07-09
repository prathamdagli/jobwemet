import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import StatsPlaceholder from '@/components/landing/StatsPlaceholder'
import FeaturesPlaceholder from '@/components/landing/FeaturesPlaceholder'
import HowItWorksPlaceholder from '@/components/landing/HowItWorksPlaceholder'
import TestimonialsPlaceholder from '@/components/landing/TestimonialsPlaceholder'
import CTAPlaceholder from '@/components/landing/CTAPlaceholder'
import FooterPlaceholder from '@/components/landing/FooterPlaceholder'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsPlaceholder />
        <FeaturesPlaceholder />
        <HowItWorksPlaceholder />
        <TestimonialsPlaceholder />
        <CTAPlaceholder />
      </main>
      <FooterPlaceholder />
    </>
  )
}
