import { GraduationCap } from 'lucide-react'
import { SectionPlaceholder } from '@/components/dashboard/SectionPlaceholder'

export default function CoursesPage() {
  return (
    <SectionPlaceholder
      icon={GraduationCap}
      title="Courses"
      description="Curated courses to close your skill gaps will appear here."
    />
  )
}
