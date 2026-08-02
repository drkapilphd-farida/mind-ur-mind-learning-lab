import { describe, expect, it } from 'vitest'
import type { GraphEdge, GraphNode } from '@/core/universal-learning-engine/knowledge-graph'
import type { LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import { topologicalSort } from './topologicalSort'

function makeConcept(id: string): GraphNode {
  return { id, type: 'concept', label: id, normalizedLabel: id, occurrenceCount: 1, chunkIds: [] }
}

function makeChunkNode(id: string): GraphNode {
  return { id, type: 'chunk', chunkId: id, documentId: 'doc-1', label: id, order: 0 }
}

function makeEdge(overrides: Partial<GraphEdge>): GraphEdge {
  return {
    id: `${overrides.type}-${overrides.sourceNodeId}-${overrides.targetNodeId}`,
    type: 'builds-upon',
    sourceNodeId: 'a',
    targetNodeId: 'b',
    direction: 'directed',
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

describe('topologicalSort', () => {
  it('orders a real builds-upon chain with the prior concept first', () => {
    const graph = makeGraph([makeConcept('calculus'), makeConcept('algebra')], [makeEdge({ type: 'builds-upon', sourceNodeId: 'calculus', targetNodeId: 'algebra' })])
    const result = topologicalSort(graph)
    expect(result.order.indexOf('algebra')).toBeLessThan(result.order.indexOf('calculus'))
    expect(result.unorderedConceptIds).toEqual([])
  })

  it('derives a concept-to-concept ordering from chunk-scoped prerequisite + introduces edges', () => {
    const graph = makeGraph(
      [makeChunkNode('chunk-1'), makeConcept('calculus'), makeConcept('algebra')],
      [
        makeEdge({ type: 'prerequisite', sourceNodeId: 'chunk-1', targetNodeId: 'algebra' }),
        makeEdge({ type: 'introduces', sourceNodeId: 'chunk-1', targetNodeId: 'calculus' }),
      ],
    )
    const result = topologicalSort(graph)
    expect(result.order.indexOf('algebra')).toBeLessThan(result.order.indexOf('calculus'))
  })

  it('orders every concept with no incoming constraints when there are no ordering edges at all', () => {
    const graph = makeGraph([makeConcept('a'), makeConcept('b')], [])
    const result = topologicalSort(graph)
    expect([...result.order].sort()).toEqual(['a', 'b'])
    expect(result.unorderedConceptIds).toEqual([])
  })

  it('detects a real two-node cycle and excludes both from the order', () => {
    const graph = makeGraph(
      [makeConcept('a'), makeConcept('b')],
      [makeEdge({ type: 'builds-upon', sourceNodeId: 'a', targetNodeId: 'b' }), makeEdge({ type: 'builds-upon', sourceNodeId: 'b', targetNodeId: 'a' })],
    )
    const result = topologicalSort(graph)
    expect(result.order).toEqual([])
    expect([...result.unorderedConceptIds].sort()).toEqual(['a', 'b'])
  })

  it('also excludes a concept that is not itself cyclic but transitively depends on a cyclic one', () => {
    // c builds upon a, and a is stuck in an a<->b cycle — c can never
    // reach in-degree 0 either, even though c itself isn't part of the
    // cycle. unorderedConceptIds honestly reports this as "could not be
    // ordered," not "is cyclic."
    const graph = makeGraph(
      [makeConcept('a'), makeConcept('b'), makeConcept('c')],
      [
        makeEdge({ type: 'builds-upon', sourceNodeId: 'a', targetNodeId: 'b' }),
        makeEdge({ type: 'builds-upon', sourceNodeId: 'b', targetNodeId: 'a' }),
        makeEdge({ type: 'builds-upon', sourceNodeId: 'c', targetNodeId: 'a' }),
      ],
    )
    const result = topologicalSort(graph)
    expect([...result.unorderedConceptIds].sort()).toEqual(['a', 'b', 'c'])
    expect(result.order).toEqual([])
  })

  it('ignores a self-referential edge rather than treating it as a false cycle', () => {
    const graph = makeGraph([makeConcept('a')], [makeEdge({ type: 'builds-upon', sourceNodeId: 'a', targetNodeId: 'a' })])
    const result = topologicalSort(graph)
    expect(result.order).toEqual(['a'])
    expect(result.unorderedConceptIds).toEqual([])
  })

  it('is deterministic for the same graph', () => {
    const graph = makeGraph([makeConcept('b'), makeConcept('a')], [])
    expect(topologicalSort(graph).order).toEqual(topologicalSort(graph).order)
  })

  it('ignores chunk and non-concept nodes when producing the order', () => {
    const graph = makeGraph([makeChunkNode('chunk-1'), makeConcept('a')], [])
    const result = topologicalSort(graph)
    expect(result.order).toEqual(['a'])
  })
})
