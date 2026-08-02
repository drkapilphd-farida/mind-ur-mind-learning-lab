import { describe, expect, it } from 'vitest'
import type { GraphEdge, GraphNode, LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import type { ChunkEnrichment, LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import { computeConceptMetrics } from './computeConceptMetrics'

function makeChunk(id: string, enrichment: ChunkEnrichment = {}): LearningChunk {
  return {
    id,
    version: { schemaVersion: '1.0.0', revision: 1 },
    status: 'structural',
    metadata: { title: null, documentTitle: 'Doc', contentType: 'text' },
    content: `Content for ${id}.`,
    blocks: [{ type: 'paragraph', text: `Content for ${id}.` }],
    source: { documentId: 'doc-1', universalSourceId: 'source-1', sectionId: 'section-0', originalSourceType: 'txt' },
    location: { order: 0, sectionId: 'section-0', sectionHeading: null, totalChunksInDocument: 1 },
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

function makeConcept(id: string, overrides: Partial<GraphNode> = {}): GraphNode {
  return { id, type: 'concept', label: id, normalizedLabel: id, occurrenceCount: 1, chunkIds: [], ...overrides } as GraphNode
}

function makeEdge(overrides: Partial<GraphEdge>): GraphEdge {
  return {
    id: `${overrides.type}-${overrides.sourceNodeId}-${overrides.targetNodeId}`,
    type: 'related-to',
    sourceNodeId: 'a',
    targetNodeId: 'b',
    direction: 'undirected',
    weight: 1,
    confidence: 1,
    computedBy: 'structural',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeGraph(nodes: readonly GraphNode[], edges: readonly GraphEdge[]): LearningKnowledgeGraph {
  return {
    id: 'graph-1',
    documentId: 'doc-1',
    version: { schemaVersion: '1.0.0', revision: 1 },
    nodes,
    edges,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    createdAt: '2026-01-01T00:00:00.000Z',
    lastModifiedAt: '2026-01-01T00:00:00.000Z',
  }
}

describe('computeConceptMetrics', () => {
  it('assigns a higher importance to a concept with more occurrences, degree, and chunk importance', () => {
    const chunkHigh = makeChunk('chunk-high', { importance: 0.9 })
    const chunkLow = makeChunk('chunk-low', { importance: 0.1 })
    const graph = makeGraph(
      [makeConcept('popular', { occurrenceCount: 5, chunkIds: ['chunk-high'] }), makeConcept('rare', { occurrenceCount: 1, chunkIds: ['chunk-low'] })],
      [makeEdge({ sourceNodeId: 'popular', targetNodeId: 'rare', direction: 'undirected' })],
    )
    const metrics = computeConceptMetrics(graph, [chunkHigh, chunkLow])
    expect(metrics.get('popular')!.importance).toBeGreaterThan(metrics.get('rare')!.importance)
  })

  it('classifies a high-importance concept as core', () => {
    const chunk = makeChunk('chunk-1', { importance: 1 })
    const graph = makeGraph([makeConcept('central', { occurrenceCount: 10, chunkIds: ['chunk-1'] })], [])
    const metrics = computeConceptMetrics(graph, [chunk])
    expect(metrics.get('central')!.conceptRole).toBe('core')
  })

  it('classifies a low-importance concept as optional', () => {
    const chunk = makeChunk('chunk-1', { importance: 0 })
    const graph = makeGraph([makeConcept('peripheral', { occurrenceCount: 1, chunkIds: ['chunk-1'] }), makeConcept('other', { occurrenceCount: 10, chunkIds: [] })], [])
    const metrics = computeConceptMetrics(graph, [chunk])
    expect(metrics.get('peripheral')!.conceptRole).toBe('optional')
  })

  it('classifies a moderate-importance concept covered only by an advanced chunk as advanced', () => {
    const chunk = makeChunk('chunk-1', { importance: 0.4, difficulty: 'advanced' })
    const graph = makeGraph([makeConcept('tricky', { occurrenceCount: 3, chunkIds: ['chunk-1'] }), makeConcept('other', { occurrenceCount: 10, chunkIds: [] })], [])
    const metrics = computeConceptMetrics(graph, [chunk])
    expect(metrics.get('tricky')!.conceptRole).toBe('advanced')
  })

  it('gives a higher revisionPriority to a concept many other concepts depend on', () => {
    const graph = makeGraph(
      [makeConcept('foundational'), makeConcept('dependent-1'), makeConcept('dependent-2'), makeConcept('isolated')],
      [
        makeEdge({ type: 'builds-upon', direction: 'directed', sourceNodeId: 'dependent-1', targetNodeId: 'foundational' }),
        makeEdge({ type: 'builds-upon', direction: 'directed', sourceNodeId: 'dependent-2', targetNodeId: 'foundational' }),
      ],
    )
    const metrics = computeConceptMetrics(graph, [])
    expect(metrics.get('foundational')!.revisionPriority).toBeGreaterThan(metrics.get('isolated')!.revisionPriority)
  })

  it('returns a metric entry for every concept node', () => {
    const graph = makeGraph([makeConcept('a'), makeConcept('b')], [])
    const metrics = computeConceptMetrics(graph, [])
    expect(metrics.size).toBe(2)
  })

  it('handles a concept with no covering chunks gracefully', () => {
    const graph = makeGraph([makeConcept('orphan', { chunkIds: [] })], [])
    expect(() => computeConceptMetrics(graph, [])).not.toThrow()
    expect(computeConceptMetrics(graph, []).get('orphan')!.importance).toBeGreaterThanOrEqual(0)
  })
})
