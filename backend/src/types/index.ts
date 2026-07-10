import type { FieldValue, Timestamp } from 'firebase-admin/firestore';

/** Sign-in method used to create the account. */
export type Provider = 'password' | 'google';

/**
 * The user profile document stored at users/{uid}.
 * This is the single source of truth for a user.
 */
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  provider: Provider;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  onboardingCompleted: boolean;
  profileCompletion: number;
  targetCareer: string;
  currentResumeId: string | null;
}

/**
 * Shape used when creating the document. Timestamps are server-generated,
 * so they are FieldValue rather than Timestamp at write time.
 */
export type UserProfileCreate = Omit<UserProfile, 'createdAt' | 'updatedAt'> & {
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

/**
 * Lifecycle status of a resume. Only the states needed by the upload +
 * metadata feature are defined here:
 *  - 'uploaded': file landed in Storage and Firestore metadata was written.
 *  - 'deleted':  the Storage object was removed, so the metadata is stale
 *                (marked rather than removed to avoid losing the record).
 * Later phases (parsing, skill extraction) will extend this union.
 */
export type ResumeStatus = 'uploaded' | 'deleted';

/** Fields supplied when the upload trigger creates the metadata record. */
export interface ResumeInput {
  id: string;
  userId: string;
  fileName: string;
  originalFileName: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
}

/** The resume metadata document stored at resumes/{resumeId}. */
export interface ResumeRecord {
  id: string;
  userId: string;
  fileName: string;
  originalFileName: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  status: ResumeStatus;
  uploadedAt: Timestamp;
  updatedAt: Timestamp;
}

/** Write-time shape: timestamps are server-generated. */
export type ResumeCreate = Omit<ResumeRecord, 'uploadedAt' | 'updatedAt' | 'status'> & {
  status: ResumeStatus;
  uploadedAt: FieldValue;
  updatedAt: FieldValue;
};

/** Lifecycle status of the resume processing pipeline. */
export type ProcessingStatus = 'queued' | 'processing' | 'completed' | 'failed';

/**
 * Where the pipeline currently is. Mirrors the orchestration stages:
 * uploaded → validating → extracting_text → saving → completed | failed.
 */
export type ProcessingStep =
  | 'uploaded'
  | 'validating'
  | 'extracting_text'
  | 'saving'
  | 'completed'
  | 'failed';

/** Resume processing pipeline document stored at resumeProcessing/{resumeId}. */
export interface ResumeProcessing {
  resumeId: string;
  userId: string;
  status: ProcessingStatus;
  currentStep: ProcessingStep;
  progress: number;
  rawText: string;
  error: string;
  startedAt: Timestamp;
  completedAt: Timestamp | null;
  updatedAt: Timestamp;
}

/** Write-time shape for the initial (queued) record. */
export type ResumeProcessingCreate = Omit<
  ResumeProcessing,
  'startedAt' | 'updatedAt' | 'completedAt'
> & {
  startedAt: FieldValue;
  updatedAt: FieldValue;
  completedAt: null;
};

/** Patch accepted by updateProcessingStatus (timestamps handled internally). */
export interface ProcessingUpdate {
  status?: ProcessingStatus;
  currentStep?: ProcessingStep;
  progress?: number;
  rawText?: string;
  completedAt?: FieldValue | null;
}

// ---------- AI / Resume Analysis ----------

/** A categorized group of extracted technical skills. */
export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface ExperienceInfo {
  years: number;
  currentRole: string;
  previousRoles: string[];
  projects: string[];
}

export interface EducationInfo {
  highestQualification: string;
}

export interface CareerMatch {
  careerName: string;
  /** 0-100 */
  confidence: number;
  reason: string;
  topMatchingSkills: string[];
}

export type SkillGapPriority = 'high' | 'medium' | 'low';
export type SkillGapDifficulty = 'easy' | 'moderate' | 'hard';

export interface SkillGapItem {
  skill: string;
  priority: SkillGapPriority;
  difficulty: SkillGapDifficulty;
  estimatedLearningTime: string;
}

export interface ConfidenceInfo {
  /** 0-100 */
  overall: number;
  skills: number;
  careerMatch: number;
}

/** Structured analysis returned by the AI provider. */
export interface ResumeAnalysis {
  technicalSkills: SkillGroup[];
  softSkills: string[];
  experience: ExperienceInfo;
  education: EducationInfo;
  careers: CareerMatch[];
  missingSkills: SkillGapItem[];
  confidence: ConfidenceInfo;
}

/** Pipeline status for the skillAnalysis control document. */
export type AnalysisStatus = 'processing' | 'completed' | 'failed';

// ---------- Learning Pipeline (roadmap / courses / dashboard) ----------

export type PhaseStatus = 'completed' | 'in_progress' | 'locked';

/** One step in a generated learning roadmap. */
export interface RoadmapPhase {
  order: number;
  title: string;
  description: string;
  estimatedHours: number;
  priority: SkillGapPriority;
  requiredSkills: string[];
  completionStatus: PhaseStatus;
  estimatedCompletionTime: string;
}

/** A recommended course for a single missing skill. */
export interface CourseRecommendation {
  title: string;
  provider: string;
  skill: string;
  difficulty: SkillGapDifficulty;
  estimatedDuration: string;
  url: string;
  rating: number;
  priority: SkillGapPriority;
}

/** Inputs used to derive the dashboard summary. */
export interface DashboardInput {
  overallReadiness: number;
  topCareer: string;
  topCareerConfidence: number;
  skillsCount: number;
  missingSkillsCount: number;
  phases: RoadmapPhase[];
  recommendedCourseTitle: string;
}

/** One-read document that powers the Dashboard page. */
export interface DashboardSummary {
  overallReadiness: number;
  topCareer: string;
  topCareerConfidence: number;
  skillsCount: number;
  missingSkillsCount: number;
  completedRoadmapPct: number;
  currentPhase: string;
  recommendedCourse: string;
  lastUpdated?: Timestamp;
}
