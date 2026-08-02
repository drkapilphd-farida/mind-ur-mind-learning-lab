import type { GraphEdgeDirection, GraphEdgeType } from '../types/GraphEdge'
import { hashToId } from './hashToId'

// Learning Knowledge Graph™ (UCE-4). Pure. The real "No duplicated
// relationships" enforcement point: the same (type, sourceNodeId,
// targetNodeId) triple always produces the same id, so re-deriving the
// same edge (e.g. two chunks both showing the same concept co-occurrence)
// resolves to the SAME edge — a caller strengthens it (see GraphEdge's
// own `weight` comment), never creates a duplicate. For an `undirected`
// edge, source/target are order-normalized (sorted) first, so
// `related-to(A, B)` and `related-to(B, A)` collapse to one id — direction
// genuinely doesn't matter for that type.
export function computeEdgeId(type: GraphEdgeType, sourceNodeId: string, targetNodeId: string, direction: GraphEdgeDirection): string {
  const [first, second] = direction === 'undirected' ? [sourceNodeId, targetNodeId].sort() : [sourceNodeId, targetNodeId]
  return hashToId(`${type}:${first}:${second}`)
}
