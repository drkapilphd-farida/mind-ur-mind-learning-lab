// Reading preferences persistence — same load/save-with-safe-defaults
// convention as src/lib/exercise-engine/sessionEngine.ts, own storage key.
// Loaded client-side only (see ReadingExperience.tsx, which applies these
// after mount) so server-rendered HTML always starts from DEFAULT_READING_PREFERENCES
// and never mismatches during hydration.

export type ReadingWidth = 'narrow' | 'comfortable' | 'wide'
export type ReadingLineHeight = 'compact' | 'comfortable' | 'relaxed'
export type ReadingTheme = 'light' | 'sepia' | 'dark'
export type ReadingGuide = 'none' | 'underline' | 'highlight' | 'window'

export type ReadingPreferences = {
  fontScale: number
  readingWidth: ReadingWidth
  lineHeight: ReadingLineHeight
  theme: ReadingTheme
  focusMode: boolean
  guide: ReadingGuide
}

const STORAGE_KEY = 'qsr-reading-preferences'

export const FONT_SCALE_STEPS = [0.85, 1, 1.15, 1.3, 1.45] as const
export const READING_WIDTHS: readonly ReadingWidth[] = ['narrow', 'comfortable', 'wide']
export const LINE_HEIGHTS: readonly ReadingLineHeight[] = ['compact', 'comfortable', 'relaxed']
export const READING_THEMES: readonly ReadingTheme[] = ['light', 'sepia', 'dark']
export const READING_GUIDES: readonly ReadingGuide[] = ['none', 'underline', 'highlight', 'window']

export const DEFAULT_READING_PREFERENCES: ReadingPreferences = {
  fontScale: 1,
  readingWidth: 'comfortable',
  lineHeight: 'comfortable',
  theme: 'light',
  focusMode: false,
  guide: 'none',
}

function isReadingWidth(value: unknown): value is ReadingWidth {
  return READING_WIDTHS.includes(value as ReadingWidth)
}

function isLineHeight(value: unknown): value is ReadingLineHeight {
  return LINE_HEIGHTS.includes(value as ReadingLineHeight)
}

function isReadingTheme(value: unknown): value is ReadingTheme {
  return READING_THEMES.includes(value as ReadingTheme)
}

function isReadingGuide(value: unknown): value is ReadingGuide {
  return READING_GUIDES.includes(value as ReadingGuide)
}

export function loadReadingPreferences(): ReadingPreferences {
  if (typeof window === 'undefined') return DEFAULT_READING_PREFERENCES
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_READING_PREFERENCES
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_READING_PREFERENCES

    const p = parsed as Partial<ReadingPreferences>
    return {
      fontScale: FONT_SCALE_STEPS.includes(p.fontScale as (typeof FONT_SCALE_STEPS)[number])
        ? (p.fontScale as number)
        : DEFAULT_READING_PREFERENCES.fontScale,
      readingWidth: isReadingWidth(p.readingWidth) ? p.readingWidth : DEFAULT_READING_PREFERENCES.readingWidth,
      lineHeight: isLineHeight(p.lineHeight) ? p.lineHeight : DEFAULT_READING_PREFERENCES.lineHeight,
      theme: isReadingTheme(p.theme) ? p.theme : DEFAULT_READING_PREFERENCES.theme,
      focusMode: typeof p.focusMode === 'boolean' ? p.focusMode : DEFAULT_READING_PREFERENCES.focusMode,
      guide: isReadingGuide(p.guide) ? p.guide : DEFAULT_READING_PREFERENCES.guide,
    }
  } catch {
    return DEFAULT_READING_PREFERENCES
  }
}

export function saveReadingPreferences(prefs: ReadingPreferences): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // localStorage full or blocked — fail silently, preferences just reset to defaults next visit
  }
}

export function stepFontScale(current: number, direction: 'up' | 'down'): number {
  const currentIndex = FONT_SCALE_STEPS.indexOf(current as (typeof FONT_SCALE_STEPS)[number])
  const safeIndex = currentIndex === -1 ? FONT_SCALE_STEPS.indexOf(1) : currentIndex
  const nextIndex = direction === 'up' ? safeIndex + 1 : safeIndex - 1
  const clampedIndex = Math.min(FONT_SCALE_STEPS.length - 1, Math.max(0, nextIndex))
  return FONT_SCALE_STEPS[clampedIndex] ?? 1
}

export function cycleNext<T>(options: readonly T[], current: T): T {
  const currentIndex = options.indexOf(current)
  const nextIndex = (currentIndex + 1) % options.length
  return options[nextIndex] as T
}
