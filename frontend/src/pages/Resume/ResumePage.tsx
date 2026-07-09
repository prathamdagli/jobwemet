import { FileText } from 'lucide-react'
import { SectionPlaceholder } from '@/components/dashboard/SectionPlaceholder'

export default function ResumePage() {
  return (
    <SectionPlaceholder
      icon={FileText}
      title="Resume"
      description="Upload and analyze your resume with AI insights here."
    />
  )
}
