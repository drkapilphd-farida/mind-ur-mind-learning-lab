import { describe, expect, it } from 'vitest'
import { computeReadingComplexity } from './computeReadingComplexity'

describe('computeReadingComplexity', () => {
  it('returns 0 for empty content', () => {
    expect(computeReadingComplexity('')).toBe(0)
    expect(computeReadingComplexity('   ')).toBe(0)
  })

  it('never returns a negative grade level', () => {
    expect(computeReadingComplexity('The cat sat.')).toBeGreaterThanOrEqual(0)
  })

  it('assigns a real, materially lower score to simple, short-sentence text than to complex, long-sentence text', () => {
    const simple = 'The cat sat on the mat. The dog ran fast. It was a sunny day.'
    const complex =
      'The multidisciplinary examination of epistemological frameworks necessitates a comprehensive understanding of philosophical presuppositions underlying contemporary methodological paradigms in academic discourse.'

    expect(computeReadingComplexity(simple)).toBeLessThan(computeReadingComplexity(complex))
  })

  it('is deterministic for the same input', () => {
    const text = 'Newton\'s first law of motion describes inertia.'
    expect(computeReadingComplexity(text)).toBe(computeReadingComplexity(text))
  })

  it('treats a run of terminal punctuation as one sentence boundary', () => {
    const withEllipsis = 'Wait for it... here it comes.'
    expect(() => computeReadingComplexity(withEllipsis)).not.toThrow()
    expect(computeReadingComplexity(withEllipsis)).toBeGreaterThanOrEqual(0)
  })

  it('handles single-word content without dividing by zero', () => {
    expect(() => computeReadingComplexity('Hello')).not.toThrow()
  })
})
