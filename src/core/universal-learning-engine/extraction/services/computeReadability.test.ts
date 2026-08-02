import { describe, expect, it } from 'vitest'
import { computeReadability } from './computeReadability'

describe('computeReadability', () => {
  it('counts words, characters, and paragraphs correctly', () => {
    const metrics = computeReadability(['One two three.', 'Four five.'])
    expect(metrics.wordCount).toBe(5)
    expect(metrics.paragraphCount).toBe(2)
    expect(metrics.characterCount).toBeGreaterThan(0)
  })

  it('estimates reading time at a believable pace, minimum 1 minute for any real content', () => {
    const metrics = computeReadability(['A short paragraph with a few words.'])
    expect(metrics.estimatedReadingMinutes).toBeGreaterThanOrEqual(1)
  })

  it('scales estimated reading time with word count', () => {
    const longParagraph = Array.from({ length: 600 }, () => 'word').join(' ')
    const metrics = computeReadability([longParagraph])
    expect(metrics.wordCount).toBe(600)
    expect(metrics.estimatedReadingMinutes).toBe(3)
  })

  it('returns all zeros for no paragraphs', () => {
    const metrics = computeReadability([])
    expect(metrics).toEqual({ wordCount: 0, characterCount: 0, paragraphCount: 0, estimatedReadingMinutes: 0 })
  })
})
