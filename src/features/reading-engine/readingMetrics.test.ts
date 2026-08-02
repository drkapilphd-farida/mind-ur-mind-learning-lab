import { describe, it, expect } from 'vitest'
import { computeWpm, formatElapsedTime, countWords, computeUnitDwellMs } from './readingMetrics'

describe('computeWpm / formatElapsedTime re-exports', () => {
  it('re-exports the same canonical WPM/time functions readingSessionEngine.ts already provides', () => {
    expect(computeWpm(50, 10_000)).toBe(300)
    expect(formatElapsedTime(65_000)).toBe('1:05')
  })
})

describe('countWords', () => {
  it('counts a single word as 1', () => {
    expect(countWords('Knowledge')).toBe(1)
  })

  it('counts a multi-word phrase', () => {
    expect(countWords('the quick brown fox')).toBe(4)
  })

  it('collapses extra whitespace', () => {
    expect(countWords('  hello    world  ')).toBe(2)
  })

  it('returns 0 for empty or whitespace-only text', () => {
    expect(countWords('')).toBe(0)
    expect(countWords('   ')).toBe(0)
  })
})

describe('computeUnitDwellMs', () => {
  it('gives a 3-word unit exactly 3x the dwell time of a 1-word unit at the same target WPM', () => {
    const targetWpm = 300
    const oneWordMs = computeUnitDwellMs('Focus', targetWpm)
    const threeWordMs = computeUnitDwellMs('the quick fox', targetWpm)
    expect(threeWordMs).toBe(oneWordMs * 3)
  })

  it('matches 60000/targetWpm for a single-word unit', () => {
    expect(computeUnitDwellMs('Growth', 300)).toBe(200)
    expect(computeUnitDwellMs('Growth', 500)).toBe(120)
  })

  it('scales inversely with target WPM', () => {
    const slow = computeUnitDwellMs('a whole paragraph of words here', 100)
    const fast = computeUnitDwellMs('a whole paragraph of words here', 500)
    expect(slow).toBe(fast * 5)
  })
})
