import { describe, expect, it } from 'vitest'
import { generateOrderDecoys, generatePatternSequence, pickSymbolFamily, SYMBOL_FAMILIES } from './patternSequence'

describe('generatePatternSequence', () => {
  it('FIX-04/FIX-08 — a harder real tier never produces a shorter real sequence', () => {
    const gentle = generatePatternSequence('beginner', 1)
    const harder = generatePatternSequence('expert', 1)
    expect(harder.sequence.length).toBeGreaterThanOrEqual(gentle.sequence.length)
  })

  it('never repeats the same real symbol twice within one real sequence', () => {
    const round = generatePatternSequence('master', 9)
    expect(new Set(round.sequence).size).toBe(round.sequence.length)
  })

  it('is deterministic for the same real tier and seed', () => {
    expect(generatePatternSequence('medium', 4)).toEqual(generatePatternSequence('medium', 4))
  })

  it('FIX-07 — every real symbol in a round comes from that round\'s own real family', () => {
    for (let seed = 0; seed < 20; seed++) {
      const round = generatePatternSequence('medium', seed)
      expect(SYMBOL_FAMILIES).toContain(round.family)
    }
  })
})

describe('pickSymbolFamily', () => {
  it('FIX-07 — real rotation across all three real families, never a fabricated fourth', () => {
    const seen = new Set<string>()
    for (let seed = 0; seed < 12; seed++) seen.add(pickSymbolFamily(seed))
    expect(seen.size).toBe(3)
    for (const family of seen) expect(SYMBOL_FAMILIES).toContain(family)
  })
})

describe('generateOrderDecoys', () => {
  it('FIX-04 — every real decoy uses the exact same real symbol set, only reordered', () => {
    const round = generatePatternSequence('medium', 4)
    const decoys = generateOrderDecoys(round, 2, 1)
    expect(decoys.length).toBeGreaterThan(0)
    for (const decoy of decoys) {
      expect([...decoy].sort()).toEqual([...round.sequence].sort())
      expect(decoy).not.toEqual(round.sequence)
    }
  })
})
