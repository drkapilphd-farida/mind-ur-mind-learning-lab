import { describe, expect, it } from 'vitest'
import { resolveReadingConfidence } from './resolveReadingConfidence'

describe('resolveReadingConfidence', () => {
  it('reads low confidence from a high real pause count', () => {
    expect(resolveReadingConfidence({ completionPercentage: 80, pauseCount: 3 })).toBe('low')
  })

  it('reads low confidence from a low real completion percentage', () => {
    expect(resolveReadingConfidence({ completionPercentage: 10, pauseCount: 0 })).toBe('low')
  })

  it('reads high confidence from zero pauses and steady real progress', () => {
    expect(resolveReadingConfidence({ completionPercentage: 60, pauseCount: 0 })).toBe('high')
  })

  it('reads medium confidence for everything in between', () => {
    expect(resolveReadingConfidence({ completionPercentage: 60, pauseCount: 1 })).toBe('medium')
  })
})
