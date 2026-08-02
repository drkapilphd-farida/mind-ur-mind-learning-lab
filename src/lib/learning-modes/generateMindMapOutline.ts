import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { resolveChunkHeading } from './resolveChunkHeading'

export type MindMapOutlineNode = {
  id: string
  title: string
  order: number
}

// Production AI Integration — ALS-24. One per real, AI-extracted concept
// node in `ulo.knowledge.graph` (never fabricated — the graph itself only
// ever contains a concept it genuinely found in `chunk.enrichment`, per
// `buildConceptIndex.ts`). `relatedChunkTitles` is real reading material
// — the section headings of every chunk that actually mentions this
// concept — so a learner can jump straight to the source material.
export type MindMapConcept = {
  id: string
  label: string
  occurrenceCount: number
  relatedChunkTitles: readonly string[]
}

export type MindMapOutline = {
  documentId: string
  documentTitle: string
  nodes: readonly MindMapOutlineNode[]
  concepts: readonly MindMapConcept[]
}

// AI Learning Studio™ Sprint ALS-13 — Mind Map™. Originally, honest,
// disclosed structural-only scope: the real Universal Learning Object™
// pipeline, run without AI, had zero concept nodes and zero relationship
// edges of any kind — `nodes` (a real document outline, each real
// chunk's real section heading, in real reading order) was the only
// honest thing to show.
//
// Production AI Integration — ALS-24. Semantic enrichment (UCE-3B) is
// now wired into the real pipeline, so `ulo.knowledge.graph` genuinely
// contains real concept nodes once a document's chunks are enriched
// (`buildLearningKnowledgeGraph`'s own `buildConceptIndex` already read
// `chunk.enrichment` unconditionally — it simply had nothing to read
// before now). `concepts` surfaces those real concepts, sourced entirely
// from the already-built graph — no new extraction or AI call here. A
// document whose chunks aren't enriched yet (skipped/failed) simply has
// an empty `concepts` list, same honest `nodes` outline as before —
// never fabricated, never a blank crash.
//
// AI Learning Studio™ Sprint ALS-17 — the inline heading fallback was
// extracted into shared `resolveChunkHeading.ts` (reused by MCQs™'s own
// real structural questions) — zero behavior change here.
export function generateMindMapOutline(ulo: UniversalLearningObject): MindMapOutline {
  const sortedChunks = [...ulo.knowledge.chunks].sort((a, b) => a.location.order - b.location.order)
  const chunkById = new Map(sortedChunks.map((chunk) => [chunk.id, chunk]))

  const nodes = sortedChunks.map((chunk) => ({
    id: chunk.id,
    title: resolveChunkHeading(chunk),
    order: chunk.location.order,
  }))

  const concepts = ulo.knowledge.graph.nodes
    .filter((node): node is Extract<typeof node, { type: 'concept' }> => node.type === 'concept')
    .sort((a, b) => b.occurrenceCount - a.occurrenceCount)
    .map((concept) => ({
      id: concept.id,
      label: concept.label,
      occurrenceCount: concept.occurrenceCount,
      relatedChunkTitles: concept.chunkIds.map((chunkId) => {
        const chunk = chunkById.get(chunkId)
        return chunk ? resolveChunkHeading(chunk) : null
      }).filter((title): title is string => title !== null),
    }))

  return {
    documentId: ulo.documentId,
    documentTitle: ulo.knowledge.document.title,
    nodes,
    concepts,
  }
}
