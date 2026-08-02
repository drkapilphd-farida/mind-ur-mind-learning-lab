import { describe, expect, it } from 'vitest'
import { MockPdfContentExtractor } from './mockPdfContentExtractor'
import { makeDocument } from '../testFixtures'

describe('MockPdfContentExtractor', () => {
  it('returns content scoped to the document id', async () => {
    const extractor = new MockPdfContentExtractor()
    const result = await extractor.extract(makeDocument({ id: 'doc-a' }))
    expect(result.documentId).toBe('doc-a')
  })

  it('never returns an empty section list', async () => {
    const extractor = new MockPdfContentExtractor()
    const result = await extractor.extract(makeDocument())
    expect(result.sections.length).toBeGreaterThan(0)
  })

  it('weaves the real document title into rawText', async () => {
    const extractor = new MockPdfContentExtractor()
    const result = await extractor.extract(makeDocument({ title: 'My Custom Title' }))
    expect(result.rawText).toContain('My Custom Title')
  })

  it('gives every section a non-empty title and text', async () => {
    const extractor = new MockPdfContentExtractor()
    const result = await extractor.extract(makeDocument())
    for (const section of result.sections) {
      expect(section.title.length).toBeGreaterThan(0)
      expect(section.text.length).toBeGreaterThan(0)
    }
  })

  it('is deterministic for the same document', async () => {
    const extractor = new MockPdfContentExtractor()
    const first = await extractor.extract(makeDocument())
    const second = await extractor.extract(makeDocument())
    expect(second).toEqual(first)
  })
})
