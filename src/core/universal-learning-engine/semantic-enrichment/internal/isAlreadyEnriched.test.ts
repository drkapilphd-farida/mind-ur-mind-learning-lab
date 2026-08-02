import { describe, expect, it } from 'vitest'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import { isAlreadyEnriched } from './isAlreadyEnriched'

function makeChunk(overrides: Partial<LearningChunk> = {}): LearningChunk {
  return {
    id: 'chunk-1',
    version: { schemaVersion: '1.0.0', revision: 1 },
    status: 'structural',
    metadata: { title: null, documentTitle: 'Doc', contentType: 'text' },
    content: 'Some content.',
    blocks: [{ type: 'paragraph', text: 'Some content.' }],
    source: { documentId: 'doc-1', universalSourceId: 'source-1', sectionId: 'section-0', originalSourceType: 'txt' },
    location: { order: 0, sectionId: 'section-0', sectionHeading: null, totalChunksInDocument: 1 },
    statistics: { wordCount: 2, characterCount: 13, blockCount: 1, paragraphCount: 1, tableCount: 0, mediaCount: 0 },
    readingMetrics: { estimatedReadingSeconds: 1 },
    hierarchy: { depth: 0, path: ['chunk-1'], parentChunkId: null },
    relationships: [],
    confidence: { structural: 1, semantic: null, overall: null },
    media: [],
    tables: [],
    formulas: [],
    code: [],
    citations: [],
    language: { code: null, confidence: null },
    accessibility: { hasAltText: false, imageCount: 0, requiresScreenReaderReview: false },
    tags: { userTags: [], systemTags: [] },
    audit: { createdAt: '2026-01-01T00:00:00.000Z', createdBy: 'system', lastModifiedAt: '2026-01-01T00:00:00.000Z', lastModifiedBy: 'system', history: [] },
    enrichment: {},
    extensions: {},
    ...overrides,
  }
}

describe('isAlreadyEnriched', () => {
  it('returns false for a structural chunk with empty enrichment', () => {
    expect(isAlreadyEnriched(makeChunk())).toBe(false)
  })

  it('returns false for a semantically-enriched status with no real enrichment fields (defensive)', () => {
    expect(isAlreadyEnriched(makeChunk({ status: 'semantically-enriched', enrichment: {} }))).toBe(false)
  })

  it('returns true once status is semantically-enriched and a real UCE-3B field is populated', () => {
    expect(isAlreadyEnriched(makeChunk({ status: 'semantically-enriched', enrichment: { concepts: ['force'] } }))).toBe(true)
  })

  it('recognizes any UCE-3B-owned field, not just concepts', () => {
    expect(isAlreadyEnriched(makeChunk({ status: 'semantically-enriched', enrichment: { difficulty: 'beginner' } }))).toBe(true)
  })

  it('does not treat a UCE-4/UCE-5-owned field alone as evidence of UCE-3B enrichment', () => {
    expect(isAlreadyEnriched(makeChunk({ status: 'semantically-enriched', enrichment: { graphNodeId: 'node-1' } }))).toBe(false)
  })

  it('returns false for a structural chunk even if enrichment somehow has data (status governs)', () => {
    expect(isAlreadyEnriched(makeChunk({ status: 'structural', enrichment: { concepts: ['force'] } }))).toBe(false)
  })
})
