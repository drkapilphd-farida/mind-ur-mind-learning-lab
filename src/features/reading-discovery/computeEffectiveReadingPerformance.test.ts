import { describe, expect, it } from 'vitest'
import { computeDwellConsistency, computeEffectiveReadingPerformance } from './computeEffectiveReadingPerformance'

describe('computeEffectiveReadingPerformance', () => {
  it('FIX-16 — is honest with no real measured speed', () => {
    expect(computeEffectiveReadingPerformance({ rawWpm: null, comprehensionAccuracy: 1, hesitationRate: 0, dwellConsistency: 1 })).toBeNull()
  })

  it('FIX-16 — never rewards raw speed alone: poor comprehension pulls the score down', () => {
    const perfectComprehension = computeEffectiveReadingPerformance({ rawWpm: 250, comprehensionAccuracy: 1, hesitationRate: 0, dwellConsistency: 1 })
    const poorComprehension = computeEffectiveReadingPerformance({ rawWpm: 250, comprehensionAccuracy: 0, hesitationRate: 0, dwellConsistency: 1 })
    expect(poorComprehension).toBeLessThan(perfectComprehension!)
  })

  it('FIX-16 — a fast, accurate real session keeps a result close to the raw measured speed', () => {
    const result = computeEffectiveReadingPerformance({ rawWpm: 200, comprehensionAccuracy: 1, hesitationRate: 0, dwellConsistency: 1 })
    expect(result).toBe(200)
  })

  it('never produces a punitive zero, even with poor real comprehension and heavy real hesitation', () => {
    const result = computeEffectiveReadingPerformance({ rawWpm: 200, comprehensionAccuracy: 0, hesitationRate: 1, dwellConsistency: 0 })
    expect(result).toBeGreaterThan(0)
  })

  it('is neutral (multiplier of 1) when no real comprehension signal exists at all', () => {
    const withNull = computeEffectiveReadingPerformance({ rawWpm: 200, comprehensionAccuracy: null, hesitationRate: 0, dwellConsistency: 1 })
    expect(withNull).toBe(200)
  })
})

describe('computeDwellConsistency', () => {
  it('is neutral with fewer than 2 real samples', () => {
    expect(computeDwellConsistency([])).toBe(1)
    expect(computeDwellConsistency([500])).toBe(1)
  })

  it('scores a real, perfectly steady rhythm as fully consistent', () => {
    expect(computeDwellConsistency([500, 500, 500, 500])).toBe(1)
  })

  it('scores a real, highly erratic rhythm lower than a steady one', () => {
    const steady = computeDwellConsistency([500, 510, 495, 505])
    const erratic = computeDwellConsistency([200, 900, 150, 1200])
    expect(erratic).toBeLessThan(steady)
  })
})
