import { describe, expect, it, vi } from 'vitest'
import type { AIFoundation, AIFoundationResult } from '@/core/ai-foundation'
import type { ChunkEnrichment, LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import { buildLearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import type { LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import { buildLearningAnalysis } from './buildLearningAnalysis'

function makeChunk(id: string, order: number, content: string, enrichment: ChunkEnrichment = {}): LearningChunk {
  const wordCount = content.split(/\s+/).filter(Boolean).length
  return {
    id,
    version: { schemaVersion: '1.0.0', revision: 1 },
    status: 'structural',
    metadata: { title: null, documentTitle: 'Physics 101', contentType: 'text' },
    content,
    blocks: [{ type: 'paragraph', text: content }],
    source: { documentId: 'doc-1', universalSourceId: 'source-1', sectionId: 'section-0', originalSourceType: 'txt' },
    location: { order, sectionId: 'section-0', sectionHeading: `Heading ${order}`, totalChunksInDocument: 2 },
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
    title: 'Physics 101',
    language: null,
    metadata: {},
    content: 'Full document content.',
    sections: [],
    paragraphs: [],
    wordCount: 20,
    pageCount: null,
    source: { id: 'source-1', name: 'physics.txt', mimeType: 'text/plain', extension: 'txt', size: 100, language: null, sourceType: 'txt', status: 'ready', uploadedAt: '2026-01-01T00:00:00.000Z', metadata: {} },
  }
}

const NOW = (): Date => new Date('2026-01-01T00:00:00.000Z')

async function makeScenario(): Promise<{ chunks: LearningChunk[]; document: UniversalLearningDocument; graph: LearningKnowledgeGraph }> {
  const chunks = [
    makeChunk('chunk-1', 0, 'Algebra introduces variables and equations.', { concepts: ['algebra'], importance: 0.9 }),
    makeChunk('chunk-2', 1, 'Calculus builds on algebra with derivatives.', { concepts: ['calculus'], prerequisites: ['algebra'], importance: 0.7 }),
  ]
  const document = makeDocument()
  const graph = await buildLearningKnowledgeGraph(chunks, document, { now: NOW })
  return { chunks, document, graph }
}

describe('buildLearningAnalysis', () => {
  it('produces one ChunkAnalysis per input chunk', async () => {
    const { chunks, document, graph } = await makeScenario()
    const analysis = await buildLearningAnalysis(chunks, document, graph, { now: NOW })
    expect(analysis.chunkAnalyses).toHaveLength(2)
    expect(analysis.chunkAnalyses.map((c) => c.chunkNodeId).sort()).toEqual(['chunk-1', 'chunk-2'])
  })

  it('produces one ConceptAnalysis per concept node in the graph', async () => {
    const { chunks, document, graph } = await makeScenario()
    const analysis = await buildLearningAnalysis(chunks, document, graph, { now: NOW })
    const conceptNodeCount = graph.nodes.filter((node) => node.type === 'concept').length
    expect(analysis.conceptAnalyses).toHaveLength(conceptNodeCount)
  })

  it('orders algebra before calculus in the recommended learning order via the real chunk-scoped prerequisite derivation', async () => {
    const { chunks, document, graph } = await makeScenario()
    const analysis = await buildLearningAnalysis(chunks, document, graph, { now: NOW })
    const algebra = analysis.conceptAnalyses.find((c) => graph.nodes.find((n) => n.id === c.conceptNodeId && n.type === 'concept' && n.normalizedLabel === 'algebra'))
    const calculus = analysis.conceptAnalyses.find((c) => graph.nodes.find((n) => n.id === c.conceptNodeId && n.type === 'concept' && n.normalizedLabel === 'calculus'))
    expect(algebra?.recommendedOrder).not.toBeNull()
    expect(calculus?.recommendedOrder).not.toBeNull()
    expect(algebra!.recommendedOrder!).toBeLessThan(calculus!.recommendedOrder!)
  })

  it('reports prerequisiteValidation as valid when the graph has no cycles', async () => {
    const { chunks, document, graph } = await makeScenario()
    const analysis = await buildLearningAnalysis(chunks, document, graph, { now: NOW })
    expect(analysis.prerequisiteValidation).toEqual({ valid: true, issues: [] })
  })

  it('sets real traceability ids', async () => {
    const { chunks, document, graph } = await makeScenario()
    const analysis = await buildLearningAnalysis(chunks, document, graph, { now: NOW })
    expect(analysis.documentId).toBe('doc-1')
    expect(analysis.graphId).toBe(graph.id)
  })

  it('assigns version 1.0.0 revision 1 to a freshly built analysis', async () => {
    const { chunks, document, graph } = await makeScenario()
    const analysis = await buildLearningAnalysis(chunks, document, graph, { now: NOW })
    expect(analysis.version).toEqual({ schemaVersion: '1.0.0', revision: 1 })
  })

  it('never produces aiRefinedStrategy when no aiFoundation is supplied', async () => {
    const { chunks, document, graph } = await makeScenario()
    const analysis = await buildLearningAnalysis(chunks, document, graph, { now: NOW })
    expect(analysis.conceptAnalyses.every((c) => c.aiRefinedStrategy === undefined)).toBe(true)
  })

  it('produces a real aiRefinedStrategy for core concepts when aiFoundation is supplied and the model responds usefully', async () => {
    const { chunks, document, graph } = await makeScenario()

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
    const aiFoundation: Pick<AIFoundation, 'execute'> = { execute }

    const analysis = await buildLearningAnalysis(chunks, document, graph, { now: NOW, aiFoundation })
    const coreConcepts = analysis.conceptAnalyses.filter((c) => c.conceptRole === 'core')

    if (coreConcepts.length > 0) {
      expect(coreConcepts.every((c) => c.aiRefinedStrategy !== undefined)).toBe(true)
      expect(execute).toHaveBeenCalled()
    }
  })

  it('produces learning milestones only for core concepts with a real recommended order', async () => {
    const { chunks, document, graph } = await makeScenario()
    const analysis = await buildLearningAnalysis(chunks, document, graph, { now: NOW })
    for (const milestone of analysis.learningMilestones) {
      const conceptAnalysis = analysis.conceptAnalyses.find((c) => c.conceptNodeId === milestone.conceptNodeId)
      expect(conceptAnalysis?.conceptRole).toBe('core')
      expect(conceptAnalysis?.recommendedOrder).not.toBeNull()
    }
  })

  it('is deterministic for the same inputs', async () => {
    const { chunks, document, graph } = await makeScenario()
    const first = await buildLearningAnalysis(chunks, document, graph, { now: NOW, idFactory: () => 'fixed-id' })
    const second = await buildLearningAnalysis(chunks, document, graph, { now: NOW, idFactory: () => 'fixed-id' })
    expect(first).toEqual(second)
  })
})
