import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  EMPTY_SLOTS,
  subscribeCareerMatches,
  subscribeCourses,
  subscribeDashboard,
  subscribeUserProfile,
  subscribeResumeProcessing,
  subscribeRoadmap,
  subscribeSkillAnalysis,
  subscribeSkillGap,
  subscribeUserResumes,
  type DataSlots,
  type FirestoreError,
} from '@/services/firebase'
import { buildAppData } from '@/services/firebase/mappers'
import type { AppData } from '@/types'

export interface AppStateContextValue {
  /** The full application data tree shared across every page. */
  data: AppData
  /** True while the initial subscription data is settling in. */
  loading: boolean
  /** Populated when a subscription fails. */
  error: string | null
  /** Clear transient errors. Realtime listeners keep data fresh automatically. */
  refresh: () => void
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
  const [error, setError] = useState<string | null>(null)

  const slots = useRef<DataSlots>({ ...EMPTY_SLOTS })
  const mainUnsubs = useRef<Array<() => void>>([])
  const derivedUnsubs = useRef<Array<() => void>>([])
  const currentResumeId = useRef<string | null>(null)
  const userRef = useRef(user)

  const recompute = useCallback(() => {
    setData(buildAppData(slots.current, userRef.current))
  }, [])

  // Subscribe to the resume-derived collections (analysis, matches, gap,
  // roadmap, courses, dashboard) for a single active resume, re-attaching
  // whenever the latest resume changes.
  const attachDerived = useCallback(
    (resumeId: string | null) => {
      derivedUnsubs.current.forEach((u) => u())
      derivedUnsubs.current = []
      if (!resumeId) return

      const onErr = (e: FirestoreError) =>
        setError(e.message || 'Failed to load resume data.')

      derivedUnsubs.current.push(
        subscribeSkillAnalysis(
          resumeId,
          (d) => {
            slots.current.analysis = d
            recompute()
          },
          onErr,
        ),
        subscribeCareerMatches(
          resumeId,
          (d) => {
            slots.current.careerMatches = d
            recompute()
          },
          onErr,
        ),
        subscribeSkillGap(
          resumeId,
          (d) => {
            slots.current.skillGap = d
            recompute()
          },
          onErr,
        ),
        subscribeRoadmap(
          resumeId,
          (d) => {
            slots.current.roadmap = d
            recompute()
          },
          onErr,
        ),
        subscribeCourses(
          resumeId,
          (d) => {
            slots.current.courses = d
            recompute()
          },
          onErr,
        ),
        subscribeDashboard(
          resumeId,
          (d) => {
            slots.current.dashboard = d
            recompute()
          },
          onErr,
        ),
      )
    },
    [recompute],
  )

  useEffect(() => {
    userRef.current = user
    if (!user) {
      mainUnsubs.current.forEach((u) => u())
      mainUnsubs.current = []
      derivedUnsubs.current.forEach((u) => u())
      derivedUnsubs.current = []
      currentResumeId.current = null
      slots.current = { ...EMPTY_SLOTS }
      // Direct auth-driven reset to empty state — intentional sync, not derived.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(buildAppData(EMPTY_SLOTS, null))
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    const onErr = (e: FirestoreError) =>
      setError(e.message || 'Failed to load application data.')

    const local: Array<() => void> = []

    local.push(
      subscribeUserProfile(
        user.uid,
        (doc) => {
          slots.current.profile = doc
          setLoading(false)
          recompute()
        },
        onErr,
      ),
    )

    local.push(
      subscribeUserResumes(
        user.uid,
        (docs) => {
          slots.current.resumes = docs
          const latest = docs.find((r) => r.status !== 'deleted')?.id ?? null
          if (latest !== currentResumeId.current) {
            currentResumeId.current = latest
            attachDerived(latest)
          }
          recompute()
        },
        onErr,
      ),
    )

    local.push(
      subscribeResumeProcessing(
        user.uid,
        (map) => {
          slots.current.processing = map
          recompute()
        },
        onErr,
      ),
    )

    mainUnsubs.current = local
    return () => {
      local.forEach((u) => u())
      derivedUnsubs.current.forEach((u) => u())
      derivedUnsubs.current = []
      mainUnsubs.current = []
    }
  }, [user?.uid, attachDerived, recompute])

  const refresh = useCallback(() => {
    setError(null)
  }, [])

  const value = useMemo<AppStateContextValue>(
    () => ({ data, loading, error, refresh }),
    [data, loading, error, refresh],
  )

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}
