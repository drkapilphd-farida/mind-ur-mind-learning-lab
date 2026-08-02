import { describe, expect, it } from 'vitest'
import { pickRoundFeedback } from './pickRoundFeedback'

describe('pickRoundFeedback', () => {
  it('FIX-08 — a real correct round always gets a positive, short message', () => {
    const message = pickRoundFeedback(true, 0, 1)
    expect(message.length).toBeGreaterThan(0)
    expect(message.split(' ').length).toBeLessThanOrEqual(6)
  })

  it('FIX-08 — a real missed round never uses judgmental language', () => {
    for (let seed = 0; seed < 5; seed++) {
      const message = pickRoundFeedback(false, 0, seed)
      expect(message).not.toMatch(/wrong|fail|incorrect|poor/i)
    }
  })

  it('FIX-10 — alternating real correct rounds surface an AI presence nudge', () => {
    const message = pickRoundFeedback(true, 1, 2)
    expect(['Let’s increase the challenge.', 'You’re adapting quickly.', 'Ready for something harder?']).toContain(message)
  })

  it('is deterministic for the same real inputs', () => {
    expect(pickRoundFeedback(true, 2, 7)).toBe(pickRoundFeedback(true, 2, 7))
  })
})
