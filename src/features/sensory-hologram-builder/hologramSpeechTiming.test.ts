import { describe, expect, it } from 'vitest'
import { countWords, estimateSpeechDurationMs } from './hologramSpeechTiming'

describe('countWords', () => {
  it('counts whitespace-separated words', () => {
    expect(countWords('You are safe here.')).toBe(4)
  })

  it('collapses repeated whitespace and trims edges', () => {
    expect(countWords('  hello   world  ')).toBe(2)
  })

  it('returns 0 for empty or whitespace-only text', () => {
    expect(countWords('')).toBe(0)
    expect(countWords('   ')).toBe(0)
  })
})

describe('estimateSpeechDurationMs', () => {
  it('estimates a longer duration for a longer sentence at the same rate', () => {
    const short = estimateSpeechDurationMs('You are safe here.', 0.85)
    const long = estimateSpeechDurationMs(
      'You see endless peaks stretching below you, bathed in golden morning light, as the wind moves gently past.',
      0.85,
    )
    expect(long).toBeGreaterThan(short)
  })

  it('a slower rate produces a longer duration for the same text', () => {
    const text = 'Let the colors, the light, every detail become vivid and real.'
    const slow = estimateSpeechDurationMs(text, 0.6)
    const fast = estimateSpeechDurationMs(text, 1.2)
    expect(slow).toBeGreaterThan(fast)
  })

  it('never returns less than the minimum floor, even for a single short word', () => {
    expect(estimateSpeechDurationMs('Yes.', 1)).toBeGreaterThanOrEqual(1800)
  })

  it('never returns less than the minimum floor for empty text', () => {
    expect(estimateSpeechDurationMs('', 1)).toBeGreaterThanOrEqual(1800)
  })
})
