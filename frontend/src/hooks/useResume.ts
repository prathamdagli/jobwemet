import { useAppState } from '@/hooks/useAppState'
import type { ResumeState } from '@/types'

/** Shared resume state. The source of truth is the `resumes` collection, which
 *  the Storage onFinalize trigger keeps in sync — so the value here updates in
 *  real time with no optimistic local writes. */
export function useResume(): ResumeState {
  return useAppState().data.resume
}
