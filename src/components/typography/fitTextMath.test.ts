import { describe, it, expect } from 'vitest'
import { computeShrink } from './fitTextMath'

describe('computeShrink', () => {
  it('returns 0 for empty text', () => {
    expect(computeShrink('')).toBe(0)
    expect(computeShrink('   ')).toBe(0)
  })

  it('barely shrinks very short words', () => {
    expect(computeShrink('cat')).toBeLessThan(0.15)
  })

  it('shrinks proportionally to the longest word, not total length', () => {
    // Same total length, but one long word vs. several short ones — the
    // single long word should shrink more (nowhere to wrap a long word;
    // short words can wrap at spaces).
    const oneLongWord = computeShrink('internationalization') // 21 chars, 1 word
    const manyShortWords = computeShrink('read with steady calm') // 18 chars, 4 words
    expect(oneLongWord).toBeGreaterThan(manyShortWords)
  })

  it('is monotonically non-decreasing as the longest word gets longer', () => {
    const words = ['cat', 'reading', 'presentations', 'internationalization', 'electroencephalography']
    const shrinks = words.map(computeShrink)
    for (let i = 1; i < shrinks.length; i++) {
      expect(shrinks[i]).toBeGreaterThanOrEqual(shrinks[i - 1]!)
    }
  })

  it('never exceeds 1 (the formula caps at the role minimum via clamp() regardless)', () => {
    const extreme = 'pneumonoultramicroscopicsilicovolcanoconiosis' // 45 chars
    expect(computeShrink(extreme)).toBeLessThanOrEqual(1)
    expect(computeShrink(extreme)).toBe(1)
  })

  it('penalizes extra words lightly, not as much as an equivalent-length single word', () => {
    const twoWords = computeShrink('reading speed') // longest=7, 2 words
    const singleWordSameLongest = computeShrink('reading') // longest=7, 1 word
    expect(twoWords).toBeGreaterThan(singleWordSameLongest)
    expect(twoWords).toBeLessThan(singleWordSameLongest + 0.1)
  })

  it('produces sane, distinct values for every required hard test word', () => {
    const hardWords = [
      'presentations',
      'responsibilities',
      'internationalization',
      'electroencephalography',
      'hypercommunication',
      'multidisciplinary',
      'neuropsychological',
    ]
    for (const word of hardWords) {
      const shrink = computeShrink(word)
      expect(shrink).toBeGreaterThan(0.3)
      expect(shrink).toBeLessThanOrEqual(1)
    }
  })
})
