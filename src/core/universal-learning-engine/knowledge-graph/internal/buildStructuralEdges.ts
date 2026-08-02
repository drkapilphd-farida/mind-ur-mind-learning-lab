import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { ConceptGraphNode } from '../types/GraphNode'
import type { GraphEdge, GraphEdgeDirection, GraphEdgeType } from '../types/GraphEdge'
import { collectChunkConceptLabels } from './buildConceptIndex'
import { normalizeConceptLabel } from './normalizeConceptLabel'
import { computeEdgeId } from './computeEdgeId'

// A COARSE, presence-based heuristic confidence — real, but honestly
// lower than a definitive structural fact (see GraphEdge.ts's own
// `confidence` comment). Applied to example-of/diagram-for, which can
// only confirm "this chunk has examples/media AND mentions this
// concept," never "this specific example/image is definitely about this
// specific concept."
const COARSE_HEURISTIC_CONFIDENCE = 0.5

type EdgeMap = Map<string, GraphEdge>

function upsertEdge(
  edges: EdgeMap,
  now: () => Date,
  type: GraphEdgeType,
  sourceNodeId: string,
  targetNodeId: string,
  direction: GraphEdgeDirection,
  weight: number,
  confidence: number | null,
): void {
  const id = computeEdgeId(type, sourceNodeId, targetNodeId, direction)
  const existing = edges.get(id)

  if (existing) {
    // The exact same edge was derived again from another chunk — real
    // "no duplicated relationships": strengthen it, never duplicate it.
    edges.set(id, { ...existing, weight: existing.weight + weight })
    return
  }

  const [normalizedSource, normalizedTarget] = direction === 'undirected' ? [sourceNodeId, targetNodeId].sort() : [sourceNodeId, targetNodeId]
  edges.set(id, {
    id,
    type,
    sourceNodeId: normalizedSource as string,
    targetNodeId: normalizedTarget as string,
    direction,
    weight,
    confidence,
    computedBy: 'structural',
    createdAt: now().toISOString(),
  })
}

function resolveConceptId(label: string, conceptIndex: ReadonlyMap<string, ConceptGraphNode>): string | undefined {
  return conceptIndex.get(normalizeConceptLabel(label))?.id
}

// Learning Knowledge Graph™ (UCE-4). Pure. Every deterministic,
// zero-AI edge type this sprint populates — all derived from UCE-3B's
// already-real per-chunk enrichment data, resolved against the real
// `conceptIndex` (buildConceptIndex.ts). A concept name that doesn't
// resolve to any known concept node (e.g. a prerequisite string that
// doesn't match anything else in the document) is skipped, never
// fabricated into a new node. See docs/PRODUCTION_HANDOFF_UCE_4.md for
// which of the brief's 14 edge types this covers and why the rest stay
// reserved.
export function buildStructuralEdges(chunks: readonly LearningChunk[], conceptIndex: ReadonlyMap<string, ConceptGraphNode>, now: () => Date = () => new Date()): readonly GraphEdge[] {
  const edges: EdgeMap = new Map()

  // introduces — the concept index already recorded each concept's
  // earliest real chunk (chunkIds[0], built in real location.order
  // sequence) — a pure structural fact, not re-derived here.
  for (const concept of conceptIndex.values()) {
    const firstChunkId = concept.chunkIds[0]
    if (firstChunkId) upsertEdge(edges, now, 'introduces', firstChunkId, concept.id, 'directed', 1, 1)
  }

  for (const chunk of chunks) {
    const chunkConceptIds = collectChunkConceptLabels(chunk)
      .map((label) => resolveConceptId(label, conceptIndex))
      .filter((id): id is string => id !== undefined)

    // part-of — every concept this chunk covers is real, structurally
    // part of it.
    for (const conceptId of chunkConceptIds) {
      upsertEdge(edges, now, 'part-of', conceptId, chunk.id, 'directed', 1, 1)
    }

    // defines — a real ChunkDefinition pair.
    for (const definition of chunk.enrichment.definitions ?? []) {
      const conceptId = resolveConceptId(definition.term, conceptIndex)
      if (conceptId) upsertEdge(edges, now, 'defines', chunk.id, conceptId, 'directed', 1, 1)
    }

    // prerequisite/depends-on — chunk-scoped (UCE-3B's own data is
    // per-chunk, not per-concept-within-a-chunk), so the edge connects
    // the CHUNK to the resolved concept, never a specific concept within
    // it — never claiming a precision the source data doesn't have.
    // Confidence is passed through from the chunk's own real, UCE-3B
    // self-reported `confidence.semantic` — never fabricated here.
    for (const prerequisiteLabel of chunk.enrichment.prerequisites ?? []) {
      const conceptId = resolveConceptId(prerequisiteLabel, conceptIndex)
      if (conceptId) upsertEdge(edges, now, 'prerequisite', chunk.id, conceptId, 'directed', 1, chunk.confidence.semantic)
    }
    for (const dependencyLabel of chunk.enrichment.dependencies ?? []) {
      const conceptId = resolveConceptId(dependencyLabel, conceptIndex)
      if (conceptId) upsertEdge(edges, now, 'depends-on', chunk.id, conceptId, 'directed', 1, chunk.confidence.semantic)
    }

    // example-of/diagram-for — coarse, presence-based heuristics.
    const hasRealExamples = (chunk.enrichment.examples?.length ?? 0) > 0
    const hasRealMedia = chunk.media.length > 0
    for (const conceptId of chunkConceptIds) {
      if (hasRealExamples) upsertEdge(edges, now, 'example-of', chunk.id, conceptId, 'directed', 1, COARSE_HEURISTIC_CONFIDENCE)
      if (hasRealMedia) upsertEdge(edges, now, 'diagram-for', chunk.id, conceptId, 'directed', 1, COARSE_HEURISTIC_CONFIDENCE)
    }

    // related-to — undirected co-occurrence within this one chunk.
    // Repeated co-occurrence across chunks strengthens the same edge
    // (real weight = real co-occurrence count) rather than duplicating it.
    for (let i = 0; i < chunkConceptIds.length; i += 1) {
      for (let j = i + 1; j < chunkConceptIds.length; j += 1) {
        upsertEdge(edges, now, 'related-to', chunkConceptIds[i] as string, chunkConceptIds[j] as string, 'undirected', 1, 1)
      }
    }
  }

  return [...edges.values()]
}
