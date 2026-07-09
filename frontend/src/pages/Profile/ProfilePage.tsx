import { UserRound } from 'lucide-react'
import { SectionPlaceholder } from '@/components/dashboard/SectionPlaceholder'

export default function ProfilePage() {
  return (
    <SectionPlaceholder
      icon={UserRound}
      title="Profile"
      description="Your account details and preferences will appear here."
    />
  )
}
