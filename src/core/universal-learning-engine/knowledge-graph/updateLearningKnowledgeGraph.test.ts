import { describe, expect, it, vi } from 'vitest'
import type { AIFoundationResult } from '@/core/ai-foundation'
import type { ChunkEnrichment, LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import { buildLearningKnowledgeGraph } from './buildLearningKnowledgeGraph'
import { updateLearningKnowledgeGraph } from './updateLearningKnowledgeGraph'

function makeChunk(id: string, order: number, enrichment: ChunkEnrichment = {}): LearningChunk {
  return {
    id,
    version: { schemaVersion: '1.0.0', revision: 1 },
    status: 'structural',
    metadata: { title: null, documentTitle: 'Physics 101', contentType: 'text' },
    content: `Content for ${id}.`,
    blocks: [{ type: 'paragraph', text: `Content for ${id}.` }],
    source: { documentId: 'doc-1', universalSourceId: 'source-1', sectionId: 'section-0', originalSourceType: 'txt' },
    location: { order, sectionId: 'section-0', sectionHeading: `Heading ${order}`, totalChunksInDocument: 3 },
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

function makeDocument(): UniversalLearningDocument {
  return {
    id: 'doc-1',
    title: 'Physics 101',
    language: null,
    metadata: {},
    content: 'Full document content.',
    sections: [],
    paragraphs: [],
    wordCount: 9,
    pageCount: null,
    source: { id: 'source-1', name: 'physics.txt', mimeType: 'text/plain', extension: 'txt', size: 100, language: null, sourceType: 'txt', status: 'ready', uploadedAt: '2026-01-01T00:00:00.000Z', metadata: {} },
  }
}

const BUILD_NOW = (): Date => new Date('2026-01-01T00:00:00.000Z')
const UPDATE_NOW = (): Date => new Date('2026-02-01T00:00:00.000Z')

describe('updateLearningKnowledgeGraph', () => {
  it('increments version.revision and updates lastModifiedAt while preserving id/createdAt', async () => {
    const chunks = [makeChunk('chunk-1', 0, { concepts: ['force'] })]
    const original = await buildLearningKnowledgeGraph(chunks, makeDocument(), { now: BUILD_NOW })

    const updated = await updateLearningKnowledgeGraph(original, chunks, [], makeDocument(), { now: UPDATE_NOW })

    expect(updated.id).toBe(original.id)
    expect(updated.createdAt).toBe(original.createdAt)
    expect(updated.version.revision).toBe(2)
    expect(updated.lastModifiedAt).toBe('2026-02-01T00:00:00.000Z')
  })

  it('reflects a newly added chunk\'s concepts in the updated graph', async () => {
    const chunks = [makeChunk('chunk-1', 0, { concepts: ['force'] })]
    const original = await buildLearningKnowledgeGraph(chunks, makeDocument(), { now: BUILD_NOW })

    const allChunks = [...chunks, makeChunk('chunk-2', 1, { concepts: ['motion'] })]
    const updated = await updateLearningKnowledgeGraph(original, allChunks, ['chunk-2'], makeDocument(), { now: UPDATE_NOW })

    expect(updated.nodes.some((node) => node.type === 'concept' && node.normalizedLabel === 'motion')).toBe(true)
    expect(updated.nodeCount).toBe(updated.nodes.length)
  })

  it('reuses an existing builds-upon edge for a chunk that was not updated, without a new AI call for it', async () => {
    const chunks = [makeChunk('chunk-1', 0, { concepts: ['algebra'] }), makeChunk('chunk-2', 1, { concepts: ['calculus'] })]

    const execute = vi.fn(async (): Promise<AIFoundationResult> => ({
      success: true,
      task: 'relationship-detection',
      requestId: 'req-1',
      response: { id: 'r', providerId: 'mock', modelId: 'mock-default-chat', content: JSON.stringify({ relationships: [{ concept: 'calculus', buildsOnConcept: 'algebra', confidence: 0.9 }] }), usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 }, finishReason: 'stop' },
      usage: { providerId: 'mock', modelId: 'mock-default-chat', tokens: { inputTokens: 1, outputTokens: 1, totalTokens: 2 }, cost: { inputCostCents: 0, outputCostCents: 0, totalCostCents: 0, currency: 'USD' }, occurredAt: '2026-01-01T00:00:00.000Z' },
      cacheHit: false,
      processingTimeMs: 5,
    }))

    const original = await buildLearningKnowledgeGraph(chunks, makeDocument(), { now: BUILD_NOW, aiFoundation: { execute } })
    expect(original.edges.some((edge) => edge.type === 'builds-upon')).toBe(true)
    execute.mockClear()

    // A third, brand-new chunk is added; chunk-1/chunk-2 are unchanged.
    const allChunks = [...chunks, makeChunk('chunk-3', 2, { concepts: ['geometry'] })]
    const updated = await updateLearningKnowledgeGraph(original, allChunks, ['chunk-3'], makeDocument(), { now: UPDATE_NOW, aiFoundation: { execute } })

    // The original builds-upon edge (calculus -> algebra) is still present, reused.
    expect(updated.edges.some((edge) => edge.type === 'builds-upon')).toBe(true)
    // Only chunk-3 (the updated one) should have triggered a new AI call.
    expect(execute).toHaveBeenCalledTimes(1)
  })

  it('does not add builds-upon edges when no aiFoundation is supplied on update', async () => {
    const chunks = [makeChunk('chunk-1', 0, { concepts: ['force'] })]
    const original = await buildLearningKnowledgeGraph(chunks, makeDocument(), { now: BUILD_NOW })
    const updated = await updateLearningKnowledgeGraph(original, chunks, [], makeDocument(), { now: UPDATE_NOW })
    expect(updated.edges.some((edge) => edge.type === 'builds-upon')).toBe(false)
  })
})
