import { describe, expect, it } from 'vitest'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import { buildEnrichmentPrompt } from './buildEnrichmentPrompt'

function makeChunk(overrides: Partial<LearningChunk> = {}): LearningChunk {
  return {
    id: 'chunk-1',
    version: { schemaVersion: '1.0.0', revision: 1 },
    status: 'structural',
    metadata: { title: 'Newton\'s Laws', documentTitle: 'Physics 101', contentType: 'text' },
    content: 'Newton\'s first law states that an object in motion stays in motion unless acted upon by a force.',
    blocks: [{ type: 'paragraph', text: 'Newton\'s first law states that an object in motion stays in motion unless acted upon by a force.' }],
    source: { documentId: 'doc-1', universalSourceId: 'source-1', sectionId: 'section-0', originalSourceType: 'docx' },
    location: { order: 0, sectionId: 'section-0', sectionHeading: 'Newton\'s Laws', totalChunksInDocument: 1 },
    statistics: { wordCount: 16, characterCount: 96, blockCount: 1, paragraphCount: 1, tableCount: 0, mediaCount: 0 },
    readingMetrics: { estimatedReadingSeconds: 5 },
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

function makeDocument(overrides: Partial<UniversalLearningDocument> = {}): UniversalLearningDocument {
  return {
    id: 'doc-1',
    title: 'Physics 101',
    language: null,
    metadata: {},
    content: 'Full document content.',
    sections: [],
    paragraphs: [],
    wordCount: 16,
    pageCount: null,
    source: { id: 'source-1', name: 'physics.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extension: 'docx', size: 100, language: null, sourceType: 'docx', status: 'ready', uploadedAt: '2026-01-01T00:00:00.000Z', metadata: {} },
    ...overrides,
  }
}

describe('buildEnrichmentPrompt', () => {
  it('includes the chunk\'s real content verbatim', () => {
    const payload = buildEnrichmentPrompt(makeChunk(), makeDocument())
    const userMessage = payload.messages.find((message) => message.role === 'user')
    expect(userMessage?.content).toContain('Newton\'s first law states that an object in motion stays in motion unless acted upon by a force.')
  })

  it('includes the real document title and section heading as context', () => {
    const payload = buildEnrichmentPrompt(makeChunk(), makeDocument())
    const userMessage = payload.messages.find((message) => message.role === 'user')
    expect(userMessage?.content).toContain('Physics 101')
    expect(userMessage?.content).toContain('Newton\'s Laws')
  })

  it('omits the section line when the chunk has no heading', () => {
    const payload = buildEnrichmentPrompt(makeChunk({ location: { order: 0, sectionId: 'section-0', sectionHeading: null, totalChunksInDocument: 1 } }), makeDocument())
    const userMessage = payload.messages.find((message) => message.role === 'user')
    expect(userMessage?.content).not.toContain('Section:')
  })

  it('instructs the model to return a single JSON object with every UCE-3B-owned field', () => {
    const payload = buildEnrichmentPrompt(makeChunk(), makeDocument())
    const systemMessage = payload.messages.find((message) => message.role === 'system')
    for (const field of ['summary', 'concepts', 'keywords', 'importantTerms', 'definitions', 'entities', 'learningObjectives', 'misconceptions', 'examples', 'prerequisites', 'dependencies', 'difficulty', 'importance', 'confidence']) {
      expect(systemMessage?.content).toContain(field)
    }
  })

  it('instructs the model never to fabricate content', () => {
    const payload = buildEnrichmentPrompt(makeChunk(), makeDocument())
    const systemMessage = payload.messages.find((message) => message.role === 'system')
    expect(systemMessage?.content.toLowerCase()).toContain('never invent')
  })

  it('does not set modelId/temperature/maxOutputTokens — leaves those to AIFoundation defaults', () => {
    const payload = buildEnrichmentPrompt(makeChunk(), makeDocument())
    expect(payload.modelId).toBeUndefined()
    expect(payload.temperature).toBeUndefined()
    expect(payload.maxOutputTokens).toBeUndefined()
  })
})
