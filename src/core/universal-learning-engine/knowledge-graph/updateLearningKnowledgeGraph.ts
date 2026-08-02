import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import type { GraphBuildOptions } from './types/GraphBuildOptions'
import type { LearningKnowledgeGraph } from './types/LearningKnowledgeGraph'
import type { GraphNode } from './types/GraphNode'
import type { GraphEdge } from './types/GraphEdge'
import { buildConceptIndex } from './internal/buildConceptIndex'
import { buildStructuralEdges } from './internal/buildStructuralEdges'
import { buildBuildsUponEdges } from './buildLearningKnowledgeGraph'

function buildChunkNodeLabel(chunk: LearningChunk): string {
  return chunk.location.sectionHeading ?? `Section ${chunk.location.order + 1}`
}

// Learning Knowledge Graph™ (UCE-4). Real incremental update: `nodes`
// and the deterministic structural edges are cheaply, fully recomputed
// from `allChunks` every time — this is honest, not a shortcut: a
// concept's `occurrenceCount`/`chunkIds` and every structural edge are
// corpus-wide aggregates, so a genuinely correct "partial" recompute of
// them would still need to see every chunk. This is safe because
// deterministic construction is itself cheap (no AI, no network) — the
// same "in-memory, disclosed" scope as the rest of this arc.
//
// The REAL "Incremental updates... Partial rebuilds" savings is in the
// one genuinely expensive part: the AI-derived `builds-upon` edges.
// Every existing `builds-upon` edge whose source concept's introducing
// chunk is untouched, and whose source/target concepts still exist, is
// REUSED verbatim from `existingGraph` — no AI call repeated for it.
// `AIFoundation.execute()` only runs again for chunks named in
// `updatedChunkIds`.
export async function updateLearningKnowledgeGraph(
  existingGraph: LearningKnowledgeGraph,
  allChunks: readonly LearningChunk[],
  updatedChunkIds: readonly string[],
  document: UniversalLearningDocument,
  options: GraphBuildOptions = {},
): Promise<LearningKnowledgeGraph> {
  const now = options.now ?? (() => new Date())
  const updatedChunkIdSet = new Set(updatedChunkIds)

  const conceptIndex = buildConceptIndex(allChunks)
  const nodes: GraphNode[] = [
    ...allChunks.map((chunk) => ({
      id: chunk.id,
      type: 'chunk' as const,
      chunkId: chunk.id,
      documentId: chunk.source.documentId,
      label: buildChunkNodeLabel(chunk),
      order: chunk.location.order,
    })),
    ...conceptIndex.values(),
  ]

  const structuralEdges = buildStructuralEdges(allChunks, conceptIndex, now)

  let buildsUponEdges: readonly GraphEdge[] = []
  if (options.aiFoundation) {
    const currentConceptIds = new Set([...conceptIndex.values()].map((concept) => concept.id))
    const conceptsIntroducedByUpdatedChunks = new Set(
      [...conceptIndex.values()].filter((concept) => updatedChunkIdSet.has(concept.chunkIds[0] as string)).map((concept) => concept.id),
    )

    const reusedEdges = existingGraph.edges.filter(
      (edge) =>
        edge.type === 'builds-upon' &&
        currentConceptIds.has(edge.sourceNodeId) &&
        currentConceptIds.has(edge.targetNodeId) &&
        !conceptsIntroducedByUpdatedChunks.has(edge.sourceNodeId),
    )

    const recomputedEdges = await buildBuildsUponEdges(allChunks, conceptIndex, options.aiFoundation, now, updatedChunkIdSet)

    const merged = new Map<string, GraphEdge>()
    for (const edge of reusedEdges) merged.set(edge.id, edge)
    for (const edge of recomputedEdges) merged.set(edge.id, edge)
    buildsUponEdges = [...merged.values()]
  }

  const edges = [...structuralEdges, ...buildsUponEdges]
  const nowIso = now().toISOString()

  return {
    id: existingGraph.id,
    documentId: document.id,
    version: { ...existingGraph.version, revision: existingGraph.version.revision + 1 },
    nodes,
    edges,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    createdAt: existingGraph.createdAt,
    lastModifiedAt: nowIso,
  }
}
