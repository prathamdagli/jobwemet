import { useAppState } from '@/hooks/useAppState'
import type { ProfileData } from '@/types'

/** The user's profile + career overview data. */
export function useProfile(): ProfileData {
  return useAppState().data.profile
}
