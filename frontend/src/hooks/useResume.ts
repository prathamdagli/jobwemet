import { useAppState } from '@/hooks/useAppState'
import type { ResumeState } from '@/types'

export interface UseResumeResult {
  resume: ResumeState
  uploadResume: (fileName: string) => void
}

/** Shared resume state plus the action to record a new upload. */
export function useResume(): UseResumeResult {
  const { data, uploadResume } = useAppState()
  return { resume: data.resume, uploadResume }
}
