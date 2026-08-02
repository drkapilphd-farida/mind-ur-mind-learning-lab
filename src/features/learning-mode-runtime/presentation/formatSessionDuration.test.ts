import { describe, expect, it } from 'vitest'
import { formatElapsedDuration, formatEstimatedTimeRemaining } from './formatSessionDuration'

describe('formatElapsedDuration', () => {
  it('formats real seconds as mm:ss, zero-padded', () => {
    expect(formatElapsedDuration(0)).toBe('0:00')
    expect(formatElapsedDuration(5)).toBe('0:05')
    expect(formatElapsedDuration(65)).toBe('1:05')
    expect(formatElapsedDuration(3661)).toBe('61:01')
  })

  it('never returns a negative duration for a real clock-skew edge case', () => {
    expect(formatElapsedDuration(-5)).toBe('0:00')
  })
})

describe('formatEstimatedTimeRemaining', () => {
  it('reports a real, honest "less than a minute" floor', () => {
    expect(formatEstimatedTimeRemaining(0)).toBe('Less than a minute left')
    expect(formatEstimatedTimeRemaining(20)).toBe('Less than a minute left')
  })

  it('rounds to the nearest minute under an hour', () => {
    expect(formatEstimatedTimeRemaining(90)).toBe('~2 min left')
    expect(formatEstimatedTimeRemaining(600)).toBe('~10 min left')
  })

  it('reports real hours and minutes at or beyond an hour', () => {
    expect(formatEstimatedTimeRemaining(3600)).toBe('~1 hr left')
    expect(formatEstimatedTimeRemaining(4500)).toBe('~1 hr 15 min left')
  })
})
