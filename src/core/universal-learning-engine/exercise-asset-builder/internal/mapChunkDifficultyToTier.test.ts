import { describe, expect, it } from 'vitest'
import { mapChunkDifficultyToTier } from './mapChunkDifficultyToTier'

describe('mapChunkDifficultyToTier', () => {
  it('preserves beginner verbatim', () => {
    expect(mapChunkDifficultyToTier('beginner')).toBe('beginner')
  })

  it('preserves advanced verbatim', () => {
    expect(mapChunkDifficultyToTier('advanced')).toBe('advanced')
  })

  it('maps intermediate to the medium baseline tier', () => {
    expect(mapChunkDifficultyToTier('intermediate')).toBe('medium')
  })

  it('defaults null to medium, never a fabricated specific tier', () => {
    expect(mapChunkDifficultyToTier(null)).toBe('medium')
  })

  it('is deterministic — the same input always produces the same output', () => {
    const inputs: Array<'beginner' | 'intermediate' | 'advanced' | null> = ['beginner', 'intermediate', 'advanced', null]
    for (const input of inputs) {
      expect(mapChunkDifficultyToTier(input)).toBe(mapChunkDifficultyToTier(input))
    }
  })
})
