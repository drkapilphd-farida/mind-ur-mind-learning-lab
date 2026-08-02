import { describe, expect, it } from 'vitest'
import type { GraphEdge } from '../types/GraphEdge'
import type { LearningKnowledgeGraph } from '../types/LearningKnowledgeGraph'
import { createGraphIndex } from './graphIndex'

function makeEdge(overrides: Partial<GraphEdge>): GraphEdge {
  return {
    id: `${overrides.type}-${overrides.sourceNodeId}-${overrides.targetNodeId}`,
    type: 'part-of',
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

function makeGraph(edges: readonly GraphEdge[]): LearningKnowledgeGraph {
  return {
    id: 'graph-1',
    documentId: 'doc-1',
    version: { schemaVersion: '1.0.0', revision: 1 },
    nodes: [],
    edges,
    nodeCount: 0,
    edgeCount: edges.length,
    createdAt: '2026-01-01T00:00:00.000Z',
    lastModifiedAt: '2026-01-01T00:00:00.000Z',
  }
}

describe('createGraphIndex', () => {
  it('returns outgoing edges for a directed edge\'s source node', () => {
    const edge = makeEdge({ sourceNodeId: 'a', targetNodeId: 'b', direction: 'directed' })
    const index = createGraphIndex(makeGraph([edge]))
    expect(index.getNeighbors('a', 'outgoing')).toEqual([edge])
    expect(index.getNeighbors('b', 'outgoing')).toEqual([])
  })

  it('returns incoming edges for a directed edge\'s target node', () => {
    const edge = makeEdge({ sourceNodeId: 'a', targetNodeId: 'b', direction: 'directed' })
    const index = createGraphIndex(makeGraph([edge]))
    expect(index.getNeighbors('b', 'incoming')).toEqual([edge])
    expect(index.getNeighbors('a', 'incoming')).toEqual([])
  })

  it('treats an undirected edge as reachable from both endpoints', () => {
    const edge = makeEdge({ type: 'related-to', sourceNodeId: 'a', targetNodeId: 'b', direction: 'undirected' })
    const index = createGraphIndex(makeGraph([edge]))
    expect(index.getNeighbors('a', 'outgoing')).toEqual([edge])
    expect(index.getNeighbors('b', 'outgoing')).toEqual([edge])
  })

  it('"both" direction merges outgoing and incoming without duplicating an edge', () => {
    const edge = makeEdge({ sourceNodeId: 'a', targetNodeId: 'b', direction: 'directed' })
    const index = createGraphIndex(makeGraph([edge]))
    expect(index.getNeighbors('a', 'both')).toEqual([edge])
  })

  it('getEdgesByType returns only edges of that type', () => {
    const partOf = makeEdge({ type: 'part-of', sourceNodeId: 'a', targetNodeId: 'b' })
    const dependsOn = makeEdge({ type: 'depends-on', sourceNodeId: 'a', targetNodeId: 'c' })
    const index = createGraphIndex(makeGraph([partOf, dependsOn]))
    expect(index.getEdgesByType('part-of')).toEqual([partOf])
    expect(index.getEdgesByType('depends-on')).toEqual([dependsOn])
    expect(index.getEdgesByType('explains')).toEqual([])
  })

  it('findPath returns [nodeId] when from equals to', () => {
    const index = createGraphIndex(makeGraph([]))
    expect(index.findPath('a', 'a')).toEqual(['a'])
  })

  it('findPath finds a real multi-hop shortest path', () => {
    const edges = [makeEdge({ sourceNodeId: 'a', targetNodeId: 'b' }), makeEdge({ sourceNodeId: 'b', targetNodeId: 'c' })]
    const index = createGraphIndex(makeGraph(edges))
    expect(index.findPath('a', 'c')).toEqual(['a', 'b', 'c'])
  })

  it('findPath respects direction for directed edges', () => {
    const edge = makeEdge({ sourceNodeId: 'a', targetNodeId: 'b', direction: 'directed' })
    const index = createGraphIndex(makeGraph([edge]))
    expect(index.findPath('b', 'a')).toBeNull()
  })

  it('findPath traverses an undirected edge in either direction', () => {
    const edge = makeEdge({ type: 'related-to', sourceNodeId: 'a', targetNodeId: 'b', direction: 'undirected' })
    const index = createGraphIndex(makeGraph([edge]))
    expect(index.findPath('b', 'a')).toEqual(['b', 'a'])
  })

  it('findPath returns null when no path exists', () => {
    const edge = makeEdge({ sourceNodeId: 'a', targetNodeId: 'b' })
    const index = createGraphIndex(makeGraph([edge]))
    expect(index.findPath('a', 'z')).toBeNull()
  })

  it('builds the adjacency map lazily only once, reused across repeated calls', () => {
    const edge = makeEdge({ sourceNodeId: 'a', targetNodeId: 'b' })
    const graph = makeGraph([edge])
    const index = createGraphIndex(graph)

    // 'outgoing'/'incoming' read straight from the memoized adjacency
    // map without building a new collection per call — same array
    // reference on repeated calls proves the map itself was built once.
    const first = index.getNeighbors('a', 'outgoing')
    const second = index.getNeighbors('a', 'outgoing')
    expect(first).toBe(second)
  })
})
