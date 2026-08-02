import { describe, expect, it } from 'vitest'
import { makeChunk } from '@/core/universal-learning-engine/universal-learning-object/testFixtures'
import { resolveChunkHeading } from './resolveChunkHeading'

describe('resolveChunkHeading', () => {
  it("prefers the chunk's own real metadata.title when present", () => {
    const chunk = makeChunk('chunk-1', 0, 'Real content.', {}, { metadata: { title: 'Real Title', documentTitle: 'Doc', contentType: 'text' } })
    expect(resolveChunkHeading(chunk)).toBe('Real Title')
  })

  it('falls back to the real location.sectionHeading when there is no real title', () => {
    const chunk = makeChunk('chunk-1', 0, 'Real content.', {}, { metadata: { title: null, documentTitle: 'Doc', contentType: 'text' } })
    expect(resolveChunkHeading(chunk)).toBe(chunk.location.sectionHeading)
  })

  it('falls back to a real positional label when neither a title nor a heading exists', () => {
    const chunk = makeChunk('chunk-1', 2, 'Real content.', {}, { metadata: { title: null, documentTitle: 'Doc', contentType: 'text' }, location: { order: 2, sectionId: 'section-2', sectionHeading: null, totalChunksInDocument: 3 } })
    expect(resolveChunkHeading(chunk)).toBe('Section 3')
  })
})
