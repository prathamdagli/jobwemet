import { useAppState } from '@/hooks/useAppState'
import type { CareerMatchesData } from '@/types'

/** AI-recommended career matches and insights. */
export function useCareerMatches(): CareerMatchesData {
  return useAppState().data.careerMatches
}
