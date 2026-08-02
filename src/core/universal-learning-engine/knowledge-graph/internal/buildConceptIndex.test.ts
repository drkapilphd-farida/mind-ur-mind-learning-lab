import { describe, expect, it } from 'vitest'
import type { ChunkEnrichment, LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import { buildConceptIndex } from './buildConceptIndex'

function makeChunk(id: string, order: number, enrichment: ChunkEnrichment = {}): LearningChunk {
  return {
    id,
    version: { schemaVersion: '1.0.0', revision: 1 },
    status: 'structural',
    metadata: { title: null, documentTitle: 'Doc', contentType: 'text' },
    content: `Content for ${id}.`,
    blocks: [{ type: 'paragraph', text: `Content for ${id}.` }],
    source: { documentId: 'doc-1', universalSourceId: 'source-1', sectionId: 'section-0', originalSourceType: 'txt' },
    location: { order, sectionId: 'section-0', sectionHeading: null, totalChunksInDocument: 1 },
    statistics: { wordCount: 3, characterCount: 20, blockCount: 1, paragraphCount: 1, tableCount: 0, mediaCount: 0 },
    readingMetrics: { estimatedReadingSeconds: 1 },
    hierarchy: { depth: 0, path: [id], parentChunkId: null },
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
    enrichment,
    extensions: {},
  }
}

describe('buildConceptIndex', () => {
  it('creates one concept node per distinct concept label', () => {
    const chunks = [makeChunk('chunk-1', 0, { concepts: ['force', 'motion'] })]
    const index = buildConceptIndex(chunks)
    expect(index.size).toBe(2)
    expect(index.get('force')?.label).toBe('force')
  })

  it('deduplicates the same concept appearing in multiple chunks into one node', () => {
    const chunks = [makeChunk('chunk-1', 0, { concepts: ['Force'] }), makeChunk('chunk-2', 1, { concepts: ['force'] })]
    const index = buildConceptIndex(chunks)
    expect(index.size).toBe(1)
    const node = index.get('force')
    expect(node?.occurrenceCount).toBe(2)
    expect(node?.chunkIds).toEqual(['chunk-1', 'chunk-2'])
  })

  it('keeps the earliest real occurrence\'s original casing as the display label', () => {
    const chunks = [makeChunk('chunk-2', 1, { concepts: ['FORCE'] }), makeChunk('chunk-1', 0, { concepts: ['Force'] })]
    const index = buildConceptIndex(chunks)
    expect(index.get('force')?.label).toBe('Force')
  })

  it('does not double-count a concept appearing in multiple enrichment fields of the same chunk', () => {
    const chunks = [makeChunk('chunk-1', 0, { concepts: ['inertia'], keywords: ['Inertia'] })]
    const index = buildConceptIndex(chunks)
    expect(index.get('inertia')?.occurrenceCount).toBe(1)
    expect(index.get('inertia')?.chunkIds).toEqual(['chunk-1'])
  })

  it('draws labels from concepts, keywords, importantTerms, entities, and definitions.term', () => {
    const chunks = [
      makeChunk('chunk-1', 0, {
        concepts: ['concept-a'],
        keywords: ['keyword-a'],
        importantTerms: ['term-a'],
        entities: ['entity-a'],
        definitions: [{ term: 'definition-a', definition: 'some definition' }],
      }),
    ]
    const index = buildConceptIndex(chunks)
    expect([...index.keys()].sort()).toEqual(['concept-a', 'definition-a', 'entity-a', 'keyword-a', 'term-a'])
  })

  it('returns an empty index for chunks with no enrichment', () => {
    const index = buildConceptIndex([makeChunk('chunk-1', 0)])
    expect(index.size).toBe(0)
  })

  it('assigns stable, deterministic ids independent of chunk input order', () => {
    const forward = buildConceptIndex([makeChunk('chunk-1', 0, { concepts: ['force'] }), makeChunk('chunk-2', 1, { concepts: ['motion'] })])
    const reversed = buildConceptIndex([makeChunk('chunk-2', 1, { concepts: ['motion'] }), makeChunk('chunk-1', 0, { concepts: ['force'] })])
    expect(forward.get('force')?.id).toBe(reversed.get('force')?.id)
    expect(forward.get('motion')?.id).toBe(reversed.get('motion')?.id)
  })
})
