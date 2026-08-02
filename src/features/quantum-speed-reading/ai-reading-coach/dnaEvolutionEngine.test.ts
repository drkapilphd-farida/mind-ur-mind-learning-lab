import { describe, it, expect } from 'vitest'
import { computeDnaEvolution } from './dnaEvolutionEngine'
import { buildSession } from './testFixtures'

describe('computeDnaEvolution', () => {
  it('returns 6 dimensions with empty trends for no sessions', () => {
    const traits = computeDnaEvolution([])
    expect(traits).toHaveLength(6)
    for (const trait of traits) expect(trait.trend).toHaveLength(0)
  })

  it('builds a trend point per session when history is small', () => {
    const sessions = [buildSession(), buildSession(), buildSession()]
    const traits = computeDnaEvolution(sessions)
    expect(traits[0]!.trend).toHaveLength(3)
    expect(traits[0]!.trend.map((p) => p.sessionCount)).toEqual([1, 2, 3])
  })

  it('confidence rises across the trend as more sessions accumulate', () => {
    const sessions = Array.from({ length: 5 }, () => buildSession())
    const traits = computeDnaEvolution(sessions)
    const trend = traits[0]!.trend
    expect(trend[trend.length - 1]!.confidence).toBeGreaterThan(trend[0]!.confidence)
  })

  it('caps the number of checkpoints for very long histories', () => {
    const sessions = Array.from({ length: 40 }, () => buildSession())
    const traits = computeDnaEvolution(sessions)
    expect(traits[0]!.trend.length).toBeLessThanOrEqual(8)
    // Final checkpoint should reach the full session count.
    expect(traits[0]!.trend[traits[0]!.trend.length - 1]!.sessionCount).toBe(40)
  })

  it('ignores incomplete sessions', () => {
    const traits = computeDnaEvolution([buildSession({ completed: false })])
    expect(traits[0]!.trend).toHaveLength(0)
  })

  it('the final label matches computing DNA on the full real history', () => {
    const sessions = [buildSession({ wpm: 320 }), buildSession({ wpm: 320 }), buildSession({ wpm: 320 })]
    const traits = computeDnaEvolution(sessions)
    const readingStyle = traits.find((t) => t.dimension === 'reading-style')
    expect(readingStyle?.label).toBe('Fast Reader')
  })
})
