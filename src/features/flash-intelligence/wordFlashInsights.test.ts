import { describe, it, expect } from 'vitest'
import {
  computeMasteryPercent,
  computeReadingReadiness,
  computePersonalBestWpm,
  computeWeeklyMissionCount,
  computeTodaysImprovement,
} from './wordFlashInsights'
import type { WordFlashSessionEntry } from './wordFlashHistory'

function entry(overrides: Partial<WordFlashSessionEntry>): WordFlashSessionEntry {
  return {
    timestamp: Date.now(),
    tier: 'beginner',
    accuracyPercent: 80,
    flashDurationMs: 500,
    itemCount: 20,
    promoted: false,
    recovered: false,
    recognitionSpeedWpm: 100,
    estimatedWpm: 80,
    estimatedWpmGrowth: null,
    flashXpEarned: 10,
    cumulativeFlashXpAfter: 10,
    stimuli: [],
    ...overrides,
  }
}

describe('computeMasteryPercent', () => {
  it('is 0 at the lowest tier with 0% accuracy', () => {
    expect(computeMasteryPercent('beginner', 0)).toBe(0)
  })

  it('is 100 at the highest tier with 100% accuracy', () => {
    expect(computeMasteryPercent('master', 100)).toBe(100)
  })

  it('increases with both tier and accuracy', () => {
    const low = computeMasteryPercent('beginner', 50)
    const higherTier = computeMasteryPercent('advanced', 50)
    const higherAccuracy = computeMasteryPercent('beginner', 90)
    expect(higherTier).toBeGreaterThan(low)
    expect(higherAccuracy).toBeGreaterThan(low)
  })

  it('never exceeds 100 or drops below 0', () => {
    expect(computeMasteryPercent('master', 100)).toBeLessThanOrEqual(100)
    expect(computeMasteryPercent('beginner', 0)).toBeGreaterThanOrEqual(0)
  })
})

describe('computeReadingReadiness', () => {
  it('reports Ready to Advance when accuracy meets the threshold', () => {
    expect(computeReadingReadiness(90, 85)).toBe('Ready to Advance')
    expect(computeReadingReadiness(85, 85)).toBe('Ready to Advance')
  })

  it('reports Building Consistency when accuracy is below the threshold', () => {
    expect(computeReadingReadiness(70, 85)).toBe('Building Consistency')
  })
})

describe('computePersonalBestWpm', () => {
  it('returns null for empty history', () => {
    expect(computePersonalBestWpm([])).toBeNull()
  })

  it('returns the maximum estimatedWpm across history', () => {
    const history = [entry({ estimatedWpm: 60 }), entry({ estimatedWpm: 120 }), entry({ estimatedWpm: 90 })]
    expect(computePersonalBestWpm(history)).toBe(120)
  })
})

describe('computeWeeklyMissionCount', () => {
  it('counts only sessions within the last 7 days', () => {
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000
    const history = [
      entry({ timestamp: now - 1 * dayMs }),
      entry({ timestamp: now - 6 * dayMs }),
      entry({ timestamp: now - 10 * dayMs }), // outside the window
    ]
    expect(computeWeeklyMissionCount(history, now)).toBe(2)
  })
})

describe('computeTodaysImprovement', () => {
  it('returns null when there is no earlier session today in history', () => {
    const now = Date.now()
    expect(computeTodaysImprovement([], 95, now)).toBeNull()
  })

  it('returns the wpm difference between the current session and the first session today', () => {
    const now = Date.now()
    const historySoFar = [entry({ timestamp: now - 1000, estimatedWpm: 70 })]
    expect(computeTodaysImprovement(historySoFar, 95, now)).toBe(25)
  })

  it('ignores sessions from a different calendar day', () => {
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000
    const historySoFar = [entry({ timestamp: now - dayMs, estimatedWpm: 10 })] // yesterday
    expect(computeTodaysImprovement(historySoFar, 95, now)).toBeNull()
  })
})
