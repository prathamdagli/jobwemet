import { useAppState } from '@/hooks/useAppState'
import type { SkillsData } from '@/types'

/** Extracted technical + soft skills and AI insights. */
export function useSkills(): SkillsData {
  return useAppState().data.skills
}
