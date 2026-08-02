import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  DEFAULT_READING_PREFERENCES,
  loadReadingPreferences,
  saveReadingPreferences,
  stepFontScale,
  cycleNext,
  FONT_SCALE_STEPS,
  READING_WIDTHS,
  READING_THEMES,
} from './readingPreferences'

// This suite's default vitest environment is 'node' (see vitest.config.ts),
// so `window`/`localStorage` don't exist unless stubbed — matching every
// other exercise in this codebase, loadReadingPreferences/saveReadingPreferences
// treat a missing `window` as "not in a browser" and fall back to safe
// defaults. To exercise the actual parsing/fallback logic here, we stub a
// minimal in-memory localStorage for just this file.
function createMemoryStorage(): Storage {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value) },
    removeItem: (key: string) => { store.delete(key) },
    clear: () => { store.clear() },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() { return store.size },
  }
}

beforeEach(() => {
  vi.stubGlobal('window', {})
  vi.stubGlobal('localStorage', createMemoryStorage())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('loadReadingPreferences', () => {
  it('returns safe defaults when nothing is stored', () => {
    expect(loadReadingPreferences()).toEqual(DEFAULT_READING_PREFERENCES)
  })

  it('round-trips a saved preference set', () => {
    const prefs = { ...DEFAULT_READING_PREFERENCES, theme: 'dark' as const, focusMode: true }
    saveReadingPreferences(prefs)
    expect(loadReadingPreferences()).toEqual(prefs)
  })

  it('falls back to defaults for corrupted storage', () => {
    localStorage.setItem('qsr-reading-preferences', '{not-json')
    expect(loadReadingPreferences()).toEqual(DEFAULT_READING_PREFERENCES)
  })

  it('falls back per-field for invalid values rather than discarding everything', () => {
    localStorage.setItem('qsr-reading-preferences', JSON.stringify({ theme: 'neon', fontScale: 999, focusMode: true }))
    const loaded = loadReadingPreferences()
    expect(loaded.theme).toBe(DEFAULT_READING_PREFERENCES.theme)
    expect(loaded.fontScale).toBe(DEFAULT_READING_PREFERENCES.fontScale)
    expect(loaded.focusMode).toBe(true)
  })

  it('returns defaults when window is unavailable (SSR)', () => {
    vi.unstubAllGlobals()
    expect(loadReadingPreferences()).toEqual(DEFAULT_READING_PREFERENCES)
  })
})

describe('stepFontScale', () => {
  it('steps up and down through the fixed scale list', () => {
    expect(stepFontScale(1, 'up')).toBe(1.15)
    expect(stepFontScale(1, 'down')).toBe(0.85)
  })

  it('clamps at the ends of the scale', () => {
    expect(stepFontScale(FONT_SCALE_STEPS[FONT_SCALE_STEPS.length - 1] as number, 'up')).toBe(FONT_SCALE_STEPS[FONT_SCALE_STEPS.length - 1])
    expect(stepFontScale(FONT_SCALE_STEPS[0] as number, 'down')).toBe(FONT_SCALE_STEPS[0])
  })
})

describe('cycleNext', () => {
  it('cycles forward and wraps around', () => {
    expect(cycleNext(READING_WIDTHS, 'narrow')).toBe('comfortable')
    expect(cycleNext(READING_WIDTHS, 'wide')).toBe('narrow')
  })

  it('works for the theme list too', () => {
    expect(cycleNext(READING_THEMES, 'light')).toBe('sepia')
  })
})
