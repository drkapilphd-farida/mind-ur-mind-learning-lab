import { describe, expect, it } from 'vitest'
import type { LearningChunk } from '../types/LearningChunk'
import { validateLearningChunk } from './validateLearningChunk'

function makeValidChunk(overrides: Partial<LearningChunk> = {}): LearningChunk {
  return {
    id: 'chunk-1',
    version: { schemaVersion: '1.0.0', revision: 1 },
    status: 'structural',
    metadata: { title: 'Heading one', documentTitle: 'Notes', contentType: 'text' },
    content: 'Heading one\n\nFirst paragraph.',
    blocks: [
      { type: 'heading', level: 1, text: 'Heading one' },
      { type: 'paragraph', text: 'First paragraph.' },
    ],
    source: { documentId: 'doc-1', universalSourceId: 'source-1', sectionId: 'section-0', originalSourceType: 'docx' },
    location: { order: 0, sectionId: 'section-0', sectionHeading: 'Heading one', totalChunksInDocument: 2 },
    statistics: { wordCount: 4, characterCount: 29, blockCount: 2, paragraphCount: 1, tableCount: 0, mediaCount: 0 },
    readingMetrics: { estimatedReadingSeconds: 2 },
    hierarchy: { depth: 0, path: ['chunk-1'], parentChunkId: null },
    relationships: [{ type: 'next', targetChunkId: 'chunk-2', confidence: 1, computedBy: 'structural' }],
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

describe('validateLearningChunk', () => {
  it('accepts a well-formed chunk', () => {
    expect(validateLearningChunk(makeValidChunk())).toEqual({ valid: true })
  })

  it('rejects an empty id', () => {
    const result = validateLearningChunk(makeValidChunk({ id: '' }))
    expect(result.valid).toBe(false)
    expect(result.valid === false && result.errors).toContain('id must not be empty')
  })

  it('rejects a revision below 1', () => {
    const result = validateLearningChunk(makeValidChunk({ version: { schemaVersion: '1.0.0', revision: 0 } }))
    expect(result.valid).toBe(false)
    expect(result.valid === false && result.errors).toContain('version.revision must be an integer >= 1')
  })

  it('rejects order out of range against totalChunksInDocument', () => {
    const result = validateLearningChunk(makeValidChunk({ location: { order: 2, sectionId: 'section-0', sectionHeading: null, totalChunksInDocument: 2 } }))
    expect(result.valid).toBe(false)
    expect(result.valid === false && result.errors).toContain('location.order must be less than location.totalChunksInDocument')
  })

  it('rejects content that does not match the real text of blocks', () => {
    const result = validateLearningChunk(makeValidChunk({ content: 'Something else entirely.' }))
    expect(result.valid).toBe(false)
    expect(result.valid === false && result.errors).toContain('content does not match the real text of blocks')
  })

  it('rejects a characterCount that does not match content.length', () => {
    const result = validateLearningChunk(makeValidChunk({ statistics: { wordCount: 4, characterCount: 999, blockCount: 2, paragraphCount: 1, tableCount: 0, mediaCount: 0 } }))
    expect(result.valid).toBe(false)
    expect(result.valid === false && result.errors).toContain('statistics.characterCount does not match content.length')
  })

  it('rejects an out-of-range confidence value', () => {
    const result = validateLearningChunk(makeValidChunk({ confidence: { structural: 1.5, semantic: null, overall: null } }))
    expect(result.valid).toBe(false)
    expect(result.valid === false && result.errors).toContain('confidence.structural must be between 0 and 1')
  })

  it('rejects a relationship pointing at itself', () => {
    const result = validateLearningChunk(makeValidChunk({ relationships: [{ type: 'next', targetChunkId: 'chunk-1', confidence: 1, computedBy: 'structural' }] }))
    expect(result.valid).toBe(false)
    expect(result.valid === false && result.errors).toContain('relationships[].targetChunkId must not reference the chunk itself')
  })

  it('rejects an invalid audit timestamp', () => {
    const result = validateLearningChunk(makeValidChunk({ audit: { createdAt: 'not-a-date', createdBy: 'system', lastModifiedAt: '2026-01-01T00:00:00.000Z', lastModifiedBy: 'system', history: [] } }))
    expect(result.valid).toBe(false)
    expect(result.valid === false && result.errors).toContain('audit.createdAt must be a valid ISO date string')
  })

  it('collects every violation at once rather than short-circuiting', () => {
    const result = validateLearningChunk(makeValidChunk({ id: '', version: { schemaVersion: '', revision: 0 } }))
    expect(result.valid).toBe(false)
    expect(result.valid === false && result.errors.length).toBeGreaterThanOrEqual(3)
  })
})
