import { useAppState } from '@/hooks/useAppState'
import type { SkillGapData } from '@/types'

/** Detected vs missing skills, coverage, priorities and recommendations. */
export function useSkillGap(): SkillGapData {
  return useAppState().data.skillGap
}
