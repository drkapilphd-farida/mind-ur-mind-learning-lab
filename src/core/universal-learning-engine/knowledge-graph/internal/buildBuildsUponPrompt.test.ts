import { describe, expect, it } from 'vitest'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import { buildBuildsUponPrompt } from './buildBuildsUponPrompt'

function makeChunk(overrides: Partial<LearningChunk> = {}): LearningChunk {
  return {
    id: 'chunk-2',
    version: { schemaVersion: '1.0.0', revision: 1 },
    status: 'structural',
    metadata: { title: null, documentTitle: 'Doc', contentType: 'text' },
    content: 'Calculus builds on algebraic manipulation.',
    blocks: [{ type: 'paragraph', text: 'Calculus builds on algebraic manipulation.' }],
    source: { documentId: 'doc-1', universalSourceId: 'source-1', sectionId: 'section-0', originalSourceType: 'txt' },
    location: { order: 1, sectionId: 'section-0', sectionHeading: null, totalChunksInDocument: 2 },
    statistics: { wordCount: 5, characterCount: 40, blockCount: 1, paragraphCount: 1, tableCount: 0, mediaCount: 0 },
    readingMetrics: { estimatedReadingSeconds: 1 },
    hierarchy: { depth: 0, path: ['chunk-2'], parentChunkId: null },
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

describe('buildBuildsUponPrompt', () => {
  it('includes the chunk\'s real content verbatim', () => {
    const payload = buildBuildsUponPrompt(makeChunk(), ['calculus'], ['algebra'])
    const userMessage = payload.messages.find((message) => message.role === 'user')
    expect(userMessage?.content).toContain('Calculus builds on algebraic manipulation.')
  })

  it('lists the chunk\'s own concepts and the already-introduced concepts', () => {
    const payload = buildBuildsUponPrompt(makeChunk(), ['calculus'], ['algebra', 'geometry'])
    const userMessage = payload.messages.find((message) => message.role === 'user')
    expect(userMessage?.content).toContain('calculus')
    expect(userMessage?.content).toContain('algebra, geometry')
  })

  it('handles an empty prior-concepts list honestly', () => {
    const payload = buildBuildsUponPrompt(makeChunk(), ['calculus'], [])
    const userMessage = payload.messages.find((message) => message.role === 'user')
    expect(userMessage?.content).toContain('(none)')
  })

  it('instructs the model never to invent a connection', () => {
    const payload = buildBuildsUponPrompt(makeChunk(), [], [])
    const systemMessage = payload.messages.find((message) => message.role === 'system')
    expect(systemMessage?.content.toLowerCase()).toContain('never invent')
  })
})
