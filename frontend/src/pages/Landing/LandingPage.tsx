import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import StatsSection from '@/components/landing/StatsSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import HowItWorks from '@/components/landing/HowItWorks'
import AboutSection from '@/components/landing/AboutSection'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/Footer'
import StoryBackground from '@/components/landing/StoryBackground'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        {/* One continuous background shared by every section below the Hero. */}
        <div className="relative">
          <StoryBackground />
          <StatsSection />
          <FeaturesSection />
          <HowItWorks />
          <AboutSection />
          <CTASection />
          <Footer />
        </div>
      </main>
    </>
  )
}
