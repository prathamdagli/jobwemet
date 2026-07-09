import { createContext, useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { fetchAppData } from '@/services/app.service'
import { initialAppData } from '@/mock/data'
import type { AppData } from '@/types'

export interface AppStateContextValue {
  /** The full application data tree shared across every page. */
  data: AppData
  /** True while the initial (or a manual) data load is in flight. */
  loading: boolean
  /** Populated when a load fails. */
  error: string | null
  /** Re-run the data load (simulates re-fetching from the AI backend). */
  refresh: () => Promise<void>
  /**
   * Record a newly uploaded resume. Updates the shared resume slice so the
   * Dashboard, Skills, Career Matches, Skill Gap, Roadmap and Courses views
   * all read from the same source.
   */
  uploadResume: (fileName: string) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AppStateContext = createContext<AppStateContextValue | undefined>(
  undefined,
)

export function AppStateProvider({ children }: { children: ReactNode }) {
  // Seed synchronously from the mock so pages render immediately with no
  // layout-shifting skeletons, then refresh from the async service layer.
  const [data, setData] = useState<AppData>(initialAppData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const next = await fetchAppData()
      setData(next)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load application data.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadResume = useCallback((fileName: string) => {
    setData((prev) => ({
      ...prev,
      resume: {
        ...prev.resume,
        fileName,
        uploaded: 'Just now',
        recent: [
          {
            id: `u-${prev.resume.recent.length + 1}`,
            name: fileName,
            uploaded: 'Just now',
          },
          ...prev.resume.recent,
        ],
      },
    }))
  }, [])

  const value = useMemo<AppStateContextValue>(
    () => ({ data, loading, error, refresh, uploadResume }),
    [data, loading, error, refresh, uploadResume],
  )

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}
