import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppState } from '@/hooks/useAppState'

const STORAGE_KEY = 'jobwemet:readNotifications'

function loadRead(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

function saveRead(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
  } catch {
    /* ignore persistence failures */
  }
}

/**
 * Notifications are derived from the real activity feed produced by the backend
 * (resume upload, AI analysis, roadmap generation, course recommendations).
 * Read-state is tracked locally since the backend stores activity but not a
 * per-user read flag. Empty activity → "all caught up" empty state.
 */
export function useNotifications() {
  const { data } = useAppState()
  const items = useMemo(
    () => data.profile?.activity ?? [],
    [data.profile?.activity],
  )
  const [read, setRead] = useState<Set<string>>(() => loadRead())

  // Whenever the activity set changes, promote new titles into the read set is
  // NOT done automatically — new items stay unread until dismissed.
  useEffect(() => {
    saveRead(read)
  }, [read])

  const unreadCount = useMemo(
    () => items.filter((i) => !read.has(i.title)).length,
    [items, read],
  )

  const marked = useMemo(
    () => items.map((i) => ({ ...i, unread: !read.has(i.title) })),
    [items, read],
  )

  const markAllRead = useCallback(() => {
    setRead(new Set(items.map((i) => i.title)))
  }, [items])

  return { items: marked, unreadCount, markAllRead, hasUnread: unreadCount > 0 }
}
