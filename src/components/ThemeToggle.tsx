'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Real, app-wide light/dark toggle — next-themes writes `.dark` on <html>
// (see Providers.tsx), the same class every screen's own dark-mode tokens
// already key off (globals.css's `.dark { ... }` block, present since
// before this component existed but never switchable). Toggling here
// affects the whole app, not just the dashboard — only the Dashboard
// Glass™ surface treatment (glassmorphism, ambient gradients, glow rings)
// is scoped to the dashboard specifically; the theme itself is a real,
// global concern like it is in any app with a light/dark switch.
//
// `mounted` guard: next-themes can't know the real theme during SSR (it
// reads localStorage/prefers-color-scheme client-side only), so rendering
// the resolved icon before mount would be a real hydration mismatch —
// render a neutral, non-flipping placeholder until then instead.
export function ThemeToggle(): React.JSX.Element {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={mounted ? (isDark ? 'Switch to light mode' : 'Switch to dark mode') : 'Toggle theme'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {mounted ? isDark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" /> : <Moon className="size-4 opacity-0" aria-hidden="true" />}
    </Button>
  )
}
