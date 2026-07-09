import { Settings } from 'lucide-react'
import { SectionPlaceholder } from '@/components/dashboard/SectionPlaceholder'

export default function SettingsPage() {
  return (
    <SectionPlaceholder
      icon={Settings}
      title="Settings"
      description="Manage your account, notifications, and preferences here."
    />
  )
}
