import { describe, expect, it } from 'vitest'
import { computeAfterImageDurationRatioFromSeconds, secondsToAfterImageDurationBucket } from './imageFixationReflection'

describe('secondsToAfterImageDurationBucket', () => {
  it('maps a real duration over 10s to more-than-10s', () => {
    expect(secondsToAfterImageDurationBucket(12)).toBe('more-than-10s')
  })

  it('maps a real duration of exactly 10s to 5-10s (never over-claims more-than-10s)', () => {
    expect(secondsToAfterImageDurationBucket(10)).toBe('5-10s')
  })

  it('maps a real duration between 5 and 10s to 5-10s', () => {
    expect(secondsToAfterImageDurationBucket(7)).toBe('5-10s')
  })

  it('maps a real duration under 5s to less-than-5s', () => {
    expect(secondsToAfterImageDurationBucket(2)).toBe('less-than-5s')
  })

  it('maps a real duration of 0 to not-observed (never fabricates an afterimage that never appeared)', () => {
    expect(secondsToAfterImageDurationBucket(0)).toBe('not-observed')
  })
})

describe('computeAfterImageDurationRatioFromSeconds', () => {
  it('returns 0 for 0 real seconds', () => {
    expect(computeAfterImageDurationRatioFromSeconds(0)).toBe(0)
  })

  it('returns 1 at the 15s cap', () => {
    expect(computeAfterImageDurationRatioFromSeconds(15)).toBe(1)
  })

  it('never exceeds 1 even for a very long real duration', () => {
    expect(computeAfterImageDurationRatioFromSeconds(90)).toBe(1)
  })

  it('scales linearly with the real measured seconds below the cap', () => {
    expect(computeAfterImageDurationRatioFromSeconds(7.5)).toBe(0.5)
  })

  it('never returns a negative ratio for a malformed negative input', () => {
    expect(computeAfterImageDurationRatioFromSeconds(-5)).toBe(0)
  })
})
