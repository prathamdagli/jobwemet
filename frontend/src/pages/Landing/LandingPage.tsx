import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import StatsSection from '@/components/landing/StatsSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import HowItWorks from '@/components/landing/HowItWorks'
import AboutSection from '@/components/landing/AboutSection'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsSection />
        <FeaturesSection />
        <HowItWorks />
        <AboutSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
