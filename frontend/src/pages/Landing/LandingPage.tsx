import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import StatsSection from '@/components/landing/StatsSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
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
        <StatsSection />
        <FeaturesSection />
        <HowItWorksPlaceholder />
        <TestimonialsPlaceholder />
        <CTAPlaceholder />
      </main>
      <FooterPlaceholder />
    </>
  )
}
