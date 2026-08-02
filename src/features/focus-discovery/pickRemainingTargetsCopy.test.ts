import { describe, expect, it } from 'vitest'
import { pickRemainingTargetsCopy } from './pickRemainingTargetsCopy'

describe('pickRemainingTargetsCopy', () => {
  it('FIX-12 — shows no real line at the very start of a round (nothing has happened yet)', () => {
    expect(pickRemainingTargetsCopy(6, 6)).toBeNull()
  })

  it('FIX-12 — shows no real line once every real target is done', () => {
    expect(pickRemainingTargetsCopy(0, 6)).toBeNull()
  })

  it('FIX-12 — the real final target reads as "Final target."', () => {
    expect(pickRemainingTargetsCopy(1, 6)).toBe('Final target.')
  })

  it('FIX-12 — a real small remaining count reads as "Almost there."', () => {
    expect(pickRemainingTargetsCopy(2, 6)).toBe('Almost there.')
  })

  it('FIX-12 — a real mid-round count reads as generic encouragement', () => {
    expect(pickRemainingTargetsCopy(5, 6)).toBe('Keep going.')
  })

  it('never throws on a real degenerate zero-target round', () => {
    expect(() => pickRemainingTargetsCopy(0, 0)).not.toThrow()
    expect(pickRemainingTargetsCopy(0, 0)).toBeNull()
  })
})
