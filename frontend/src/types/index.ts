import type { LucideIcon } from 'lucide-react'
import type {
  TechnicalSkill,
  DistributionItem,
} from '@/components/skills/skills'
import type { Career } from '@/components/careers/careers'
import type { Course } from '@/components/courses/courses'
import type { ModuleStatus } from '@/components/roadmap/roadmap'

/** Authenticated user (mirrors the shape provided by the auth layer). */
export interface AppUser {
  uid: string
  displayName: string
  email: string
  photoURL?: string
}

/** The user's editable profile details. */
export interface UserProfile {
  fullName: string
  initials: string
  email: string
  targetCareer: string
  location: string
  phone: string
  memberSince: string
  profileCompletion: number
  lastUpdated: string
}

/** A reusable `{ icon, label, value }` insight tile. */
export interface InsightTile {
  icon: LucideIcon
  label: string
  value: string
}

export interface CareerSummaryTile extends InsightTile {
  sub?: string
}

export type PersonalInfoItem = InsightTile
export type CareerStatItem = InsightTile

export interface Achievement {
  icon: LucideIcon
  title: string
  description: string
  unlocked: boolean
}

export interface ActivityItem {
  icon: LucideIcon
  title: string
  time: string
}

export interface QuickAction {
  icon: LucideIcon
  label: string
  to: string
}

export interface SoftSkill {
  name: string
  confidence: number
  evidence?: string
}

export interface ResumeEntryData {
  id: string
  name: string
  uploaded: string
  status?: 'Parsed' | 'Processing' | 'Failed'
  preview?: string
}

export interface ResumeState {
  fileName: string
  uploaded: string
  recent: ResumeEntryData[]
}

export interface SkillGapGroup {
  category: string
  skills: string[]
}

export type PriorityLevel = 'High' | 'Medium'
export type GapDifficulty = 'Easy' | 'Medium' | 'Hard'

export interface PrioritySkill {
  skill: string
  priority: PriorityLevel
  difficulty: GapDifficulty
  confidence?: number
}

export interface CoverageItem {
  label: string
  value: number
}

export interface RoadmapModuleData {
  title: string
  status: ModuleStatus
  description: string
  difficulty: string
  estimatedHours: number
  skills: string[]
  progress?: number
}

export interface CourseSummaryData {
  total: number
  free: number
  paid: number
  platforms: string[]
  missingSkillsCovered: number
  targetCareer: string | null
}

export interface DashboardSummary {
  readiness: number
  topMatch: number
  topMatchTitle: string
  missingSkills: string[]
  learningProgress: number
  roadmapComplete: number
  lessonsFinished: number
  lessonsTotal: number
  recommendedNext: string
}

export interface SkillGapData {
  detected: SkillGapGroup[]
  missing: SkillGapGroup[]
  coverage: CoverageItem[]
  priority: PrioritySkill[]
  recommendations: string[]
  skillConfidence: number
}

export interface RoadmapData {
  modules: RoadmapModuleData[]
}

export interface CoursesData {
  courses: Course[]
  summary: CourseSummaryData
}

export interface CareerMatchesData {
  careers: Career[]
  insights: InsightTile[]
  insightNote: string
}

export interface SkillsData {
  technicalSkills: TechnicalSkill[]
  categories: string[]
  softSkills: SoftSkill[]
  distribution: DistributionItem[]
  skillConfidence: number
  overallConfidence: number
  careerMatchConfidence: number
  insights: string[]
  action: {
    strength: string
    strengthEvidence?: string
    weakness: string
    weaknessEvidence?: string
    nextSkill: string
    nextSkillEvidence?: string
    improvement: string
  }
}

export interface ProfileData {
  profile: UserProfile
  careerSummary: CareerSummaryTile[]
  personalInfo: PersonalInfoItem[]
  careerStats: CareerStatItem[]
  topSkills: TechnicalSkill[]
  achievements: Achievement[]
  activity: ActivityItem[]
  quickActions: QuickAction[]
}

/** The complete frontend application state. */
export interface AppData {
  user: AppUser
  profile: ProfileData
  resume: ResumeState
  skills: SkillsData
  careerMatches: CareerMatchesData
  skillGap: SkillGapData
  roadmap: RoadmapData
  courses: CoursesData
  dashboardSummary: DashboardSummary
}
