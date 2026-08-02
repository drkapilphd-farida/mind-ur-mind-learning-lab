import { describe, expect, it } from 'vitest'
import type { LearningChunk } from '../types/LearningChunk'
import { deserializeLearningChunk, serializeLearningChunk } from './learningChunkSerializer'

function makeValidChunk(): LearningChunk {
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
    location: { order: 0, sectionId: 'section-0', sectionHeading: 'Heading one', totalChunksInDocument: 1 },
    statistics: { wordCount: 4, characterCount: 29, blockCount: 2, paragraphCount: 1, tableCount: 0, mediaCount: 0 },
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
  }
}

describe('learningChunkSerializer', () => {
  it('round-trips a valid chunk with full fidelity', () => {
    const chunk = makeValidChunk()
    const result = deserializeLearningChunk(serializeLearningChunk(chunk))
    expect(result).toEqual({ success: true, chunk })
  })

  it('rejects a payload that is not valid JSON', () => {
    const result = deserializeLearningChunk('{not json')
    expect(result).toEqual({ success: false, error: 'Payload is not valid JSON.' })
  })

  it('rejects a JSON payload that is not an object', () => {
    const result = deserializeLearningChunk('"just a string"')
    expect(result).toEqual({ success: false, error: 'Payload is not a LearningChunk object.' })
  })

  it('rejects a structurally invalid chunk with the validator\'s real errors', () => {
    const corrupted = { ...makeValidChunk(), id: '' }
    const result = deserializeLearningChunk(JSON.stringify(corrupted))
    expect(result.success).toBe(false)
    expect(result.success === false && result.error).toContain('id must not be empty')
  })
})
