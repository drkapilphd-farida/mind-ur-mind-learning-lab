import { describe, it, expect } from 'vitest'
import { formatDuration } from './types'

describe('formatDuration', () => {
  it('returns empty string for 0', () => {
    expect(formatDuration(0)).toBe('')
  })

  it('returns seconds for values under a minute', () => {
    expect(formatDuration(1)).toBe('1s')
    expect(formatDuration(59)).toBe('59s')
  })

  it('returns minutes for values under an hour', () => {
    expect(formatDuration(60)).toBe('1 min')
    expect(formatDuration(90)).toBe('1 min')
    expect(formatDuration(120)).toBe('2 min')
    expect(formatDuration(3599)).toBe('59 min')
  })

  it('returns hours for values >= 3600', () => {
    expect(formatDuration(3600)).toBe('1h')
    expect(formatDuration(7200)).toBe('2h')
  })

  it('includes remaining minutes when hours are fractional', () => {
    expect(formatDuration(3661)).toBe('1h 1min')
    expect(formatDuration(5400)).toBe('1h 30min')
    expect(formatDuration(7260)).toBe('2h 1min')
  })
})
