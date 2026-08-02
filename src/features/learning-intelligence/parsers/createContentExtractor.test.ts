import { describe, expect, it } from 'vitest'
import { createContentExtractor } from './createContentExtractor'
import { MockPdfContentExtractor } from './mockPdfContentExtractor'
import { UnsupportedDocumentTypeError } from './UnsupportedDocumentTypeError'

describe('createContentExtractor', () => {
  it('returns a MockPdfContentExtractor for application/pdf', () => {
    const extractor = createContentExtractor('application/pdf')
    expect(extractor).toBeInstanceOf(MockPdfContentExtractor)
  })

  it('throws UnsupportedDocumentTypeError for an unregistered mimeType', () => {
    expect(() => createContentExtractor('application/msword')).toThrow(UnsupportedDocumentTypeError)
  })

  it('throws UnsupportedDocumentTypeError for a null mimeType', () => {
    expect(() => createContentExtractor(null)).toThrow(UnsupportedDocumentTypeError)
  })

  it('returns a fresh instance on every call', () => {
    const first = createContentExtractor('application/pdf')
    const second = createContentExtractor('application/pdf')
    expect(first).not.toBe(second)
  })
})
