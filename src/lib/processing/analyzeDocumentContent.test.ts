import { describe, expect, it } from 'vitest'
import { analyzeDocumentContent } from './analyzeDocumentContent'

describe('analyzeDocumentContent', () => {
  it('labels a real known mime type by its honest format name', () => {
    expect(analyzeDocumentContent({ mimeType: 'application/pdf', sizeBytes: 12000 }).formatLabel).toBe('PDF document')
    expect(analyzeDocumentContent({ mimeType: 'image/png', sizeBytes: 12000 }).formatLabel).toBe('image')
  })

  it('falls back to a generic label for a real but unrecognized/null mime type', () => {
    expect(analyzeDocumentContent({ mimeType: null, sizeBytes: 12000 }).formatLabel).toBe('document')
    expect(analyzeDocumentContent({ mimeType: 'application/octet-stream', sizeBytes: 12000 }).formatLabel).toBe('document')
  })

  it('derives a real, size-proportional reading-time estimate rather than a fixed number', () => {
    const small = analyzeDocumentContent({ mimeType: 'text/plain', sizeBytes: 1200 })
    const large = analyzeDocumentContent({ mimeType: 'text/plain', sizeBytes: 120000 })
    expect(large.estimatedReadingMinutes).toBeGreaterThan(small.estimatedReadingMinutes)
  })

  it('never returns zero minutes for a real nonzero document, even a tiny one', () => {
    expect(analyzeDocumentContent({ mimeType: 'text/plain', sizeBytes: 10 }).estimatedReadingMinutes).toBeGreaterThanOrEqual(1)
  })

  it('handles a real null sizeBytes honestly rather than throwing', () => {
    expect(analyzeDocumentContent({ mimeType: 'text/plain', sizeBytes: null }).estimatedReadingMinutes).toBeGreaterThanOrEqual(1)
  })
})
