import { describe, expect, it } from 'vitest'
import { resolveReadingStyle } from './resolveReadingStyle'

describe('resolveReadingStyle', () => {
  it('returns Building Reading Confidence for low real average comprehension', () => {
    const style = resolveReadingStyle([
      { stage: 'word-chunk', wpm: 200, comprehensionPercent: 30 },
      { stage: 'paragraph', wpm: 220, comprehensionPercent: 40 },
    ])
    expect(style).toBe('Building Reading Confidence')
  })

  it('returns Deep Comprehension Reader for high real average comprehension', () => {
    const style = resolveReadingStyle([
      { stage: 'word-chunk', wpm: 180, comprehensionPercent: 90 },
      { stage: 'paragraph', wpm: 190, comprehensionPercent: 85 },
    ])
    expect(style).toBe('Deep Comprehension Reader')
  })

  it('returns Natural Chunk Reader when paragraph-stage speed is notably faster than word-chunk-stage speed', () => {
    const style = resolveReadingStyle([
      { stage: 'word-chunk', wpm: 150, comprehensionPercent: 70 },
      { stage: 'paragraph', wpm: 250, comprehensionPercent: 70 },
    ])
    expect(style).toBe('Natural Chunk Reader')
  })

  it('returns Steady, Consistent Reader for moderate comprehension with a flat speed trend', () => {
    const style = resolveReadingStyle([
      { stage: 'word-chunk', wpm: 200, comprehensionPercent: 65 },
      { stage: 'paragraph', wpm: 205, comprehensionPercent: 65 },
    ])
    expect(style).toBe('Steady, Consistent Reader')
  })

  it('returns Building Reading Confidence honestly for no stage results', () => {
    expect(resolveReadingStyle([])).toBe('Building Reading Confidence')
  })
})
