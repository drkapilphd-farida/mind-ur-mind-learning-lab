import { describe, expect, it } from 'vitest'
import type { ChunkEnrichment, LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import { buildLearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import { computeDeterministicAnalysis } from './computeDeterministicAnalysis'

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

describe('computeDeterministicAnalysis', () => {
  it('is deterministic and produces no aiRefinedStrategy field at all', async () => {
    const chunks = [makeChunk('chunk-1', 0, 'Algebra introduces variables.', { concepts: ['algebra'], importance: 0.9 })]
    const graph = await buildLearningKnowledgeGraph(chunks, makeDocument())
    const result = computeDeterministicAnalysis(chunks, graph)

    expect(result).toEqual(computeDeterministicAnalysis(chunks, graph))
    expect(result.conceptAnalysesBase.every((c) => !('aiRefinedStrategy' in c))).toBe(true)
  })

  it('produces one chunk analysis per chunk and one concept analysis per concept node', async () => {
    const chunks = [makeChunk('chunk-1', 0, 'Algebra introduces variables.', { concepts: ['algebra'] })]
    const graph = await buildLearningKnowledgeGraph(chunks, makeDocument())
    const result = computeDeterministicAnalysis(chunks, graph)

    expect(result.chunkAnalyses).toHaveLength(1)
    expect(result.conceptAnalysesBase).toHaveLength(graph.nodes.filter((n) => n.type === 'concept').length)
  })
})
