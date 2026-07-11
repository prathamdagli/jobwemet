import { type Timestamp } from 'firebase/firestore'

// ---------------------------------------------------------------------------
// Firestore document shapes (subset of the backend contract read by the app).
//
// These describe the JSON the FastAPI backend returns for each read endpoint.
// They are consumed by the AppData builder (mappers.ts) and the API client
// response types, and are no longer fetched via Firestore directly — the
// backend serves the same shapes over REST, which drop straight into AppState.
// ---------------------------------------------------------------------------

export interface UserDoc {
  uid: string
  displayName: string
  email: string
  photoURL: string | null
  provider: 'password' | 'google'
  createdAt?: Timestamp
  updatedAt?: Timestamp
  onboardingCompleted: boolean
  profileCompletion: number
  targetCareer: string
  currentResumeId: string | null
  location?: string
  phone?: string
}

export type ResumeStatus = 'uploaded' | 'deleted'

export interface ResumeDoc {
  id: string
  userId: string
  fileName: string
  originalFileName: string
  storagePath: string
  mimeType: string
  fileSize: number
  status: ResumeStatus
  uploadedAt?: Timestamp
  updatedAt?: Timestamp
}

export type AnalysisStatus = 'processing' | 'completed' | 'failed'

export interface SkillGroup {
  category: string
  skills: string[]
}

export interface ExperienceInfo {
  years: number
  currentRole: string
  previousRoles: string[]
  projects: string[]
}

export interface EducationInfo {
  highestQualification: string
}

export interface ConfidenceInfo {
  overall: number
  skills: number
  careerMatch: number
}

export interface SkillAnalysisDoc {
  status: AnalysisStatus
  technicalSkills?: SkillGroup[]
  softSkills?: string[]
  experience?: ExperienceInfo
  education?: EducationInfo
  confidence?: ConfidenceInfo
}

export interface CareerMatchItem {
  careerName: string
  confidence: number
  reason: string
  topMatchingSkills: string[]
}

export interface CareerMatchDoc {
  careers: CareerMatchItem[]
}

export type SkillGapPriority = 'high' | 'medium' | 'low'
export type SkillGapDifficulty = 'easy' | 'moderate' | 'hard'

export interface SkillGapItem {
  skill: string
  priority: SkillGapPriority
  difficulty: SkillGapDifficulty
  estimatedLearningTime: string
}

export interface SkillGapDoc {
  missingSkills: SkillGapItem[]
}

export type PhaseStatus = 'completed' | 'in_progress' | 'locked'

export interface RoadmapPhase {
  order: number
  title: string
  description: string
  estimatedHours: number
  priority: SkillGapPriority
  requiredSkills: string[]
  completionStatus: PhaseStatus
  estimatedCompletionTime: string
}

export interface RoadmapDoc {
  status?: string
  phases?: RoadmapPhase[]
}

export interface CourseRec {
  title: string
  provider: string
  skill: string
  difficulty: SkillGapDifficulty
  estimatedDuration: string
  url: string
  rating: number
  priority: SkillGapPriority
}

export interface CourseDoc {
  courses: CourseRec[]
}

export interface DashboardDoc {
  overallReadiness: number
  topCareer: string
  topCareerConfidence: number
  skillsCount: number
  missingSkillsCount: number
  completedRoadmapPct: number
  currentPhase: string
  recommendedCourse: string
}

export type ProcessingStatus = 'queued' | 'processing' | 'completed' | 'failed'

export interface ProcessingDoc {
  status: ProcessingStatus
  progress?: number
}

/** Latest snapshot of every data source, keyed for the AppData builder. */
export interface DataSlots {
  profile: UserDoc | null
  resumes: ResumeDoc[]
  processing: Record<string, ProcessingDoc>
  analysis: SkillAnalysisDoc | null
  careerMatches: CareerMatchDoc | null
  skillGap: SkillGapDoc | null
  roadmap: RoadmapDoc | null
  courses: CourseDoc | null
  dashboard: DashboardDoc | null
}

export const EMPTY_SLOTS: DataSlots = {
  profile: null,
  resumes: [],
  processing: {},
  analysis: null,
  careerMatches: null,
  skillGap: null,
  roadmap: null,
  courses: null,
  dashboard: null,
}
