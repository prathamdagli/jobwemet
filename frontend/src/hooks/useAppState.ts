import { useContext } from 'react'
import {
  AppStateContext,
  type AppStateContextValue,
} from '@/contexts/AppStateContext'

/** Raw access to the full application state. Throws outside the provider. */
export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext)
  if (ctx === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider')
  }
  return ctx
}
