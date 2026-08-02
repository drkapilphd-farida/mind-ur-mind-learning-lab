import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import type { LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import type { LearningAnalysisOptions } from './types/LearningAnalysisOptions'
import type { LearningAnalysis } from './types/LearningAnalysis'
import type { AIRefinedStrategy, ConceptAnalysis } from './types/ConceptAnalysis'
import { computeDeterministicAnalysis } from './internal/computeDeterministicAnalysis'
import { computeAIRefinedStrategy } from './buildLearningAnalysis'

// AI Learning Analysis Engine™ (UCE-5). Real incremental update: every
// deterministic output (all 18 brief-listed outputs except
// `aiRefinedStrategy`) is cheaply, fully recomputed from the current
// chunks/graph via the same shared internal/computeDeterministicAnalysis.ts
// both this function and buildLearningAnalysis.ts call — honest, not a
// shortcut, since these are corpus-wide/graph-wide aggregates that need
// full input regardless (identical disclosed reasoning to
// updateLearningKnowledgeGraph.ts).
//
// The REAL "Incremental analysis... Partial re-analysis... Resume after
// interruption" savings is in the one genuinely expensive part: real
// AI-refined strategy text is REUSED verbatim from `existingAnalysis`
// for any core concept not named in `updatedConceptNodeIds` —
// `AIFoundation.execute()` only runs again for concepts that actually
// changed (or are newly core, or never got real strategy text before).
// "Resume after interruption" = calling this again with the same
// `updatedConceptNodeIds` — a concept that already has real
// `aiRefinedStrategy` text from a completed prior call is reused, not
// re-requested, even if the same concept id is listed again.
export async function updateLearningAnalysis(
  existingAnalysis: LearningAnalysis,
  chunks: readonly LearningChunk[],
  graph: LearningKnowledgeGraph,
  updatedConceptNodeIds: readonly string[],
  document: UniversalLearningDocument,
  options: LearningAnalysisOptions = {},
): Promise<LearningAnalysis> {
  const now = options.now ?? (() => new Date())
  const updatedSet = new Set(updatedConceptNodeIds)

  const deterministic = computeDeterministicAnalysis(chunks, graph)
  const chunkById = new Map(chunks.map((chunk) => [chunk.id, chunk]))
  const conceptNodeById = new Map(graph.nodes.filter((node) => node.type === 'concept').map((node) => [node.id, node]))
  const existingByConceptId = new Map(existingAnalysis.conceptAnalyses.map((analysis) => [analysis.conceptNodeId, analysis]))

  const conceptAnalyses: ConceptAnalysis[] = []
  for (const base of deterministic.conceptAnalysesBase) {
    let aiRefinedStrategy: AIRefinedStrategy | undefined

    if (base.conceptRole === 'core') {
      const isChanged = updatedSet.has(base.conceptNodeId)
      const existingStrategy = existingByConceptId.get(base.conceptNodeId)?.aiRefinedStrategy

      if (!isChanged && existingStrategy) {
        aiRefinedStrategy = existingStrategy
      } else if (options.aiFoundation) {
        const node = conceptNodeById.get(base.conceptNodeId)
        const supportingContents = (node?.type === 'concept' ? node.chunkIds : []).map((chunkId) => chunkById.get(chunkId)?.content).filter((content): content is string => content !== undefined)
        const label = node?.type === 'concept' ? node.label : base.conceptNodeId
        aiRefinedStrategy = await computeAIRefinedStrategy(label, supportingContents, options.aiFoundation, `${base.conceptNodeId}-strategy`)
      }
    }

    conceptAnalyses.push({ ...base, ...(aiRefinedStrategy ? { aiRefinedStrategy } : {}) })
  }

  const nowIso = now().toISOString()

  return {
    id: existingAnalysis.id,
    documentId: document.id,
    graphId: graph.id,
    version: { ...existingAnalysis.version, revision: existingAnalysis.version.revision + 1 },
    chunkAnalyses: deterministic.chunkAnalyses,
    conceptAnalyses,
    recommendedLearningOrder: deterministic.recommendedLearningOrder,
    prerequisiteValidation: deterministic.prerequisiteValidation,
    learningMilestones: deterministic.learningMilestones,
    createdAt: existingAnalysis.createdAt,
    lastModifiedAt: nowIso,
  }
}
