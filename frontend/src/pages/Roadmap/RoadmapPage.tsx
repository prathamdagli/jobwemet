import { Route } from 'lucide-react'
import { SectionPlaceholder } from '@/components/dashboard/SectionPlaceholder'

export default function RoadmapPage() {
  return (
    <SectionPlaceholder
      icon={Route}
      title="Learning Roadmap"
      description="Your personalized step-by-step learning path will appear here."
    />
  )
}
