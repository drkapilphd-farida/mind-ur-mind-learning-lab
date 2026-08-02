import { describe, expect, it } from 'vitest'
import { normalizeContent } from './normalizeContent'

describe('normalizeContent', () => {
  it('normalizes CRLF and CR line endings to LF', () => {
    const result = normalizeContent('First paragraph.\r\n\r\nSecond paragraph.\rStill second.')
    expect(result.paragraphs).toEqual(['First paragraph.', 'Second paragraph. Still second.'])
  })

  it('collapses runs of blank lines into a single paragraph boundary', () => {
    const result = normalizeContent('One.\n\n\n\n\nTwo.')
    expect(result.paragraphs).toEqual(['One.', 'Two.'])
    expect(result.content).toBe('One.\n\nTwo.')
  })

  it('collapses internal whitespace within a paragraph', () => {
    const result = normalizeContent('Word1   Word2\tWord3')
    expect(result.paragraphs).toEqual(['Word1 Word2 Word3'])
  })

  it('joins wrapped lines within one paragraph into flowing text', () => {
    const result = normalizeContent('This is line one\nand this continues it.\n\nA new paragraph.')
    expect(result.paragraphs).toEqual(['This is line one and this continues it.', 'A new paragraph.'])
  })

  it('preserves reading order across multiple paragraphs', () => {
    const result = normalizeContent('Alpha.\n\nBeta.\n\nGamma.')
    expect(result.paragraphs).toEqual(['Alpha.', 'Beta.', 'Gamma.'])
  })

  it('drops empty/whitespace-only paragraphs entirely', () => {
    const result = normalizeContent('Real text.\n\n   \n\nMore real text.')
    expect(result.paragraphs).toEqual(['Real text.', 'More real text.'])
  })

  it('returns no paragraphs for empty input', () => {
    const result = normalizeContent('')
    expect(result.paragraphs).toEqual([])
    expect(result.content).toBe('')
  })
})
