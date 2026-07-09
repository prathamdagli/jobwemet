import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HeroButtons() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        size="lg"
        className="gap-2 px-7 shadow-sm transition-all duration-300 hover:-translate-y-px hover:shadow-md"
      >
        Start Your Journey
        <ArrowRight className="size-4 transition-transform duration-300 group-hover/button:translate-x-0.5" />
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="gap-2 px-7 transition-all duration-300 hover:-translate-y-px hover:shadow-sm"
      >
        Explore Platform
      </Button>
    </div>
  )
}
