// Universal Memory Content Engine™ (UMCE) — Sprint-4 FIX-10/FIX-14
// "Smart Theme Rotation™ / Session Uniqueness™."
//
// A small, localStorage-backed record of which real themes were used in
// the last few real sessions — mirrors Memory Discovery's own
// `recentContentHistory.ts` pattern exactly (same SSR-safe guard, same
// bounded-recency shape), kept here in the shared `umce/` folder since
// any future consumer of this engine needs the same real rotation
// discipline, not just Memory Discovery.

import { UMCE_THEMES, type UmceTheme } from './umceConfig'

const HISTORY_KEY = 'umce-recent-themes'
const MAX_SESSIONS = 8

function loadHistory(): UmceTheme[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((theme): theme is UmceTheme => (UMCE_THEMES as readonly string[]).includes(theme))
  } catch {
    return []
  }
}

export function getRecentThemes(): readonly UmceTheme[] {
  return loadHistory()
}

export function recordThemeUsed(theme: UmceTheme): void {
  if (typeof window === 'undefined') return
  try {
    const history = [...loadHistory(), theme].slice(-MAX_SESSIONS)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch {
    // storage full or blocked — fail silently, rotation just degrades to
    // "any real theme," never a crash.
  }
}
