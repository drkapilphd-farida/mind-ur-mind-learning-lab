import type { LearningChunk, ChunkDifficulty } from '@/core/universal-learning-engine/learning-chunk'
import type { LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import type { LearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import type { BlueprintLearningObject } from '../types/BlueprintLearningObject'
import { conceptNodesForChunk, isConceptNode, normalizeForMatching } from './graphHelpers'

function dedupe(values: readonly string[]): readonly string[] {
  return [...new Set(values)]
}

// Section 3 — the heart of the Blueprint. One `BlueprintLearningObject`
// per real concept introduced in this chapter, rolling up
// `definitions`/`examples`/`misconceptions` from EVERY chunk that
// mentions the concept (via the already-real `ConceptGraphNode.chunkIds`)
// — not just this one chunk, since a concept's best definition may live
// in a different chapter. `explanation` is left `null` here — it's the
// one field the new AI call fills in afterward (see
// buildChapterIntelligenceBlueprint.ts). Zero new AI in this function.
export function aggregateLearningObjects(chunk: LearningChunk, allChunks: readonly LearningChunk[], graph: LearningKnowledgeGraph, analysis: LearningAnalysis): BlueprintLearningObject[] {
  const chunkById = new Map(allChunks.map((entry) => [entry.id, entry]))
  const conceptAnalysisByNodeId = new Map(analysis.conceptAnalyses.map((entry) => [entry.conceptNodeId, entry]))
  const allConceptNodeIds = new Set(graph.nodes.filter(isConceptNode).map((node) => node.id))

  const chapterConceptNodes = conceptNodesForChunk(graph.nodes, chunk.id)

  return chapterConceptNodes.map((node) => {
    const relatedChunks = node.chunkIds.map((id) => chunkById.get(id)).filter((entry): entry is LearningChunk => entry !== undefined)
    const normalizedLabel = normalizeForMatching(node.label)

    const definition = relatedChunks.flatMap((entry) => entry.enrichment.definitions ?? []).find((entry) => normalizeForMatching(entry.term) === normalizedLabel)?.definition ?? null

    const examples = dedupe(relatedChunks.flatMap((entry) => entry.enrichment.examples ?? []))
    const misconceptions = dedupe(relatedChunks.flatMap((entry) => entry.enrichment.misconceptions ?? []))
    const difficulty = relatedChunks.map((entry) => entry.enrichment.difficulty).find((value): value is ChunkDifficulty => value !== undefined) ?? null

    const relatedObjects = dedupe(
      graph.edges
        .filter((edge) => edge.sourceNodeId === node.id || edge.targetNodeId === node.id)
        .map((edge) => (edge.sourceNodeId === node.id ? edge.targetNodeId : edge.sourceNodeId))
        .filter((relatedId) => allConceptNodeIds.has(relatedId) && relatedId !== node.id),
    )

    const conceptAnalysis = conceptAnalysisByNodeId.get(node.id)

    const object: BlueprintLearningObject = {
      objectId: node.id,
      title: node.label,
      type: 'concept',
      importance: conceptAnalysis?.importance ?? 0,
      difficulty,
      explanation: null,
      definition,
      examples,
      misconceptions,
      relatedObjects,
    }
    return object
  })
}
