import type { ConceptGraphNode, GraphNode } from '@/core/universal-learning-engine/knowledge-graph'

// Shared, tiny, pure helpers reused across this module's aggregation
// functions — every one of them needs to distinguish concept nodes from
// chunk nodes and find "which concept nodes belong to this chapter."

export function isConceptNode(node: GraphNode): node is ConceptGraphNode {
  return node.type === 'concept'
}

export function conceptNodesForChunk(nodes: readonly GraphNode[], chunkId: string): readonly ConceptGraphNode[] {
  return nodes.filter(isConceptNode).filter((node) => node.chunkIds.includes(chunkId))
}

// A local, best-effort normalization for matching a chunk's own
// `enrichment.definitions[].term` string against a real
// `ConceptGraphNode.label` — deliberately not importing
// knowledge-graph's own `internal/normalizeConceptLabel.ts` (a private
// module this codebase's convention forbids importing directly); this
// module only needs a loose match for rolling up real data, not the
// graph's own strict identity/dedup rule.
export function normalizeForMatching(value: string): string {
  return value.trim().toLowerCase()
}
