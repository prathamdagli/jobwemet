import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HeroButtons() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button size="lg" className="gap-2">
        Start Your Journey
        <ArrowRight className="size-4" />
      </Button>
      <Button size="lg" variant="outline" className="gap-2">
        Explore Platform
      </Button>
    </div>
  )
}
