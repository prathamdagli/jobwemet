import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  type DocumentData,
  type FirestoreError,
  type Timestamp,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { db, storage } from '@/firebase/firebase'

export type { FirestoreError } from 'firebase/firestore'

// ---------------------------------------------------------------------------
// Firestore document shapes (subset of the backend contract we read or write).
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

export type ErrorHandler = (error: FirestoreError) => void

type Unsub = () => void

/** Latest snapshot of every Firestore source, keyed for the AppData builder. */
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

// ---------------------------------------------------------------------------
// Resume-derived subscriptions are keyed by resumeId.
// ---------------------------------------------------------------------------

function onUserDoc(
  uid: string,
  onNext: (doc: UserDoc | null) => void,
  onErr: ErrorHandler,
): Unsub {
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => onNext(snap.exists() ? (snap.data() as UserDoc) : null),
    onErr,
  )
}

function onResumes(
  uid: string,
  onNext: (docs: ResumeDoc[]) => void,
  onErr: ErrorHandler,
): Unsub {
  // firestore.indexes.json provides the (userId ASC, uploadedAt DESC) index
  // this query relies on.
  const q = query(
    collection(db, 'resumes'),
    where('userId', '==', uid),
    orderBy('uploadedAt', 'desc'),
  )
  return onSnapshot(
    q,
    (snap) => {
      const docs = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ResumeDoc, 'id'>),
      }))
      onNext(docs)
    },
    onErr,
  )
}

function onProcessing(
  uid: string,
  onNext: (map: Record<string, ProcessingDoc>) => void,
  onErr: ErrorHandler,
): Unsub {
  return onSnapshot(
    query(collection(db, 'resumeProcessing'), where('userId', '==', uid)),
    (snap) => {
      const map: Record<string, ProcessingDoc> = {}
      snap.forEach((d) => {
        map[d.id] = d.data() as ProcessingDoc
      })
      onNext(map)
    },
    onErr,
  )
}

function onResumeDoc<T>(
  collectionName: string,
  resumeId: string,
  onNext: (data: T | null) => void,
  onErr: ErrorHandler,
): Unsub {
  return onSnapshot(
    doc(db, collectionName, resumeId),
    (snap) => onNext(snap.exists() ? (snap.data() as T) : null),
    onErr,
  )
}

// ---------------------------------------------------------------------------
// Public subscription API — one per data source.
// ---------------------------------------------------------------------------

export function subscribeUserProfile(
  uid: string,
  onNext: (doc: UserDoc | null) => void,
  onErr: ErrorHandler = console.error,
): Unsub {
  return onUserDoc(uid, onNext, onErr)
}

export function subscribeUserResumes(
  uid: string,
  onNext: (docs: ResumeDoc[]) => void,
  onErr: ErrorHandler = console.error,
): Unsub {
  return onResumes(uid, onNext, onErr)
}

export function subscribeResumeProcessing(
  uid: string,
  onNext: (map: Record<string, ProcessingDoc>) => void,
  onErr: ErrorHandler = console.error,
): Unsub {
  return onProcessing(uid, onNext, onErr)
}

export function subscribeSkillAnalysis(
  resumeId: string,
  onNext: (doc: SkillAnalysisDoc | null) => void,
  onErr: ErrorHandler = console.error,
): Unsub {
  return onResumeDoc('skillAnalysis', resumeId, onNext, onErr)
}

export function subscribeCareerMatches(
  resumeId: string,
  onNext: (doc: CareerMatchDoc | null) => void,
  onErr: ErrorHandler = console.error,
): Unsub {
  return onResumeDoc('careerMatches', resumeId, onNext, onErr)
}

export function subscribeSkillGap(
  resumeId: string,
  onNext: (doc: SkillGapDoc | null) => void,
  onErr: ErrorHandler = console.error,
): Unsub {
  return onResumeDoc('skillGap', resumeId, onNext, onErr)
}

export function subscribeRoadmap(
  resumeId: string,
  onNext: (doc: RoadmapDoc | null) => void,
  onErr: ErrorHandler = console.error,
): Unsub {
  return onResumeDoc('roadmaps', resumeId, onNext, onErr)
}

export function subscribeCourses(
  resumeId: string,
  onNext: (doc: CourseDoc | null) => void,
  onErr: ErrorHandler = console.error,
): Unsub {
  return onResumeDoc('courseRecommendations', resumeId, onNext, onErr)
}

export function subscribeDashboard(
  resumeId: string,
  onNext: (doc: DashboardDoc | null) => void,
  onErr: ErrorHandler = console.error,
): Unsub {
  return onResumeDoc('dashboardSummary', resumeId, onNext, onErr)
}

// ---------------------------------------------------------------------------
// One-time reads / writes.
// ---------------------------------------------------------------------------

export async function getProfile(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as UserDoc) : null
}

export async function updateProfile(
  uid: string,
  patch: Partial<
    Pick<UserDoc, 'displayName' | 'targetCareer' | 'location' | 'phone'>
  >,
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), patch as DocumentData)
}

// 10 MB upload cap shared with the dropzone UI.
export const MAX_RESUME_BYTES = 10 * 1024 * 1024

/**
 * Upload a resume file to Storage under users/{uid}/resumes/{resumeId}.{ext}.
 * The Cloud Function onFinalize trigger creates the resume metadata record, so
 * we only need to push the bytes and report real upload progress here.
 */
export function uploadResumeFile(
  uid: string,
  file: File,
  onProgress: (percent: number) => void,
  resumeId: string,
): Promise<{ resumeId: string; downloadURL: string }> {
  const ext = (file.name.split('.').pop() ?? 'pdf').toLowerCase()
  const safeExt = ['pdf', 'doc', 'docx'].includes(ext) ? ext : 'pdf'
  const path = `users/${uid}/resumes/${resumeId}.${safeExt}`
  const storageRef = ref(storage, path)

  const metadata = {
    contentType:
      file.type ||
      (safeExt === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
    customMetadata: { originalFileName: file.name },
  }

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, metadata)
    task.on(
      'state_changed',
      (snap) => {
        const pct = snap.totalBytes
          ? Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
          : 0
        onProgress(pct)
      },
      (err) => reject(err),
      async () => {
        try {
          const downloadURL = await getDownloadURL(task.snapshot.ref)
          resolve({ resumeId, downloadURL })
        } catch (err) {
          reject(err)
        }
      },
    )
  })
}
