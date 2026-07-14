import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { useAuth } from '@/hooks/useAuth'
import { EMPTY_SLOTS, type DataSlots } from '@/services/firebase'
import {
  api,
  type PutSettingsBody,
  type Settings,
  type UpdateProfileBody,
} from '@/services/api/client'
import { buildAppData } from '@/services/firebase/mappers'
import type { AppData } from '@/types'

export interface AppStateContextValue {
  /** The full application data tree shared across every page. */
  data: AppData
  /** True while the data is (re)loading. */
  loading: boolean
  /** True while the AI pipeline is regenerating in the background (e.g. after goal change). */
  isRegenerating: boolean
  /** Populated when a load or action fails. */
  error: string | null
  /** Re-fetch every slice from the backend. */
  refresh: () => void
  /** The resume the derived slices are keyed to (latest non-deleted). */
  activeResumeId: string | null
  /** The user's persisted app settings (or null until loaded). */
  settings: Settings | null
  /** Upload a resume, run the analysis pipeline, then refresh everything. */
  uploadResume: (
    file: File,
    onProgress?: (percent: number) => void,
  ) => Promise<void>
  /** Cascade-delete a resume, then refresh. */
  deleteResume: (resumeId: string) => Promise<void>
  /** Re-run the AI analysis for a resume, then refresh. */
  runAnalysis: (resumeId: string) => Promise<void>
  /** Re-generate the roadmap for a resume, then refresh. */
  regenerateRoadmap: (resumeId: string) => Promise<void>
  /** Recommend courses for the skill gap, then refresh. */
  recommendCourses: (resumeId: string) => Promise<void>
  /** Select a target career and re-derive the pipeline, then refresh. */
  selectCareer: (career: string) => Promise<void>
  /** Persist profile fields, then refresh. */
  updateProfile: (body: UpdateProfileBody) => Promise<void>
  /** Persist settings (+ optional profile fields), then refresh. */
  putSettings: (body: PutSettingsBody) => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components
export const AppStateContext = createContext<AppStateContextValue | undefined>(
  undefined,
)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [data, setData] = useState<AppData>(() =>
    buildAppData(EMPTY_SLOTS, null),
  )
  const [loading, setLoading] = useState(true)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)

  const slots = useRef<DataSlots>({ ...EMPTY_SLOTS })
  const userRef = useRef<User | null>(user)
  // Guards against races when the user changes mid-fetch.
  const loadSeq = useRef(0)
  // Aborts the in-flight parallel load when a newer load starts or the user
  // logs out, so stale responses are cancelled rather than left hanging.
  const loadController = useRef<AbortController | null>(null)

  const recompute = useCallback(() => {
    setData(buildAppData(slots.current, userRef.current))
  }, [])

  const loadAll = useCallback(async () => {
    const seq = ++loadSeq.current
    // Cancel any in-flight load so a stale response can't land after this one.
    loadController.current?.abort()
    const controller = new AbortController()
    loadController.current = controller
    const signal = controller.signal

    setLoading(true)
    setError(null)
    try {
      const [
        profile,
        resumes,
        dashboard,
        analysis,
        careers,
        skillGap,
        roadmap,
        courses,
        settingsResp,
      ] = await Promise.all([
        api.getProfile(signal).catch(() => null),
        api.listResumes(signal).catch(() => []),
        api.getDashboard(signal).catch(() => null),
        api.getSkills(signal).catch(() => null),
        api.getCareers(signal).catch(() => null),
        api.getSkillGap(signal).catch(() => null),
        api.getRoadmap(signal).catch(() => null),
        api.getCourses(signal).catch(() => null),
        api.getSettings(signal).catch(() => null),
      ])
      // A newer load started while we were awaiting — discard stale data.
      if (seq !== loadSeq.current) return

      const next: DataSlots = { ...EMPTY_SLOTS }
      next.profile = profile
      next.resumes = resumes
      next.dashboard = dashboard
      next.analysis = analysis
      next.careerMatches = careers
      next.skillGap = skillGap
      next.roadmap = roadmap
      next.courses = courses

      // No GET /processing endpoint exists — derive a per-resume status
      // from the analysis that the backend produces for the active resume.
      const activeId = resumes.find((r) => r.status !== 'deleted')?.id ?? null
      next.processing = {}
      for (const r of resumes) {
        next.processing[r.id] = {
          status: r.id === activeId && !analysis ? 'queued' : 'completed',
        }
      }

      slots.current = next
      userRef.current = user
      setSettings(settingsResp?.settings ?? null)
      recompute()
    } catch (err) {
      if (seq !== loadSeq.current) return
      setError(
        err instanceof Error ? err.message : 'Failed to load application data.',
      )
    } finally {
      if (seq === loadSeq.current) setLoading(false)
    }
  }, [recompute, user])

  useEffect(() => {
    userRef.current = user
    if (!user) {
      // The user logged out (or never signed in) — clear all state. These
      // synchronous resets are intentional on the auth-transition effect.
      /* eslint-disable react-hooks/set-state-in-effect */
      loadController.current?.abort()
      loadSeq.current++
      slots.current = { ...EMPTY_SLOTS }
      setData(buildAppData(EMPTY_SLOTS, null))
      setSettings(null)
      setLoading(false)
      setError(null)
      /* eslint-enable react-hooks/set-state-in-effect */
      return
    }
    void loadAll()
    // Re-run only when the signed-in uid changes, not on every token refresh
    // (which mints a new user object); loadAll already closes over `user`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, loadAll])

  const refresh = useCallback(() => {
    void loadAll()
  }, [loadAll])

  const uploadResume = useCallback(
    async (file: File, onProgress?: (percent: number) => void) => {
      const { resumeId } = await api.uploadResume(file, onProgress)

      // Load all immediately so UI reflects the uploaded resume (in 'Processing' state)
      await loadAll()

      // Run the full pipeline in the background so the upload zone isn't blocked.
      const runPipeline = async () => {
        try {
          await api.processResume(resumeId)
          await loadAll()

          await api.analyzeResume(resumeId)
          await loadAll()

          await Promise.allSettled([
            api.generateRoadmap(resumeId),
            api.recommendCourses(resumeId),
          ])
        } catch (err) {
          console.error('Pipeline failed during processing:', err)
        }
        await loadAll()
      }

      void runPipeline()
    },
    [loadAll],
  )

  const deleteResume = useCallback(
    async (resumeId: string) => {
      await api.deleteResume(resumeId)
      await loadAll()
    },
    [loadAll],
  )

  const runAnalysis = useCallback(
    async (resumeId: string) => {
      await api.regenerateAnalysis(resumeId)
      await loadAll()
    },
    [loadAll],
  )

  const regenerateRoadmap = useCallback(
    async (resumeId: string) => {
      await api.regenerateRoadmap(resumeId)
      await loadAll()
    },
    [loadAll],
  )

  const recommendCourses = useCallback(
    async (resumeId: string) => {
      await api.recommendCourses(resumeId)
      await loadAll()
    },
    [loadAll],
  )

  const activeResumeId = useMemo(
    () => data.resume.recent[0]?.id ?? null,
    [data.resume.recent],
  )

  const _runRegenerationPipeline = useCallback(
    async (resumeId: string) => {
      setIsRegenerating(true)
      try {
        await api.regenerateAnalysis(resumeId)
        await loadAll()
        await Promise.allSettled([
          api.generateRoadmap(resumeId),
          api.recommendCourses(resumeId),
        ])
      } catch (err) {
        console.error('Pipeline failed during career target change:', err)
      } finally {
        await loadAll()
        setIsRegenerating(false)
      }
    },
    [loadAll],
  )

  const selectCareer = useCallback(
    async (career: string) => {
      const res = await api.selectCareer(career)
      await loadAll()

      const resumeId =
        (res as { resumeId?: string })?.resumeId || activeResumeId
      if (resumeId) {
        void _runRegenerationPipeline(resumeId)
      }
    },
    [loadAll, activeResumeId, _runRegenerationPipeline],
  )

  const updateProfile = useCallback(
    async (body: UpdateProfileBody) => {
      const oldTarget = data.profile.profile.targetCareer
      await api.updateProfile(body)
      await loadAll()

      if (
        body.targetCareer !== undefined &&
        body.targetCareer !== oldTarget &&
        activeResumeId
      ) {
        void _runRegenerationPipeline(activeResumeId)
      }
    },
    [
      loadAll,
      data.profile.profile.targetCareer,
      activeResumeId,
      _runRegenerationPipeline,
    ],
  )

  const putSettings = useCallback(
    async (body: PutSettingsBody) => {
      const oldTarget = data.profile.profile.targetCareer
      await api.putSettings(body)
      await loadAll()

      if (
        body.targetCareer !== undefined &&
        body.targetCareer !== oldTarget &&
        activeResumeId
      ) {
        void _runRegenerationPipeline(activeResumeId)
      }
    },
    [
      loadAll,
      data.profile.profile.targetCareer,
      activeResumeId,
      _runRegenerationPipeline,
    ],
  )

  const value = useMemo<AppStateContextValue>(
    () => ({
      data,
      loading,
      isRegenerating,
      error,
      refresh,
      activeResumeId,
      settings,
      uploadResume,
      deleteResume,
      runAnalysis,
      regenerateRoadmap,
      recommendCourses,
      updateProfile,
      putSettings,
      selectCareer,
    }),
    [
      data,
      loading,
      isRegenerating,
      error,
      refresh,
      activeResumeId,
      settings,
      uploadResume,
      deleteResume,
      runAnalysis,
      regenerateRoadmap,
      recommendCourses,
      updateProfile,
      putSettings,
      selectCareer,
    ],
  )

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}
