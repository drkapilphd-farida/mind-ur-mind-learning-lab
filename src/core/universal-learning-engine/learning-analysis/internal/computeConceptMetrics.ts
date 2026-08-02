import type { ConceptGraphNode, ConceptRole, LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import { createGraphIndex } from '@/core/universal-learning-engine/knowledge-graph'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import { buildBeforeMap } from './topologicalSort'

export type ConceptMetrics = {
  importance: number
  conceptRole: ConceptRole
  revisionPriority: number
}

// Real, disclosed thresholds — a deliberately simple, transparent
// classification, not a validated pedagogical model. Documented here so
// a future sprint can tune or replace them without hunting through the
// function body.
const CORE_IMPORTANCE_THRESHOLD = 0.66
const SUPPORTING_IMPORTANCE_THRESHOLD = 0.33
const ROLE_REVISION_WEIGHT: Record<ConceptRole, number> = { core: 1, supporting: 0.6, advanced: 0.5, optional: 0.2 }

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function maxOrOne(values: readonly number[]): number {
  return Math.max(1, ...values)
}

// AI Learning Analysis Engine™ (UCE-5). Real, deterministic. Computes
// every concept's metrics together (not one at a time) because
// `importance`/`revisionPriority` are graph-relative — normalized
// against the real max occurrence/degree/dependent-count across THIS
// document's graph, so they mean "relative to this document," never a
// fabricated absolute score.
//
// `importance` = 0.4 * (real occurrenceCount, normalized) +
//                0.3 * (real graph degree via createGraphIndex, normalized) +
//                0.3 * (mean real `enrichment.importance` across chunks covering this concept)
//
// `conceptRole` (reuses knowledge-graph's own `ConceptRole` — never
// redefined): 'core' above CORE_IMPORTANCE_THRESHOLD; 'advanced' when
// any covering chunk's real `enrichment.difficulty` is `'advanced'`
// (checked before the lower 'supporting' bucket, since an advanced
// concept with moderate importance is still real, useful information a
// plain importance score would hide); 'supporting' above
// SUPPORTING_IMPORTANCE_THRESHOLD; 'optional' otherwise.
//
// `revisionPriority` = 0.6 * (real dependent count — how many other
// concepts' real prerequisite chains include this one, normalized) +
// 0.4 * (a real weight for this concept's own role) — a foundational
// concept many things depend on has real revision urgency: forgetting
// it has real downstream impact.
export function computeConceptMetrics(graph: LearningKnowledgeGraph, chunks: readonly LearningChunk[]): ReadonlyMap<string, ConceptMetrics> {
  const conceptNodes = graph.nodes.filter((node): node is ConceptGraphNode => node.type === 'concept')
  const chunkById = new Map(chunks.map((chunk) => [chunk.id, chunk]))
  const graphIndex = createGraphIndex(graph)
  const before = buildBeforeMap(graph)

  const dependentCount = new Map<string, number>()
  for (const prerequisites of before.values()) {
    for (const prerequisite of prerequisites) {
      dependentCount.set(prerequisite, (dependentCount.get(prerequisite) ?? 0) + 1)
    }
  }

  const maxOccurrence = maxOrOne(conceptNodes.map((node) => node.occurrenceCount))
  const maxDegree = maxOrOne(conceptNodes.map((node) => graphIndex.getNeighbors(node.id).length))
  const maxDependents = maxOrOne(conceptNodes.map((node) => dependentCount.get(node.id) ?? 0))

  const result = new Map<string, ConceptMetrics>()

  for (const node of conceptNodes) {
    const occurrenceNorm = node.occurrenceCount / maxOccurrence
    const degreeNorm = graphIndex.getNeighbors(node.id).length / maxDegree

    const coveringChunks = node.chunkIds.map((chunkId) => chunkById.get(chunkId)).filter((chunk): chunk is LearningChunk => chunk !== undefined)
    const chunkImportanceValues = coveringChunks.map((chunk) => chunk.enrichment.importance).filter((value): value is number => typeof value === 'number')
    const meanChunkImportance = chunkImportanceValues.length > 0 ? chunkImportanceValues.reduce((sum, value) => sum + value, 0) / chunkImportanceValues.length : 0

    const importance = clamp01(0.4 * occurrenceNorm + 0.3 * degreeNorm + 0.3 * meanChunkImportance)

    const hasAdvancedCoveringChunk = coveringChunks.some((chunk) => chunk.enrichment.difficulty === 'advanced')
    const conceptRole: ConceptRole =
      importance >= CORE_IMPORTANCE_THRESHOLD ? 'core' : hasAdvancedCoveringChunk ? 'advanced' : importance >= SUPPORTING_IMPORTANCE_THRESHOLD ? 'supporting' : 'optional'

    const dependentsNorm = (dependentCount.get(node.id) ?? 0) / maxDependents
    const revisionPriority = clamp01(0.6 * dependentsNorm + 0.4 * ROLE_REVISION_WEIGHT[conceptRole])

    result.set(node.id, { importance, conceptRole, revisionPriority })
  }

  return result
}
