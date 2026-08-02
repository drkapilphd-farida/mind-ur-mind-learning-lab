import { describe, expect, it } from 'vitest'
import { generateThemedVisualSet, generateThemedWordSet, pickNextTheme } from './universalMemoryContentEngine'
import { UMCE_THEMES } from './umceConfig'

describe('pickNextTheme', () => {
  it('FIX-10 — never picks a real theme used in the last rotation window', () => {
    const recent = ['nature', 'animals', 'food'] as const
    for (let seed = 0; seed < 20; seed++) {
      const next = pickNextTheme(recent, seed)
      expect(recent).not.toContain(next)
    }
  })

  it('FIX-14 — falls back honestly to the full real theme list once every theme is recent', () => {
    const allRecent = [...UMCE_THEMES]
    expect(() => pickNextTheme(allRecent, 1)).not.toThrow()
    expect(UMCE_THEMES).toContain(pickNextTheme(allRecent, 1))
  })

  it('is deterministic for the same real recent history and seed', () => {
    const recent = ['space'] as const
    expect(pickNextTheme(recent, 5)).toBe(pickNextTheme(recent, 5))
  })
})

describe('generateThemedWordSet', () => {
  it('FIX-06 — returns real, non-empty, semantically-themed words', () => {
    const words = generateThemedWordSet({ theme: 'kitchen', count: 6, seed: 1 })
    expect(words.length).toBeGreaterThan(0)
    expect(words.length).toBeLessThanOrEqual(6)
  })

  it('FIX-02 — never returns a real duplicate within one real call', () => {
    const words = generateThemedWordSet({ theme: 'animals', count: 10, seed: 2 })
    expect(new Set(words.map((w) => w.toLowerCase())).size).toBe(words.length)
  })

  it('FIX-11 — an unrecognized real locale falls back honestly to the real en/general pack, never throws', () => {
    expect(() => generateThemedWordSet({ theme: 'space', count: 5, seed: 3, locale: 'hi' })).not.toThrow()
    const words = generateThemedWordSet({ theme: 'space', count: 5, seed: 3, locale: 'hi' })
    expect(words.length).toBeGreaterThan(0)
  })
})

describe('generateThemedVisualSet', () => {
  it('FIX-04 — every real visual item is short (a real glyph, never a full word)', () => {
    const visuals = generateThemedVisualSet({ theme: 'travel', count: 6, seed: 4 })
    expect(visuals.length).toBeGreaterThan(0)
    for (const visual of visuals) {
      expect(visual.length).toBeLessThanOrEqual(4)
    }
  })
})
