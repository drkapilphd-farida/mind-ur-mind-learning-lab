import { describe, expect, it } from 'vitest'
import {
  GAZE_ASSETS,
  GAZE_CATEGORY_LABELS,
  GAZE_DURATION_CHOICES_MS,
  ROUNDS_PER_SESSION,
  RETENTION_BASE_POINTS,
  buildSessionRounds,
  computeStreakMultiplier,
  computePointsForRating,
  nextStreak,
  type GazeCategory,
} from './afterImageGazingDataset'

const CATEGORIES: readonly GazeCategory[] = ['geometric', 'cosmic', 'silhouette']

describe('GAZE_ASSETS', () => {
  it('defines at least 50 unique assets across exactly 3 categories', () => {
    expect(GAZE_ASSETS.length).toBeGreaterThanOrEqual(50)
    expect(new Set(GAZE_ASSETS.map((a) => a.id)).size).toBe(GAZE_ASSETS.length)
    expect(new Set(GAZE_ASSETS.map((a) => a.category))).toEqual(new Set(CATEGORIES))
  })

  it('every category is represented and labeled', () => {
    for (const category of CATEGORIES) {
      expect(GAZE_ASSETS.some((a) => a.category === category)).toBe(true)
      expect(GAZE_CATEGORY_LABELS[category]).toBeTruthy()
    }
  })

  it('never pairs a dominant color with itself as its own complementary', () => {
    for (const asset of GAZE_ASSETS) {
      expect(asset.complementaryHex).not.toBe(asset.dominantHex)
    }
  })

  it('only silhouette assets carry an accent color (the duotone icon-on-field treatment)', () => {
    for (const asset of GAZE_ASSETS) {
      if (asset.category === 'silhouette') {
        expect(asset.accentHex).toBeDefined()
      } else {
        expect(asset.accentHex).toBeUndefined()
      }
    }
  })

  it('does not reference any real or identifiable person in its labels', () => {
    const suspiciousWords = ['actor', 'actress', 'celebrity', 'star wars', 'hollywood']
    for (const asset of GAZE_ASSETS) {
      const lowerLabel = asset.label.toLowerCase()
      for (const word of suspiciousWords) {
        expect(lowerLabel.includes(word)).toBe(false)
      }
    }
  })

  it('includes a true black/white negative treatment alongside the colorful duotone cards', () => {
    const silhouetteAssets = GAZE_ASSETS.filter((a) => a.category === 'silhouette')
    const negativeAssets = silhouetteAssets.filter((a) => a.treatment === 'negative')
    const duotoneAssets = silhouetteAssets.filter((a) => a.treatment === 'duotone')
    expect(negativeAssets.length).toBeGreaterThan(0)
    expect(duotoneAssets.length).toBeGreaterThan(0)
    expect(negativeAssets.length + duotoneAssets.length).toBe(silhouetteAssets.length)
    for (const asset of negativeAssets) {
      // A true negative is always black-on-white or white-on-black —
      // never a mid-saturation hue — for maximum luminance contrast.
      expect(['Black', 'White']).toContain(asset.dominantColorLabel)
    }
  })

  it('only silhouette assets carry a treatment field; geometric/cosmic assets do not', () => {
    for (const asset of GAZE_ASSETS) {
      if (asset.category === 'silhouette') {
        expect(asset.treatment).toBeDefined()
      } else {
        expect(asset.treatment).toBeUndefined()
      }
    }
  })
})

describe('buildSessionRounds', () => {
  it('defaults to the master deck and produces exactly ROUNDS_PER_SESSION rounds', () => {
    const rounds = buildSessionRounds()
    expect(ROUNDS_PER_SESSION).toBe(6)
    expect(rounds.length).toBe(ROUNDS_PER_SESSION)
  })

  it('every round in the master deck has a unique asset', () => {
    const rounds = buildSessionRounds('master')
    expect(new Set(rounds.map((r) => r.asset.id)).size).toBe(rounds.length)
  })

  it('a single-category selection only draws assets from that category', () => {
    for (const category of CATEGORIES) {
      const rounds = buildSessionRounds(category)
      expect(rounds.length).toBe(ROUNDS_PER_SESSION)
      expect(rounds.every((r) => r.asset.category === category)).toBe(true)
      expect(new Set(rounds.map((r) => r.asset.id)).size).toBe(rounds.length)
    }
  })

  it('every round gets a gaze duration from the allowed 15-30s set', () => {
    const rounds = buildSessionRounds()
    for (const round of rounds) {
      expect(GAZE_DURATION_CHOICES_MS).toContain(round.gazeDurationMs)
    }
  })
})

describe('computeStreakMultiplier', () => {
  it('stays at x1 for streaks 0-1, steps to x2 at streak 2', () => {
    expect(computeStreakMultiplier(0)).toBe(1)
    expect(computeStreakMultiplier(1)).toBe(1)
    expect(computeStreakMultiplier(2)).toBe(2)
  })
})

describe('computePointsForRating', () => {
  it('every rating tier still earns nonzero points, even "none"', () => {
    expect(computePointsForRating('none', 0)).toBeGreaterThan(0)
    expect(computePointsForRating('none', 0)).toBe(RETENTION_BASE_POINTS.none)
  })

  it('clear earns more than faint, which earns more than none, at the same streak', () => {
    const clear = computePointsForRating('clear', 0)
    const faint = computePointsForRating('faint', 0)
    const none = computePointsForRating('none', 0)
    expect(clear).toBeGreaterThan(faint)
    expect(faint).toBeGreaterThan(none)
  })

  it('applies the streak multiplier on top of the base rating value', () => {
    expect(computePointsForRating('clear', 2)).toBe(RETENTION_BASE_POINTS.clear * 2)
  })
})

describe('nextStreak', () => {
  it('continues the streak on "clear" or "faint", resets only on "none"', () => {
    expect(nextStreak(3, 'clear')).toBe(4)
    expect(nextStreak(3, 'faint')).toBe(4)
    expect(nextStreak(3, 'none')).toBe(0)
  })
})
