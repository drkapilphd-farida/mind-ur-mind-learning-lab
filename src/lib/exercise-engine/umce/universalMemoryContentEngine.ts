// Universal Memory Content Engine™ (UMCE) — Sprint-4.
//
// "Generate unlimited memory challenges without changing what is being
// measured. The mission stays the same. The content changes
// infinitely." The one real, public entry point every caller (Memory
// Discovery today; any future module per FIX-15) uses — combines real
// theme rotation (FIX-10), a real curated content pack (FIX-03/04/06),
// and the real quality filter (FIX-13) into two small, focused
// functions. Mission Integrity™ (FIX-01) is preserved by construction:
// this engine only ever supplies WORDS or VISUAL GLYPHS for whichever
// mission asks — it never decides what a mission measures.

import { shuffleArray } from '../randomizationEngine'
import type { Locale } from '@/types/exercise-engine'
import { THEME_ROTATION_WINDOW, UMCE_DEFAULT_CONTEXT, UMCE_DEFAULT_LOCALE, UMCE_THEMES, type UmceContext, type UmceTheme } from './umceConfig'
import { getThemeContentPack } from './themeContentPacks'
import { filterQualityContent } from './qualityFilter'

// FIX-10 — "Avoid showing similar themes consecutively." Excludes
// whichever real themes were used in the last `THEME_ROTATION_WINDOW`
// sessions, picking seeded-randomly from what's left; if every real
// theme has been used recently (a real, honest edge case once enough
// sessions have run), falls back to the full real theme list rather
// than ever returning nothing.
export function pickNextTheme(recentThemes: readonly UmceTheme[], seed: number): UmceTheme {
  const excluded = new Set(recentThemes.slice(-THEME_ROTATION_WINDOW))
  const available = UMCE_THEMES.filter((theme) => !excluded.has(theme))
  const pool = available.length > 0 ? available : UMCE_THEMES
  return shuffleArray(pool, seed)[0]!
}

function pickThemedContent(pool: readonly string[], count: number, seed: number): readonly string[] {
  const quality = filterQualityContent(pool)
  // FIX-02/FIX-13 — honestly under-fills rather than repeating when a
  // real theme pack is genuinely smaller than the requested count (same
  // discipline every dataset loader in this codebase already follows).
  return shuffleArray(quality, seed).slice(0, count)
}

export type ThemedContentRequest = {
  theme: UmceTheme
  count: number
  seed: number
  locale?: Locale
  context?: UmceContext
}

// FIX-04/FIX-06 — real, semantically-coherent word/visual sets for one
// real theme. Two separate calls (never mixed) so a caller can draw a
// themed word set for Word Memory and, independently, a themed visual
// set for Visual Memory/Shape Recognition within the same real theme.
export function generateThemedWordSet({ theme, count, seed, locale = UMCE_DEFAULT_LOCALE, context = UMCE_DEFAULT_CONTEXT }: ThemedContentRequest): readonly string[] {
  const pack = getThemeContentPack(theme, locale, context)
  return pickThemedContent(pack.words, count, seed)
}

export function generateThemedVisualSet({ theme, count, seed, locale = UMCE_DEFAULT_LOCALE, context = UMCE_DEFAULT_CONTEXT }: ThemedContentRequest): readonly string[] {
  const pack = getThemeContentPack(theme, locale, context)
  return pickThemedContent(pack.visuals, count, seed)
}

export type { UmceTheme, UmceContext } from './umceConfig'
export { UMCE_THEMES } from './umceConfig'
