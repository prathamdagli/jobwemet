import type {
  UserDoc,
  ResumeDoc,
  SkillAnalysisDoc,
  CareerMatchDoc,
  SkillGapDoc,
  RoadmapDoc,
  CourseDoc,
  DashboardDoc,
} from '@/services/firebase'

/**
 * Single reusable API client for the FastAPI backend.
 *
 * Every request attaches the current Firebase ID token as a Bearer header,
 * parses JSON, and throws a typed {@link ApiError} on failure. The token is
 * fetched lazily through a configured getter so it is always fresh (Firebase
 * transparently refreshes expired tokens). Uploads use XMLHttpRequest so we
 * can report real progress — the Fetch API cannot.
 */

const BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://127.0.0.1:8000'

// ---- Token provider (wired by AuthProvider) -------------------------------

let getToken: () => Promise<string | null> = async () => null

/** Provide a function that returns the current user's Firebase ID token. */
export function configureApi(fn: () => Promise<string | null>): void {
  getToken = fn
}

// ---- Errors -----------------------------------------------------------------

export class ApiError extends Error {
  status: number
  detail: unknown
  constructor(status: number, message: string, detail?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

function extractMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object' && 'detail' in payload) {
    const detail = (payload as { detail: unknown }).detail
    if (typeof detail === 'string') return detail
    if (detail && typeof detail === 'object' && 'message' in detail) {
      const m = (detail as { message: unknown }).message
      if (typeof m === 'string') return m
    }
  }
  return fallback
}

// ---- Core request ----------------------------------------------------------

interface RequestOptions {
  method?: string
  body?: unknown
  signal?: AbortSignal
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const token = await getToken()
  const headers = new Headers()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const isJson = opts.body != null
  if (isJson) headers.set('Content-Type', 'application/json')

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: opts.method ?? 'GET',
      headers,
      body: isJson ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiError(0, 'Network error — could not reach the server.')
  }

  if (!res.ok) {
    let payload: unknown
    try {
      payload = await res.json()
    } catch {
      payload = null
    }
    throw new ApiError(
      res.status,
      extractMessage(payload, res.statusText),
      payload,
    )
  }

  if (res.status === 204) return undefined as T
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

// ---- Request/response types -------------------------------------------------

export interface ResumeUploadResponse {
  resumeId: string
  fileName: string
  storagePath: string
  status: string
}

export interface UpdateProfileBody {
  displayName?: string
  targetCareer?: string
  location?: string
  phone?: string
  bio?: string
  education?: string
  linkedin?: string
  github?: string
  portfolio?: string
  profileImage?: string
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  browser: boolean
}

export interface PrivacySettings {
  profileVisible: boolean
  shareAcademicData: boolean
}

export interface CareerPreferences {
  targetRole: string | null
  industry: string | null
  remotePreferred: boolean
}

export interface Settings {
  theme: string
  language: string
  timezone: string | null
  notifications: NotificationSettings
  privacy: PrivacySettings
  careerPreferences: CareerPreferences
  defaultResume: string | null
}

export interface SettingsResponse {
  profile: UserDoc
  settings: Settings
}

export interface PutSettingsBody extends UpdateProfileBody {
  theme?: string
  language?: string
  timezone?: string | null
  notifications?: NotificationSettings
  privacy?: PrivacySettings
  careerPreferences?: CareerPreferences
  defaultResume?: string | null
}

export interface DashboardDetail extends DashboardDoc {
  topMissingSkills: string[]
  profileSummary: Record<string, unknown>
  resumeSummary: Record<string, unknown>
  recentActivity: Array<Record<string, unknown>>
  lastAnalysis: Record<string, unknown> | null
}

// ---- Read endpoints ---------------------------------------------------------

export function getProfile(): Promise<UserDoc> {
  return request<UserDoc>('/profile')
}

export function getDashboard(): Promise<DashboardDetail> {
  return request<DashboardDetail>('/dashboard')
}

export function getSkills(): Promise<SkillAnalysisDoc> {
  return request<SkillAnalysisDoc>('/skills')
}

export function getCareers(): Promise<CareerMatchDoc> {
  return request<CareerMatchDoc>('/careers')
}

export function getSkillGap(): Promise<SkillGapDoc> {
  return request<SkillGapDoc>('/skill-gap')
}

export function getRoadmap(): Promise<RoadmapDoc> {
  return request<RoadmapDoc>('/roadmap')
}

export function getCourses(): Promise<CourseDoc> {
  return request<CourseDoc>('/courses')
}

export function listResumes(): Promise<ResumeDoc[]> {
  return request<ResumeDoc[]>('/resumes')
}

export function getSettings(): Promise<SettingsResponse> {
  return request<SettingsResponse>('/settings')
}

// ---- Write endpoints --------------------------------------------------------

export function updateProfile(body: UpdateProfileBody): Promise<UserDoc> {
  return request<UserDoc>('/update-profile', { method: 'PUT', body })
}

export function putSettings(body: PutSettingsBody): Promise<SettingsResponse> {
  return request<SettingsResponse>('/settings', { method: 'PUT', body })
}

/** Cascade-delete a resume (and all derived docs) on the backend. */
export function deleteResume(
  resumeId: string,
): Promise<{ status: string; message: string }> {
  return request<{ status: string; message: string }>(
    `/resume/${encodeURIComponent(resumeId)}`,
    { method: 'DELETE' },
  )
}

// ---- Pipeline actions -------------------------------------------------------

interface ResumeIdBody {
  resumeId: string
}

export function processResume(resumeId: string): Promise<unknown> {
  return request('/process-resume', {
    method: 'POST',
    body: { resumeId } as ResumeIdBody,
  })
}

export function analyzeResume(resumeId: string): Promise<SkillAnalysisDoc> {
  return request<SkillAnalysisDoc>('/analyze-resume', {
    method: 'POST',
    body: { resumeId } as ResumeIdBody,
  })
}

export function regenerateAnalysis(
  resumeId: string,
): Promise<SkillAnalysisDoc> {
  return request<SkillAnalysisDoc>('/regenerate-analysis', {
    method: 'POST',
    body: { resumeId } as ResumeIdBody,
  })
}

export function generateRoadmap(resumeId: string): Promise<RoadmapDoc> {
  return request<RoadmapDoc>('/generate-roadmap', {
    method: 'POST',
    body: { resumeId } as ResumeIdBody,
  })
}

export function regenerateRoadmap(resumeId: string): Promise<RoadmapDoc> {
  return request<RoadmapDoc>('/regenerate-roadmap', {
    method: 'POST',
    body: { resumeId } as ResumeIdBody,
  })
}

export function recommendCourses(resumeId: string): Promise<CourseDoc> {
  return request<CourseDoc>('/recommend-courses', {
    method: 'POST',
    body: { resumeId } as ResumeIdBody,
  })
}

// ---- Upload (real progress via XHR) ----------------------------------------

/**
 * Upload a resume file to the backend. Reports real upload progress through
 * `onProgress` (0–100). Resolves with the created resume record.
 */
export function uploadResume(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<ResumeUploadResponse> {
  return new Promise<ResumeUploadResponse>((resolve, reject) => {
    getToken()
      .then((token) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', `${BASE_URL}/upload-resume`)
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable && onProgress) {
            onProgress(Math.round((ev.loaded / ev.total) * 100))
          }
        }

        xhr.onload = () => {
          let payload: unknown
          try {
            payload = xhr.responseText ? JSON.parse(xhr.responseText) : null
          } catch {
            payload = null
          }
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(payload as ResumeUploadResponse)
          } else {
            reject(
              new ApiError(
                xhr.status,
                extractMessage(payload, xhr.statusText || 'Upload failed.'),
                payload,
              ),
            )
          }
        }
        xhr.onerror = () =>
          reject(new ApiError(0, 'Network error during upload.'))
        xhr.ontimeout = () => reject(new ApiError(0, 'Upload timed out.'))

        const form = new FormData()
        form.append('file', file)
        xhr.send(form)
      })
      .catch((err) => reject(err))
  })
}

/** Namespaced bundle of every endpoint for callers that prefer `api.x()`. */
export const api = {
  getProfile,
  getDashboard,
  getSkills,
  getCareers,
  getSkillGap,
  getRoadmap,
  getCourses,
  listResumes,
  getSettings,
  updateProfile,
  putSettings,
  deleteResume,
  processResume,
  analyzeResume,
  regenerateAnalysis,
  generateRoadmap,
  regenerateRoadmap,
  recommendCourses,
  uploadResume,
}
