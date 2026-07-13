import { useEffect } from 'react'
import { useAppState } from '@/hooks/useAppState'

/**
 * Applies the user's saved theme by toggling the `.dark` class on the document
 * root. Tailwind v4 resolves the `dark:` variant from that class (see
 * `@custom-variant dark` in index.css), so this is what makes the Settings
 * theme selector actually take effect.
 */
export function useTheme() {
  const { settings } = useAppState()
  const theme = settings?.theme ?? 'system'

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
      const isDark = theme === 'dark' || (theme === 'system' && media.matches)
      root.classList.toggle('dark', isDark)
    }

    apply()
    if (theme === 'system') {
      media.addEventListener('change', apply)
      return () => media.removeEventListener('change', apply)
    }
    return undefined
  }, [theme])
}
