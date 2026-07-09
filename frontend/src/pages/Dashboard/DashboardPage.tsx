import {
  CareerReadinessWidget,
  DashboardHeader,
  LearningProgressWidget,
  MissingSkillsWidget,
  RecentActivityWidget,
  RecommendedNextStepWidget,
  ResumeWidget,
  TopCareerMatchWidget,
  TopCareerMatchesWidget,
} from '@/components/dashboard/widgets'

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
      <DashboardHeader />

      {/* Metrics row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CareerReadinessWidget />
        <TopCareerMatchWidget />
        <MissingSkillsWidget />
        <LearningProgressWidget />
      </div>

      {/* Detail row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ResumeWidget />
        <RecentActivityWidget />
        <TopCareerMatchesWidget className="md:col-span-2 lg:col-span-2" />
      </div>

      {/* Recommended next step */}
      <RecommendedNextStepWidget />
    </div>
  )
}
