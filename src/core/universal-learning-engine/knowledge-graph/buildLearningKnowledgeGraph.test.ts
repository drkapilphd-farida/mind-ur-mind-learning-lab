import { describe, expect, it, vi } from 'vitest'
import type { AIFoundation, AIFoundationResult } from '@/core/ai-foundation'
import type { ChunkEnrichment, LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import { buildLearningKnowledgeGraph } from './buildLearningKnowledgeGraph'

function makeChunk(id: string, order: number, enrichment: ChunkEnrichment = {}, overrides: Partial<LearningChunk> = {}): LearningChunk {
  return {
    id,
    version: { schemaVersion: '1.0.0', revision: 1 },
    status: 'structural',
    metadata: { title: null, documentTitle: 'Physics 101', contentType: 'text' },
    content: `Content for ${id}.`,
    blocks: [{ type: 'paragraph', text: `Content for ${id}.` }],
    source: { documentId: 'doc-1', universalSourceId: 'source-1', sectionId: 'section-0', originalSourceType: 'txt' },
    location: { order, sectionId: 'section-0', sectionHeading: `Heading ${order}`, totalChunksInDocument: 2 },
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
    ...overrides,
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
    wordCount: 6,
    pageCount: null,
    source: { id: 'source-1', name: 'physics.txt', mimeType: 'text/plain', extension: 'txt', size: 100, language: null, sourceType: 'txt', status: 'ready', uploadedAt: '2026-01-01T00:00:00.000Z', metadata: {} },
  }
}

const FIXED_NOW = (): Date => new Date('2026-01-01T00:00:00.000Z')

describe('buildLearningKnowledgeGraph', () => {
  it('creates one ChunkGraphNode per input chunk and one ConceptGraphNode per distinct concept', async () => {
    const chunks = [makeChunk('chunk-1', 0, { concepts: ['force'] }), makeChunk('chunk-2', 1, { concepts: ['force', 'motion'] })]
    const graph = await buildLearningKnowledgeGraph(chunks, makeDocument(), { now: FIXED_NOW })

    const chunkNodes = graph.nodes.filter((node) => node.type === 'chunk')
    const conceptNodes = graph.nodes.filter((node) => node.type === 'concept')
    expect(chunkNodes).toHaveLength(2)
    expect(conceptNodes).toHaveLength(2)
  })

  it('always includes real structural edges, with zero AIFoundation calls', async () => {
    const chunks = [makeChunk('chunk-1', 0, { concepts: ['force'] })]
    const graph = await buildLearningKnowledgeGraph(chunks, makeDocument(), { now: FIXED_NOW })

    expect(graph.edges.some((edge) => edge.type === 'introduces')).toBe(true)
    expect(graph.edges.some((edge) => edge.type === 'part-of')).toBe(true)
  })

  it('never produces builds-upon edges when no aiFoundation is supplied', async () => {
    const chunks = [makeChunk('chunk-1', 0, { concepts: ['algebra'] }), makeChunk('chunk-2', 1, { concepts: ['calculus'] })]
    const graph = await buildLearningKnowledgeGraph(chunks, makeDocument(), { now: FIXED_NOW })
    expect(graph.edges.some((edge) => edge.type === 'builds-upon')).toBe(false)
  })

  it('derives a real builds-upon edge when aiFoundation is supplied and the model confirms a relationship', async () => {
    const chunks = [makeChunk('chunk-1', 0, { concepts: ['algebra'] }), makeChunk('chunk-2', 1, { concepts: ['calculus'] })]

    const execute = vi.fn(async (): Promise<AIFoundationResult> => ({
      success: true,
      task: 'relationship-detection',
      requestId: 'req-1',
      response: {
        id: 'resp-1',
        providerId: 'mock',
        modelId: 'mock-default-chat',
        content: JSON.stringify({ relationships: [{ concept: 'calculus', buildsOnConcept: 'algebra', confidence: 0.9 }] }),
        usage: { inputTokens: 10, outputTokens: 10, totalTokens: 20 },
        finishReason: 'stop',
      },
      usage: { providerId: 'mock', modelId: 'mock-default-chat', tokens: { inputTokens: 10, outputTokens: 10, totalTokens: 20 }, cost: { inputCostCents: 0, outputCostCents: 0, totalCostCents: 0, currency: 'USD' }, occurredAt: '2026-01-01T00:00:00.000Z' },
      cacheHit: false,
      processingTimeMs: 5,
    }))
    const aiFoundation: Pick<AIFoundation, 'execute'> = { execute }

    const graph = await buildLearningKnowledgeGraph(chunks, makeDocument(), { now: FIXED_NOW, aiFoundation })

    const buildsUpon = graph.edges.find((edge) => edge.type === 'builds-upon')
    expect(buildsUpon).toBeDefined()
    expect(buildsUpon?.computedBy).toBe('semantic')
    expect(buildsUpon?.confidence).toBe(0.9)
    // Only called for chunk-2 — chunk-1 has no prior concepts to build upon yet.
    expect(execute).toHaveBeenCalledTimes(1)
  })

  it('produces zero builds-upon edges when the AI response is not valid JSON, without failing the build', async () => {
    const chunks = [makeChunk('chunk-1', 0, { concepts: ['algebra'] }), makeChunk('chunk-2', 1, { concepts: ['calculus'] })]
    const execute = vi.fn(async (): Promise<AIFoundationResult> => ({
      success: true,
      task: 'relationship-detection',
      requestId: 'req-1',
      response: { id: 'resp-1', providerId: 'mock', modelId: 'mock-default-chat', content: '[mock reply] Acknowledged.', usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 }, finishReason: 'stop' },
      usage: { providerId: 'mock', modelId: 'mock-default-chat', tokens: { inputTokens: 1, outputTokens: 1, totalTokens: 2 }, cost: { inputCostCents: 0, outputCostCents: 0, totalCostCents: 0, currency: 'USD' }, occurredAt: '2026-01-01T00:00:00.000Z' },
      cacheHit: false,
      processingTimeMs: 5,
    }))

    const graph = await buildLearningKnowledgeGraph(chunks, makeDocument(), { now: FIXED_NOW, aiFoundation: { execute } })
    expect(graph.edges.some((edge) => edge.type === 'builds-upon')).toBe(false)
  })

  it('assigns version 1.0.0 revision 1 to a freshly built graph', async () => {
    const graph = await buildLearningKnowledgeGraph([makeChunk('chunk-1', 0)], makeDocument(), { now: FIXED_NOW })
    expect(graph.version).toEqual({ schemaVersion: '1.0.0', revision: 1 })
  })

  it('computes real nodeCount/edgeCount matching the actual arrays', async () => {
    const chunks = [makeChunk('chunk-1', 0, { concepts: ['force'] })]
    const graph = await buildLearningKnowledgeGraph(chunks, makeDocument(), { now: FIXED_NOW })
    expect(graph.nodeCount).toBe(graph.nodes.length)
    expect(graph.edgeCount).toBe(graph.edges.length)
  })

  it('sets documentId from the real document', async () => {
    const graph = await buildLearningKnowledgeGraph([makeChunk('chunk-1', 0)], makeDocument(), { now: FIXED_NOW })
    expect(graph.documentId).toBe('doc-1')
  })

  it('never produces duplicate concept nodes even with many chunks sharing concepts', async () => {
    const chunks = [makeChunk('chunk-1', 0, { concepts: ['force'] }), makeChunk('chunk-2', 1, { concepts: ['force'] }), makeChunk('chunk-3', 2, { concepts: ['force'] })]
    const graph = await buildLearningKnowledgeGraph(chunks, makeDocument(), { now: FIXED_NOW })
    expect(graph.nodes.filter((node) => node.type === 'concept')).toHaveLength(1)
  })
})
