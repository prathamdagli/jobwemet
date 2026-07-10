import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HeroButtons() {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {/* Primary — soft monochrome glow + lift on hover, press feedback, arrow slide */}
      <Button
        size="lg"
        render={<Link to="/register" />}
        className="gap-2 px-7 shadow-sm shadow-primary/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 active:translate-y-0 active:shadow-sm"
      >
        Start Your Journey
        <ArrowRight className="size-4 transition-transform duration-300 group-hover/button:translate-x-1" />
      </Button>
      <Button
        size="lg"
        variant="outline"
        onClick={scrollToFeatures}
        className="gap-2 px-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md active:translate-y-0 active:shadow-sm"
      >
        Explore Platform
      </Button>
    </div>
  )
}
