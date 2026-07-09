import { Briefcase } from 'lucide-react'
import { SectionPlaceholder } from '@/components/dashboard/SectionPlaceholder'

export default function JobsPage() {
  return (
    <SectionPlaceholder
      icon={Briefcase}
      title="Career Matches"
      description="Roles matched to your skills and goals will appear here."
    />
  )
}
