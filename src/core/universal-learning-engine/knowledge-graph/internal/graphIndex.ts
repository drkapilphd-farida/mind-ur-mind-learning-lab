import type { LearningKnowledgeGraph } from '../types/LearningKnowledgeGraph'
import type { GraphEdge, GraphEdgeType } from '../types/GraphEdge'

export type TraversalDirection = 'outgoing' | 'incoming' | 'both'

export interface GraphIndex {
  getNeighbors(nodeId: string, direction?: TraversalDirection): readonly GraphEdge[]
  getEdgesByType(type: GraphEdgeType): readonly GraphEdge[]
  // Real BFS shortest path by edge count, respecting direction for
  // directed edges (an undirected edge is traversable both ways).
  // Returns the real node-id path (inclusive of both ends), or `null`
  // when no path exists — never a fabricated "close enough" path.
  findPath(fromNodeId: string, toNodeId: string): readonly string[] | null
}

function pushTo(map: Map<string, GraphEdge[]>, key: string, edge: GraphEdge): void {
  const list = map.get(key)
  if (list) list.push(edge)
  else map.set(key, [edge])
}

// Learning Knowledge Graph™ (UCE-4). The real "Graph cache... Lazy
// loading" mechanism: the adjacency map is built once, on the first
// traversal call, and memoized on this index instance — never on the
// plain, immutable `LearningKnowledgeGraph` data object itself. A caller
// that never traverses never pays the adjacency-build cost; a caller
// that traverses repeatedly only pays it once.
class LazyGraphIndex implements GraphIndex {
  private outgoing: Map<string, GraphEdge[]> | null = null
  private incoming: Map<string, GraphEdge[]> | null = null
  private byType: Map<GraphEdgeType, GraphEdge[]> | null = null

  constructor(private readonly graph: LearningKnowledgeGraph) {}

  private ensureAdjacency(): { outgoing: Map<string, GraphEdge[]>; incoming: Map<string, GraphEdge[]> } {
    if (this.outgoing && this.incoming) return { outgoing: this.outgoing, incoming: this.incoming }

    const outgoing = new Map<string, GraphEdge[]>()
    const incoming = new Map<string, GraphEdge[]>()

    for (const edge of this.graph.edges) {
      pushTo(outgoing, edge.sourceNodeId, edge)
      pushTo(incoming, edge.targetNodeId, edge)
      if (edge.direction === 'undirected') {
        pushTo(outgoing, edge.targetNodeId, edge)
        pushTo(incoming, edge.sourceNodeId, edge)
      }
    }

    this.outgoing = outgoing
    this.incoming = incoming
    return { outgoing, incoming }
  }

  private ensureByType(): Map<GraphEdgeType, GraphEdge[]> {
    if (this.byType) return this.byType

    const byType = new Map<GraphEdgeType, GraphEdge[]>()
    for (const edge of this.graph.edges) {
      const list = byType.get(edge.type)
      if (list) list.push(edge)
      else byType.set(edge.type, [edge])
    }

    this.byType = byType
    return byType
  }

  getNeighbors(nodeId: string, direction: TraversalDirection = 'both'): readonly GraphEdge[] {
    const { outgoing, incoming } = this.ensureAdjacency()
    if (direction === 'outgoing') return outgoing.get(nodeId) ?? []
    if (direction === 'incoming') return incoming.get(nodeId) ?? []

    const merged = new Map<string, GraphEdge>()
    for (const edge of outgoing.get(nodeId) ?? []) merged.set(edge.id, edge)
    for (const edge of incoming.get(nodeId) ?? []) merged.set(edge.id, edge)
    return [...merged.values()]
  }

  getEdgesByType(type: GraphEdgeType): readonly GraphEdge[] {
    return this.ensureByType().get(type) ?? []
  }

  findPath(fromNodeId: string, toNodeId: string): readonly string[] | null {
    if (fromNodeId === toNodeId) return [fromNodeId]

    const { outgoing } = this.ensureAdjacency()
    const visited = new Set<string>([fromNodeId])
    const queue: (readonly string[])[] = [[fromNodeId]]

    while (queue.length > 0) {
      const path = queue.shift() as readonly string[]
      const current = path[path.length - 1] as string

      for (const edge of outgoing.get(current) ?? []) {
        const next = edge.sourceNodeId === current ? edge.targetNodeId : edge.sourceNodeId
        if (visited.has(next)) continue
        if (next === toNodeId) return [...path, next]
        visited.add(next)
        queue.push([...path, next])
      }
    }

    return null
  }
}

export function createGraphIndex(graph: LearningKnowledgeGraph): GraphIndex {
  return new LazyGraphIndex(graph)
}
