import { describe, expect, it } from 'vitest'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import { mergeEnrichment } from './mergeEnrichment'

function makeChunk(overrides: Partial<LearningChunk> = {}): LearningChunk {
  return {
    id: 'chunk-1',
    version: { schemaVersion: '1.0.0', revision: 1 },
    status: 'structural',
    metadata: { title: 'Newton\'s Laws', documentTitle: 'Physics 101', contentType: 'text' },
    content: 'Newton\'s first law of motion.',
    blocks: [{ type: 'paragraph', text: 'Newton\'s first law of motion.' }],
    source: { documentId: 'doc-1', universalSourceId: 'source-1', sectionId: 'section-0', originalSourceType: 'docx' },
    location: { order: 0, sectionId: 'section-0', sectionHeading: 'Newton\'s Laws', totalChunksInDocument: 1 },
    statistics: { wordCount: 5, characterCount: 30, blockCount: 1, paragraphCount: 1, tableCount: 0, mediaCount: 0 },
    readingMetrics: { estimatedReadingSeconds: 2 },
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

describe('mergeEnrichment', () => {
  it('produces a new chunk sharing id/content/blocks/source with the original', () => {
    const chunk = makeChunk()
    const merged = mergeEnrichment(chunk, { concepts: ['force'] }, 0.9)

    expect(merged.id).toBe(chunk.id)
    expect(merged.content).toBe(chunk.content)
    expect(merged.blocks).toBe(chunk.blocks)
    expect(merged.source).toEqual(chunk.source)
  })

  it('never mutates the original chunk', () => {
    const chunk = makeChunk()
    mergeEnrichment(chunk, { concepts: ['force'] }, 0.9)
    expect(chunk.status).toBe('structural')
    expect(chunk.enrichment).toEqual({})
  })

  it('upgrades status to semantically-enriched and increments the version revision', () => {
    const chunk = makeChunk()
    const merged = mergeEnrichment(chunk, { concepts: ['force'] }, 0.9)
    expect(merged.status).toBe('semantically-enriched')
    expect(merged.version.revision).toBe(2)
    expect(merged.version.schemaVersion).toBe(chunk.version.schemaVersion)
  })

  it('sets confidence.semantic from the parsed confidence and derives a real overall average', () => {
    const chunk = makeChunk()
    const merged = mergeEnrichment(chunk, {}, 0.6)
    expect(merged.confidence).toEqual({ structural: 1, semantic: 0.6, overall: 0.8 })
  })

  it('keeps confidence.semantic/overall null when no real confidence was parsed', () => {
    const chunk = makeChunk()
    const merged = mergeEnrichment(chunk, { concepts: ['force'] }, null)
    expect(merged.confidence).toEqual({ structural: 1, semantic: null, overall: null })
  })

  it('appends one real ChunkAuditEntry and updates lastModifiedAt', () => {
    const chunk = makeChunk()
    const merged = mergeEnrichment(chunk, {}, 0.5, { now: () => new Date('2026-03-05T12:00:00.000Z') })

    expect(merged.audit.lastModifiedAt).toBe('2026-03-05T12:00:00.000Z')
    expect(merged.audit.history).toEqual([{ changedAt: '2026-03-05T12:00:00.000Z', changedBy: 'system', changeSummary: 'Enriched via UCE-3B semantic-enrichment task.' }])
    expect(merged.audit.createdAt).toBe(chunk.audit.createdAt)
  })

  it('merges new enrichment fields on top of existing ones', () => {
    const chunk = makeChunk({ enrichment: { concepts: ['old-concept'], keywords: ['old-keyword'] } })
    const merged = mergeEnrichment(chunk, { concepts: ['new-concept'] }, null)
    expect(merged.enrichment).toEqual({ concepts: ['new-concept'], keywords: ['old-keyword'] })
  })

  it('never blanks out a previously-enriched field when the new response omits it', () => {
    const chunk = makeChunk({ enrichment: { semantic: 'kept', concepts: ['kept-concept'] } })
    const merged = mergeEnrichment(chunk, { keywords: ['new-keyword'] }, null)
    expect(merged.enrichment.concepts).toEqual(['kept-concept'])
    expect(merged.enrichment.keywords).toEqual(['new-keyword'])
  })

  it('accepts a custom changeSummary', () => {
    const chunk = makeChunk()
    const merged = mergeEnrichment(chunk, {}, null, { changeSummary: 'Forced reprocessing.' })
    expect(merged.audit.history[0]?.changeSummary).toBe('Forced reprocessing.')
  })
})
