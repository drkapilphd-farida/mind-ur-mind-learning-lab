import { describe, expect, it } from 'vitest'
import type { GraphEdge, GraphNode, LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import { computeDependencyChain } from './computeDependencyChain'

function makeConcept(id: string): GraphNode {
  return { id, type: 'concept', label: id, normalizedLabel: id, occurrenceCount: 1, chunkIds: [] }
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

describe('computeDependencyChain', () => {
  it('returns a direct prerequisite', () => {
    const graph = makeGraph([makeConcept('calculus'), makeConcept('algebra')], [makeEdge({ type: 'builds-upon', sourceNodeId: 'calculus', targetNodeId: 'algebra' })])
    expect(computeDependencyChain(graph, 'calculus')).toEqual(['algebra'])
  })

  it('returns the full transitive chain, not just direct prerequisites', () => {
    const graph = makeGraph(
      [makeConcept('calculus'), makeConcept('algebra'), makeConcept('arithmetic')],
      [
        makeEdge({ type: 'builds-upon', sourceNodeId: 'calculus', targetNodeId: 'algebra' }),
        makeEdge({ type: 'builds-upon', sourceNodeId: 'algebra', targetNodeId: 'arithmetic' }),
      ],
    )
    expect([...computeDependencyChain(graph, 'calculus')].sort()).toEqual(['algebra', 'arithmetic'])
  })

  it('returns an empty chain for a concept with no prerequisites', () => {
    const graph = makeGraph([makeConcept('arithmetic')], [])
    expect(computeDependencyChain(graph, 'arithmetic')).toEqual([])
  })

  it('never includes the concept itself even if a cycle exists', () => {
    const graph = makeGraph(
      [makeConcept('a'), makeConcept('b')],
      [makeEdge({ type: 'builds-upon', sourceNodeId: 'a', targetNodeId: 'b' }), makeEdge({ type: 'builds-upon', sourceNodeId: 'b', targetNodeId: 'a' })],
    )
    expect(computeDependencyChain(graph, 'a')).not.toContain('a')
  })

  it('does not infinite-loop on a cycle', () => {
    const graph = makeGraph(
      [makeConcept('a'), makeConcept('b')],
      [makeEdge({ type: 'builds-upon', sourceNodeId: 'a', targetNodeId: 'b' }), makeEdge({ type: 'builds-upon', sourceNodeId: 'b', targetNodeId: 'a' })],
    )
    expect(() => computeDependencyChain(graph, 'a')).not.toThrow()
  })
})
