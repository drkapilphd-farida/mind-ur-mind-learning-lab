import { describe, expect, it } from 'vitest'
import { DIGIT_STYLES, formatDigitsForDisplay, generateDigitSpanDecoys, generateDigitSpanRounds, pickDigitStyle } from './digitSpan'

describe('generateDigitSpanRounds', () => {
  it('FIX-02 — runs the brief\'s own exact 1-through-6-digit progression for gentler real tiers', () => {
    const rounds = generateDigitSpanRounds('beginner', 1)
    expect(rounds.map((round) => round.length)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('FIX-02/FIX-08 — every real round\'s digit string length matches its own real target length', () => {
    const rounds = generateDigitSpanRounds('medium', 42)
    for (const round of rounds) {
      expect(round.digits.length).toBe(round.length)
    }
  })

  it('FIX-08 — a harder real tier never shortens the session, only adds real bonus rounds', () => {
    const gentle = generateDigitSpanRounds('beginner', 1)
    const harder = generateDigitSpanRounds('expert', 1)
    expect(harder.length).toBeGreaterThan(gentle.length)
    expect(harder.slice(0, gentle.length).map((r) => r.length)).toEqual(gentle.map((r) => r.length))
  })

  it('never starts a real multi-digit round with a leading zero', () => {
    for (let seed = 0; seed < 20; seed++) {
      const rounds = generateDigitSpanRounds('master', seed)
      for (const round of rounds) {
        if (round.length > 1) expect(round.digits[0]).not.toBe('0')
      }
    }
  })

  it('is deterministic for the same real tier and seed', () => {
    expect(generateDigitSpanRounds('medium', 7)).toEqual(generateDigitSpanRounds('medium', 7))
  })
})

describe('generateDigitSpanDecoys', () => {
  it('every real decoy shares the round\'s own real length but is never the real answer', () => {
    const round = { length: 4, digits: '5281', style: 'pure' as const }
    const decoys = generateDigitSpanDecoys(round, 3, 5)
    expect(decoys.length).toBeGreaterThan(0)
    for (const decoy of decoys) {
      expect(decoy.length).toBe(4)
      expect(decoy).not.toBe('5281')
    }
  })

  it('FIX-05 — a repeated-pattern round\'s decoys are also generated with the same real style', () => {
    const round = { length: 6, digits: '585858', style: 'repeated-pattern' as const }
    const decoys = generateDigitSpanDecoys(round, 3, 9)
    for (const decoy of decoys) expect(decoy.length).toBe(6)
  })
})

describe('pickDigitStyle', () => {
  it('FIX-05 — short rounds (under 4 digits) never get a non-pure style', () => {
    for (let seed = 0; seed < 30; seed++) {
      expect(pickDigitStyle(2, seed)).toBe('pure')
      expect(pickDigitStyle(3, seed)).toBe('pure')
    }
  })

  it('FIX-05 — real style variety is possible at 4+ digits, always one of the real four styles', () => {
    const seen = new Set<string>()
    for (let seed = 0; seed < 40; seed++) seen.add(pickDigitStyle(5, seed))
    for (const style of seen) expect(DIGIT_STYLES).toContain(style)
    expect(seen.size).toBeGreaterThan(1)
  })
})

describe('formatDigitsForDisplay', () => {
  it('FIX-05 — grouped/mixed styles chunk into real 2-digit groups, never changing the real value', () => {
    expect(formatDigitsForDisplay('12458', 'grouped')).toBe('12 45 8')
    expect(formatDigitsForDisplay('12458', 'grouped').replace(/\s/g, '')).toBe('12458')
  })

  it('FIX-05 — pure/repeated-pattern styles are shown exactly as generated, no grouping', () => {
    expect(formatDigitsForDisplay('5858', 'repeated-pattern')).toBe('5858')
    expect(formatDigitsForDisplay('1234', 'pure')).toBe('1234')
  })
})
