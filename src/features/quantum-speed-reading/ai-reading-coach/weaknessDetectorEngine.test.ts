import { describe, it, expect } from 'vitest'
import { detectWeaknesses } from './weaknessDetectorEngine'
import { buildSession } from './testFixtures'

describe('detectWeaknesses', () => {
  it('detects nothing for a strong, consistent session with no history', () => {
    const weaknesses = detectWeaknesses(buildSession({ wpm: 200, comprehensionPercent: 90, accuracyPercent: 90 }), [])
    expect(weaknesses).toHaveLength(0)
  })

  it('detects reading too quickly when speed is far above target and comprehension is low', () => {
    const weaknesses = detectWeaknesses(buildSession({ difficulty: 'easy', wpm: 400, comprehensionPercent: 60 }), [])
    expect(weaknesses.some((w) => w.id === 'reading-too-fast')).toBe(true)
  })

  it('detects reading too slowly when speed is far below target despite strong comprehension', () => {
    const weaknesses = detectWeaknesses(buildSession({ difficulty: 'easy', wpm: 100, comprehensionPercent: 95 }), [])
    expect(weaknesses.some((w) => w.id === 'reading-too-slow')).toBe(true)
  })

  it('detects high speed with low accuracy', () => {
    const weaknesses = detectWeaknesses(buildSession({ difficulty: 'easy', wpm: 250, accuracyPercent: 50, comprehensionPercent: 80 }), [])
    expect(weaknesses.some((w) => w.id === 'high-speed-low-accuracy')).toBe(true)
  })

  it('detects inconsistent pacing across recent sessions', () => {
    const recent = [buildSession({ readingTimeMs: 20_000 }), buildSession({ readingTimeMs: 150_000 })]
    const weaknesses = detectWeaknesses(buildSession({ readingTimeMs: 60_000 }), recent)
    expect(weaknesses.some((w) => w.id === 'inconsistent-pacing')).toBe(true)
  })

  it('detects a declining accuracy trend', () => {
    const recent = [buildSession({ accuracyPercent: 95 }), buildSession({ accuracyPercent: 90 })]
    const weaknesses = detectWeaknesses(buildSession({ accuracyPercent: 50 }), recent)
    expect(weaknesses.some((w) => w.id === 'declining-accuracy')).toBe(true)
  })

  it('does not evaluate trend-based weaknesses with too little history', () => {
    const weaknesses = detectWeaknesses(buildSession({ accuracyPercent: 50 }), [])
    expect(weaknesses.some((w) => w.id === 'declining-accuracy')).toBe(false)
    expect(weaknesses.some((w) => w.id === 'inconsistent-pacing')).toBe(false)
  })
})
