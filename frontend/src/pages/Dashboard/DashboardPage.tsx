import { LayoutDashboard } from 'lucide-react'
import { SectionPlaceholder } from '@/components/dashboard/SectionPlaceholder'

export default function DashboardPage() {
  return (
    <SectionPlaceholder
      icon={LayoutDashboard}
      title="Dashboard"
      description="Your AI-powered career intelligence overview will appear here."
    />
  )
}
