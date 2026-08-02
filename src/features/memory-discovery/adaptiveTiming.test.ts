import { describe, expect, it } from 'vitest'
import { clampDigitSpanMultiplier, computeReadingSpeedMultiplier, nextPerformanceMultiplier } from './adaptiveTiming'

describe('computeReadingSpeedMultiplier', () => {
  it('FIX-03 — falls back to no adjustment when real Reading Discovery data is unavailable', () => {
    expect(computeReadingSpeedMultiplier(null)).toBe(1)
  })

  it('FIX-03 — a real faster-than-reference reader gets a real reduced multiplier', () => {
    expect(computeReadingSpeedMultiplier(280)).toBeLessThan(1)
  })

  it('FIX-03 — a real slower-than-reference reader gets a real increased multiplier', () => {
    expect(computeReadingSpeedMultiplier(120)).toBeGreaterThan(1)
  })

  it('FIX-04 — never exceeds the shared real ±20% band, even for an extreme real WPM', () => {
    expect(computeReadingSpeedMultiplier(1000)).toBeGreaterThanOrEqual(0.8)
    expect(computeReadingSpeedMultiplier(1)).toBeLessThanOrEqual(1.2)
  })
})

describe('nextPerformanceMultiplier', () => {
  it('FIX-04 — several real correct answers in a row compound into a real, gradual reduction', () => {
    let multiplier = 1
    for (let i = 0; i < 3; i++) multiplier = nextPerformanceMultiplier(multiplier, true)
    expect(multiplier).toBeLessThan(1)
  })

  it('FIX-04 — real repeated misses compound into a real, gradual increase', () => {
    let multiplier = 1
    for (let i = 0; i < 3; i++) multiplier = nextPerformanceMultiplier(multiplier, false)
    expect(multiplier).toBeGreaterThan(1)
  })

  it('never creates a dramatic jump — one real step stays small', () => {
    expect(Math.abs(nextPerformanceMultiplier(1, true) - 1)).toBeLessThanOrEqual(0.1)
  })

  it('never exceeds the shared real ±20% band even after many real consecutive correct answers', () => {
    let multiplier = 1
    for (let i = 0; i < 20; i++) multiplier = nextPerformanceMultiplier(multiplier, true)
    expect(multiplier).toBeGreaterThanOrEqual(0.8)
  })
})

describe('clampDigitSpanMultiplier', () => {
  it('Sprint-4.1 FIX-08 — Number Memory\'s own real band is tighter than the shared ±20% band', () => {
    expect(clampDigitSpanMultiplier(0.7)).toBe(0.85)
    expect(clampDigitSpanMultiplier(1.3)).toBe(1.15)
  })

  it('passes a real value through unchanged when already inside the real ±15% band', () => {
    expect(clampDigitSpanMultiplier(1)).toBe(1)
    expect(clampDigitSpanMultiplier(0.9)).toBe(0.9)
  })
})
