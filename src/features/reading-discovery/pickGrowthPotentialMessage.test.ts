import { describe, expect, it } from 'vitest'
import { pickGrowthPotentialMessage } from './pickGrowthPotentialMessage'

describe('pickGrowthPotentialMessage', () => {
  it('FIX-22 — every real message is short (5 words or fewer) and never a fabricated WPM promise', () => {
    for (let seed = 0; seed < 6; seed++) {
      const message = pickGrowthPotentialMessage(seed)
      expect(message.split(' ').length).toBeLessThanOrEqual(5)
      expect(message).not.toMatch(/\d/)
    }
  })

  it('is deterministic for the same real seed', () => {
    expect(pickGrowthPotentialMessage(3)).toBe(pickGrowthPotentialMessage(3))
  })
})
