import { useAppState } from '@/hooks/useAppState'
import type { CoursesData } from '@/types'

/** Recommended courses, AI insights and learning overview stats. */
export function useCourses(): CoursesData {
  return useAppState().data.courses
}
