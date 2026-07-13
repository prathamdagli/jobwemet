import { useAppState } from '@/hooks/useAppState'
import type { RoadmapData } from '@/types'

/** The personalized learning roadmap, insights and stats. */
export function useRoadmap(): RoadmapData {
  return useAppState().data.roadmap
}
