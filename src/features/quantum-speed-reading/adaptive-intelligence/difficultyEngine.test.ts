import { describe, it, expect } from 'vitest'
import { suggestNextDifficulty } from './difficultyEngine'
import { buildSession } from './testFixtures'

describe('suggestNextDifficulty', () => {
  it('recommends Balanced Mode when speed increased but comprehension dropped', () => {
    const previous = buildSession({ wpm: 200, comprehensionPercent: 90 })
    const latest = buildSession({ wpm: 260, comprehensionPercent: 70 })
    const suggestion = suggestNextDifficulty(latest, previous)
    expect(suggestion.kind).toBe('balance')
  })

  it('recommends advancing when accuracy and comprehension both exceed 90%', () => {
    const latest = buildSession({ difficulty: 'easy', accuracyPercent: 95, comprehensionPercent: 95 })
    const suggestion = suggestNextDifficulty(latest, null)
    expect(suggestion.kind).toBe('advance')
    expect(suggestion.suggestedDifficulty).toBe('medium')
  })

  it('has nothing further to advance to at hard difficulty', () => {
    const latest = buildSession({ difficulty: 'hard', accuracyPercent: 95, comprehensionPercent: 95 })
    const suggestion = suggestNextDifficulty(latest, null)
    expect(suggestion.kind).toBe('steady')
    expect(suggestion.suggestedDifficulty).toBe('hard')
  })

  it('recommends repeating when accuracy is below 70%', () => {
    const latest = buildSession({ accuracyPercent: 60, comprehensionPercent: 60 })
    const suggestion = suggestNextDifficulty(latest, null)
    expect(suggestion.kind).toBe('repeat')
  })

  it('recommends steady practice in the 70-90% band', () => {
    const latest = buildSession({ accuracyPercent: 80, comprehensionPercent: 80 })
    const suggestion = suggestNextDifficulty(latest, null)
    expect(suggestion.kind).toBe('steady')
  })

  it('never suggests a difficulty outside easy/medium/hard', () => {
    const latest = buildSession({ difficulty: 'medium', accuracyPercent: 95, comprehensionPercent: 95 })
    const suggestion = suggestNextDifficulty(latest, null)
    expect(['easy', 'medium', 'hard']).toContain(suggestion.suggestedDifficulty)
  })
})
