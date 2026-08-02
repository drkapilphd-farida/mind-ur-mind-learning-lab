import { describe, expect, it } from 'vitest'
import { computeFocusShieldLevel } from './useFocusShield'

describe('computeFocusShieldLevel', () => {
  it('FIX-10 — an empty real history reads as a neutral, real "steady" default', () => {
    expect(computeFocusShieldLevel([])).toBe('steady')
  })

  it('a real recent run of correct outcomes reads as "strong"', () => {
    expect(computeFocusShieldLevel([true, true, true, true, true])).toBe('strong')
  })

  it('a real mixed recent history reads as "steady"', () => {
    expect(computeFocusShieldLevel([true, false, true, false, true])).toBe('steady')
  })

  it('a real recent run of mistakes reads as "building"', () => {
    expect(computeFocusShieldLevel([false, false, false, true, false])).toBe('building')
  })

  it('only ever looks at the real most recent window, never the whole real history', () => {
    const longHistory = [false, false, false, false, false, false, false, false, false, false, true, true, true, true, true]
    expect(computeFocusShieldLevel(longHistory)).toBe('strong')
  })
})
