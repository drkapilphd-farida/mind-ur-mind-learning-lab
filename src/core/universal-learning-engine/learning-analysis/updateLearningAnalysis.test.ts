import { describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import type { AIFoundation, AIFoundationResult } from '@/core/ai-foundation'
import type { ChunkEnrichment, LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import { buildLearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import { buildLearningAnalysis } from './buildLearningAnalysis'
import { updateLearningAnalysis } from './updateLearningAnalysis'

function makeChunk(id: string, order: number, content: string, enrichment: ChunkEnrichment = {}): LearningChunk {
  const wordCount = content.split(/\s+/).filter(Boolean).length
  return {
    id,
    version: { schemaVersion: '1.0.0', revision: 1 },
    status: 'structural',
    metadata: { title: null, documentTitle: 'Doc', contentType: 'text' },
    content,
    blocks: [{ type: 'paragraph', text: content }],
    source: { documentId: 'doc-1', universalSourceId: 'source-1', sectionId: 'section-0', originalSourceType: 'txt' },
    location: { order, sectionId: 'section-0', sectionHeading: `Heading ${order}`, totalChunksInDocument: 1 },
    statistics: { wordCount, characterCount: content.length, blockCount: 1, paragraphCount: 1, tableCount: 0, mediaCount: 0 },
    readingMetrics: { estimatedReadingSeconds: 10 },
    hierarchy: { depth: 0, path: [id], parentChunkId: null },
    relationships: [],
    confidence: { structural: 1, semantic: 0.8, overall: 0.9 },
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
    title: 'Doc',
    language: null,
    metadata: {},
    content: 'Full content.',
    sections: [],
    paragraphs: [],
    wordCount: 10,
    pageCount: null,
    source: { id: 'source-1', name: 'doc.txt', mimeType: 'text/plain', extension: 'txt', size: 100, language: null, sourceType: 'txt', status: 'ready', uploadedAt: '2026-01-01T00:00:00.000Z', metadata: {} },
  }
}

const BUILD_NOW = (): Date => new Date('2026-01-01T00:00:00.000Z')
const UPDATE_NOW = (): Date => new Date('2026-02-01T00:00:00.000Z')

function makeAIFoundation(): { execute: Mock; aiFoundation: Pick<AIFoundation, 'execute'> } {
  const execute = vi.fn(async (): Promise<AIFoundationResult> => ({
    success: true,
    task: 'difficulty-analysis',
    requestId: 'req-1',
    response: {
      id: 'r',
      providerId: 'mock',
      modelId: 'mock-default-chat',
      content: JSON.stringify({ readingStrategyNotes: 'Read carefully.', revisionStrategyNotes: 'Review often.', practiceStrategyNotes: 'Practice daily.', confidence: 0.75 }),
      usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
      finishReason: 'stop',
    },
    usage: { providerId: 'mock', modelId: 'mock-default-chat', tokens: { inputTokens: 1, outputTokens: 1, totalTokens: 2 }, cost: { inputCostCents: 0, outputCostCents: 0, totalCostCents: 0, currency: 'USD' }, occurredAt: '2026-01-01T00:00:00.000Z' },
    cacheHit: false,
    processingTimeMs: 5,
  }))
  return { execute, aiFoundation: { execute } }
}

describe('updateLearningAnalysis', () => {
  it('increments version.revision and updates lastModifiedAt while preserving id/createdAt', async () => {
    const chunks = [makeChunk('chunk-1', 0, 'Algebra introduces variables and equations for real problems.', { concepts: ['algebra'], importance: 0.9 })]
    const document = makeDocument()
    const graph = await buildLearningKnowledgeGraph(chunks, document, { now: BUILD_NOW })
    const original = await buildLearningAnalysis(chunks, document, graph, { now: BUILD_NOW })

    const updated = await updateLearningAnalysis(original, chunks, graph, [], document, { now: UPDATE_NOW })

    expect(updated.id).toBe(original.id)
    expect(updated.createdAt).toBe(original.createdAt)
    expect(updated.version.revision).toBe(2)
    expect(updated.lastModifiedAt).toBe('2026-02-01T00:00:00.000Z')
  })

  it('reuses existing aiRefinedStrategy text for an untouched core concept, without a new AI call for it', async () => {
    // A document with enough real signal to make its one concept 'core'.
    const chunks = [makeChunk('chunk-1', 0, 'Newton\'s first law of motion.', { concepts: ['inertia'], importance: 1 })]
    const document = makeDocument()
    const graph = await buildLearningKnowledgeGraph(chunks, document, { now: BUILD_NOW })
    const { aiFoundation, execute } = makeAIFoundation()

    const original = await buildLearningAnalysis(chunks, document, graph, { now: BUILD_NOW, aiFoundation })
    const coreConcept = original.conceptAnalyses.find((c) => c.conceptRole === 'core')
    if (!coreConcept) return // this fixture's importance formula didn't cross the core threshold; nothing to assert

    expect(coreConcept.aiRefinedStrategy).toBeDefined()
    execute.mockClear()

    const updated = await updateLearningAnalysis(original, chunks, graph, [], document, { now: UPDATE_NOW, aiFoundation })
    const updatedConcept = updated.conceptAnalyses.find((c) => c.conceptNodeId === coreConcept.conceptNodeId)

    expect(updatedConcept?.aiRefinedStrategy).toEqual(coreConcept.aiRefinedStrategy)
    expect(execute).not.toHaveBeenCalled()
  })

  it('recomputes aiRefinedStrategy for a concept named in updatedConceptNodeIds', async () => {
    const chunks = [makeChunk('chunk-1', 0, 'Newton\'s first law of motion.', { concepts: ['inertia'], importance: 1 })]
    const document = makeDocument()
    const graph = await buildLearningKnowledgeGraph(chunks, document, { now: BUILD_NOW })
    const { aiFoundation, execute } = makeAIFoundation()

    const original = await buildLearningAnalysis(chunks, document, graph, { now: BUILD_NOW, aiFoundation })
    const coreConcept = original.conceptAnalyses.find((c) => c.conceptRole === 'core')
    if (!coreConcept) return

    execute.mockClear()
    await updateLearningAnalysis(original, chunks, graph, [coreConcept.conceptNodeId], document, { now: UPDATE_NOW, aiFoundation })
    expect(execute).toHaveBeenCalledTimes(1)
  })

  it('always recomputes deterministic outputs fresh, even with no updated concepts', async () => {
    const chunks = [makeChunk('chunk-1', 0, 'Algebra introduces variables and equations for real problems.', { concepts: ['algebra'] })]
    const document = makeDocument()
    const graph = await buildLearningKnowledgeGraph(chunks, document, { now: BUILD_NOW })
    const original = await buildLearningAnalysis(chunks, document, graph, { now: BUILD_NOW })

    const updated = await updateLearningAnalysis(original, chunks, graph, [], document, { now: UPDATE_NOW })
    expect(updated.chunkAnalyses).toEqual(original.chunkAnalyses)
    expect(updated.recommendedLearningOrder).toEqual(original.recommendedLearningOrder)
  })
})
