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
 * parses JSON, and unwraps the standard `{ success, data }` envelope. On
 * failure it throws a typed {@link ApiError}. The token is fetched lazily
 * through a configured getter so it is always fresh (Firebase transparently
 * refreshes expired tokens).
 *
 * Reliability features:
 *  - transient network failures are retried once,
 *  - a 401 triggers a forced token refresh and a single retry,
 *  - any in-flight request can be cancelled via an AbortSignal.
 *
 * Uploads use XMLHttpRequest so we can report real progress — the Fetch API
 * cannot.
 */
const BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://127.0.0.1:8000'

// ---- Token provider (wired by AuthProvider) -------------------------------

let getToken: () => Promise<string | null> = async () => null
// Optional provider that forces a token refresh (used to recover from 401s).
let getFreshToken: (() => Promise<string | null>) | null = null

/** Provide a function that returns the current user's Firebase ID token. */
export function configureApi(
  fn: () => Promise<string | null>,
  freshFn?: () => Promise<string | null>,
): void {
  getToken = fn
  getFreshToken = freshFn ?? fn
}

// ---- Errors -----------------------------------------------------------------

export class ApiError extends Error {
  status: number
  detail: unknown
  code?: string
  constructor(
    status: number,
    message: string,
    detail?: unknown,
    code?: string,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
    this.code = code
  }
}

/**
 * Pull a human-readable message out of a backend error body, preferring the
 * standardized `{ success:false, error:{ code, message, details } }` envelope
 * and falling back to the legacy `{ detail }` shape.
 */
function extractMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const error = (payload as { error: unknown }).error
    if (error && typeof error === 'object' && 'message' in error) {
      const m = (error as { message: unknown }).message
      if (typeof m === 'string') return m
    }
  }
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

/** Unwrap the `{ success:true, data }` envelope; pass legacy bodies through. */
function unwrap<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    (payload as { success: unknown }).success === true &&
    'data' in payload
  ) {
    return (payload as { data: T }).data
  }
  return payload as T
}

// ---- Core request ----------------------------------------------------------

interface RequestOptions {
  method?: string
  body?: unknown
  signal?: AbortSignal
}

async function doFetch(
  path: string,
  opts: RequestOptions,
  token: string | null,
): Promise<Response> {
  const headers = new Headers()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const isJson = opts.body != null
  if (isJson) headers.set('Content-Type', 'application/json')

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 120000)

  // Combine custom signal with timeout signal
  const signal = opts.signal
  if (signal?.aborted) {
    clearTimeout(timeoutId)
    return fetch(`${BASE_URL}${path}`, { signal })
  }

  try {
    return await fetch(`${BASE_URL}${path}`, {
      method: opts.method ?? 'GET',
      headers,
      body: isJson ? JSON.stringify(opts.body) : undefined,
      signal: signal ?? controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
  }
}

async function parseError(res: Response): Promise<ApiError> {
  let payload: unknown
  try {
    payload = await res.json()
  } catch {
    payload = null
  }
  let code: string | undefined
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const e = (payload as { error: unknown }).error
    if (e && typeof e === 'object' && 'code' in e) {
      code = (e as { code: unknown }).code as string
    }
  }
  return new ApiError(
    res.status,
    extractMessage(payload, res.statusText || 'Request failed.'),
    payload,
    code,
  )
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const token = await getToken()

  // Transient network failures are retried once before failing.
  let res: Response
  try {
    res = await doFetch(path, opts, token)
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    try {
      res = await doFetch(path, opts, token)
    } catch (err2) {
      if (err2 instanceof DOMException && err2.name === 'AbortError') throw err2
      throw new ApiError(0, 'Network error — could not reach the server.')
    }
  }

  // Expired / invalid token: force a refresh and retry exactly once.
  if (res.status === 401 && getFreshToken) {
    const fresh = await getFreshToken()
    res = await doFetch(path, opts, fresh)
  }

  if (!res.ok) {
    throw await parseError(res)
  }

  if (res.status === 204) return undefined as T
  const text = await res.text()
  if (!text) return undefined as T
  return unwrap<T>(JSON.parse(text))
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
  savedCourses?: string[]
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
  savedCourses?: string[]
}

export interface DashboardDetail extends DashboardDoc {
  topMissingSkills: string[]
  profileSummary: Record<string, unknown>
  resumeSummary: Record<string, unknown>
  recentActivity: Array<Record<string, unknown>>
  lastAnalysis: Record<string, unknown> | null
}

// ---- Read endpoints ---------------------------------------------------------

export function getProfile(signal?: AbortSignal): Promise<UserDoc> {
  return request<UserDoc>('/profile', { signal })
}

export function getDashboard(signal?: AbortSignal): Promise<DashboardDetail> {
  return request<DashboardDetail>('/dashboard', { signal })
}

export function getSkills(signal?: AbortSignal): Promise<SkillAnalysisDoc> {
  return request<SkillAnalysisDoc>('/skills', { signal })
}

export function getCareers(signal?: AbortSignal): Promise<CareerMatchDoc> {
  return request<CareerMatchDoc>('/careers', { signal })
}

export function getSkillGap(signal?: AbortSignal): Promise<SkillGapDoc> {
  return request<SkillGapDoc>('/skill-gap', { signal })
}

export function getRoadmap(signal?: AbortSignal): Promise<RoadmapDoc> {
  return request<RoadmapDoc>('/roadmap', { signal })
}

export function getCourses(signal?: AbortSignal): Promise<CourseDoc> {
  return request<CourseDoc>('/courses', { signal })
}

export function listResumes(signal?: AbortSignal): Promise<ResumeDoc[]> {
  return request<ResumeDoc[]>('/resumes', { signal })
}

export function getSettings(signal?: AbortSignal): Promise<SettingsResponse> {
  return request<SettingsResponse>('/settings', { signal })
}

// ---- Write endpoints --------------------------------------------------------

export function updateProfile(
  body: UpdateProfileBody,
  signal?: AbortSignal,
): Promise<UserDoc> {
  return request<UserDoc>('/update-profile', { method: 'PUT', body, signal })
}

export function putSettings(
  body: PutSettingsBody,
  signal?: AbortSignal,
): Promise<SettingsResponse> {
  return request<SettingsResponse>('/settings', { method: 'PUT', body, signal })
}

/** Cascade-delete a resume (and all derived docs) on the backend. */
export function deleteResume(
  resumeId: string,
  signal?: AbortSignal,
): Promise<{ status: string; message: string }> {
  return request<{ status: string; message: string }>(
    `/resume/${encodeURIComponent(resumeId)}`,
    { method: 'DELETE', signal },
  )
}

// ---- Pipeline actions -------------------------------------------------------

interface ResumeIdBody {
  resumeId: string
}

export interface SelectCareerBody {
  career: string
}

export function processResume(
  resumeId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return request('/process-resume', {
    method: 'POST',
    body: { resumeId } as ResumeIdBody,
    signal,
  })
}

export function analyzeResume(
  resumeId: string,
  signal?: AbortSignal,
): Promise<SkillAnalysisDoc> {
  return request<SkillAnalysisDoc>('/analyze-resume', {
    method: 'POST',
    body: { resumeId } as ResumeIdBody,
    signal,
  })
}

export function regenerateAnalysis(
  resumeId: string,
  signal?: AbortSignal,
): Promise<SkillAnalysisDoc> {
  return request<SkillAnalysisDoc>('/regenerate-analysis', {
    method: 'POST',
    body: { resumeId } as ResumeIdBody,
    signal,
  })
}

export function generateRoadmap(
  resumeId: string,
  signal?: AbortSignal,
): Promise<RoadmapDoc> {
  return request<RoadmapDoc>('/generate-roadmap', {
    method: 'POST',
    body: { resumeId } as ResumeIdBody,
    signal,
  })
}

export function regenerateRoadmap(
  resumeId: string,
  signal?: AbortSignal,
): Promise<RoadmapDoc> {
  return request<RoadmapDoc>('/regenerate-roadmap', {
    method: 'POST',
    body: { resumeId } as ResumeIdBody,
    signal,
  })
}

export function recommendCourses(
  resumeId: string,
  signal?: AbortSignal,
): Promise<CourseDoc> {
  return request<CourseDoc>('/recommend-courses', {
    method: 'POST',
    body: { resumeId } as ResumeIdBody,
    signal,
  })
}

export function selectCareer(
  career: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return request('/select-career', {
    method: 'POST',
    body: { career } as SelectCareerBody,
    signal,
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
  signal?: AbortSignal,
): Promise<ResumeUploadResponse> {
  return new Promise<ResumeUploadResponse>((resolve, reject) => {
    getToken()
      .then((token) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', `${BASE_URL}/upload-resume`)
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

        if (signal) {
          if (signal.aborted) {
            xhr.abort()
          } else {
            signal.addEventListener('abort', () => xhr.abort(), { once: true })
          }
        }

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
            resolve(unwrap<ResumeUploadResponse>(payload))
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
  selectCareer,
  uploadResume,
}
