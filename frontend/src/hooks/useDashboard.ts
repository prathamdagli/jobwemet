import { useAppState } from '@/hooks/useAppState'
import type { DashboardSummary } from '@/types'

/** Aggregated summary metrics shown on the dashboard home. */
export function useDashboard(): DashboardSummary {
  return useAppState().data.dashboardSummary
}
