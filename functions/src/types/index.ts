// Shared domain types for the JobWeMet backend.
// These are the Firestore document shapes (and the global course catalog)
// that the Cloud Functions will read/write. Kept minimal — extend as each
// feature is implemented. Only the six entities in scope for the MVP are
// defined here; activity / notifications / settings come later.

export type ResumeStatus =
  | 'uploading'
  | 'queued'
  | 'processing'
  | 'parsed'
  | 'failed'
  | 'invalid';

/** User profile document at users/{uid}. */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: 'email' | 'google';
  role: 'user' | 'admin';
  targetCareer: string;
  location: string;
  profileCompletion: number;
  createdAt: string; // ISO timestamp
  lastLoginAt: string; // ISO timestamp
  status: 'active' | 'disabled';
}

/** A user-uploaded resume at users/{uid}/resumes/{resumeId}. */
export interface Resume {
  id: string;
  fileName: string;
  storagePath: string;
  downloadURL: string;
  sizeBytes: number;
  contentType: string;
  status: ResumeStatus;
  sha256?: string;
  uploadedAt: string; // ISO timestamp
  parsedAt?: string; // ISO timestamp
  error?: string;
}

export interface SkillScore {
  name: string;
  confidence: number; // 0–100
}

/** Skill analysis result at users/{uid}/skillAnalyses/{analysisId}. */
export interface SkillAnalysis {
  id: string;
  sourceResumeId: string;
  modelVersion: string;
  avgConfidence: number;
  technicalSkills: Array<SkillScore & { category: string }>;
  categories: string[];
  softSkills: SkillScore[];
  distribution: Array<{ label: string; value: number }>;
  insights: string[];
  action: {
    strength: string;
    weakness: string;
    nextSkill: string;
    improvement: string;
  };
  createdAt: string; // ISO timestamp
  isCurrent: boolean;
}

/** Career match at users/{uid}/careerMatches/{matchId}. */
export interface CareerMatch {
  id: string;
  title: string;
  match: number; // 0–100
  description: string;
  experience: string;
  salary: string;
  category: string;
  topSkills: string[];
  missingSkills: string[];
  explanation: string;
  sourceAnalysisId: string;
  modelVersion: string;
  generatedAt: string; // ISO timestamp
}

export type ModuleStatus = 'completed' | 'current' | 'upcoming' | 'locked';

export interface RoadmapModule {
  title: string;
  status: ModuleStatus;
  duration: string;
  description: string;
  difficulty: string;
  progress?: number; // 0–100
}

/** Learning roadmap at users/{uid}/roadmaps/{roadmapId}. */
export interface Roadmap {
  id: string;
  goal: string;
  status: 'active' | 'archived';
  modules: RoadmapModule[];
  insights: Array<{ label: string; value: string }>;
  stats: Array<{ label: string; value: string }>;
  estCompletion: string;
  sourceAnalysisId: string;
  modelVersion: string;
  generatedAt: string; // ISO timestamp
}

export type CourseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

/** Global, read-only course catalog at /courses/{courseId}. */
export interface Course {
  id: string;
  title: string;
  platform: string;
  instructor: string;
  difficulty: CourseDifficulty;
  duration: string;
  rating: number;
  skills: string[];
  description: string;
  tags?: string[];
  updatedAt: string; // ISO timestamp
}
