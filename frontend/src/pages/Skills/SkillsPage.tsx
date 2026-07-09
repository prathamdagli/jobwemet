import { BarChart3 } from 'lucide-react'
import { SectionPlaceholder } from '@/components/dashboard/SectionPlaceholder'

export default function SkillsPage() {
  return (
    <SectionPlaceholder
      icon={BarChart3}
      title="Skill Gap"
      description="Your skill gap analysis and recommendations will appear here."
    />
  )
}
