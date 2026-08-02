import { runWithConcurrency, withExecuteTimeout } from '@/core/ai-foundation'
import type { AIFoundation } from '@/core/ai-foundation'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import type { LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import type { LearningAnalysisOptions } from './types/LearningAnalysisOptions'
import type { LearningAnalysis } from './types/LearningAnalysis'
import type { AIRefinedStrategy, ConceptAnalysis } from './types/ConceptAnalysis'
import { computeDeterministicAnalysis } from './internal/computeDeterministicAnalysis'
import { buildStrategyPrompt } from './internal/buildStrategyPrompt'
import { parseStrategyResponse } from './internal/parseStrategyResponse'

// Production AI Integration — ALS-24. Matches Semantic Enrichment
// Engine™ (UCE-3B)'s own real-world-proven defaults exactly (concurrency
// 3, 30s per call) rather than inventing new numbers.
const DEFAULT_CONCURRENCY = 3
const DEFAULT_TIMEOUT_MS = 30_000

// The one AI-derived call this sprint — scoped to real 'core' concepts
// only (see the call site below). Never throws for an expected AI/parse
// failure: a failed AIFoundation call or an unparseable response simply
// means no `aiRefinedStrategy` for this concept, never a thrown error
// that would abort the whole analysis (same discipline as UCE-3B/UCE-4's
// AI-derived pieces). Exported so updateLearningAnalysis.ts calls the
// exact same real logic for a genuinely changed concept, rather than a
// second implementation that could drift.
export async function computeAIRefinedStrategy(conceptLabel: string, supportingContents: readonly string[], aiFoundation: Pick<AIFoundation, 'execute'>, requestId: string): Promise<AIRefinedStrategy | undefined> {
  const payload = buildStrategyPrompt(conceptLabel, supportingContents)
  const result = await withExecuteTimeout(aiFoundation.execute('difficulty-analysis', payload, requestId), 'difficulty-analysis', DEFAULT_TIMEOUT_MS, requestId)
  if (!result.success) return undefined
  return parseStrategyResponse(result.response.content)
}

// AI Learning Analysis Engine™ (UCE-5). Builds a fresh `LearningAnalysis`
// from real `LearningChunk`/`UniversalLearningDocument`/
// `LearningKnowledgeGraph` input — never modifies any of them. Every one
// of the 18 brief-listed outputs gets a real, computed value regardless
// of `options.aiFoundation` (see internal/computeDeterministicAnalysis.ts,
// the one shared implementation this function and
// updateLearningAnalysis.ts both call — "No duplicated analysis"); the
// one AI-derived piece (`aiRefinedStrategy`, core concepts only) is
// additive, never load-bearing for the rest of the analysis to be
// complete and useful.
export async function buildLearningAnalysis(
  chunks: readonly LearningChunk[],
  document: UniversalLearningDocument,
  graph: LearningKnowledgeGraph,
  options: LearningAnalysisOptions = {},
): Promise<LearningAnalysis> {
  const now = options.now ?? (() => new Date())
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())

  const deterministic = computeDeterministicAnalysis(chunks, graph)
  const chunkById = new Map(chunks.map((chunk) => [chunk.id, chunk]))
  const conceptNodeById = new Map(graph.nodes.filter((node) => node.type === 'concept').map((node) => [node.id, node]))

  // Production AI Integration — ALS-24. Every 'core' concept's AI call is
  // fully independent of every other's (no shared mutable state the way
  // `buildBuildsUponEdges` has), so this can be dispatched with the same
  // bounded concurrency + per-call timeout UCE-3B already uses, instead
  // of the previous one-at-a-time sequential loop — a document with many
  // core concepts no longer scales this stage's latency linearly.
  const aiFoundation = options.aiFoundation
  const refinedStrategies: (AIRefinedStrategy | undefined)[] = aiFoundation
    ? await runWithConcurrency(deterministic.conceptAnalysesBase, DEFAULT_CONCURRENCY, (base) => {
        if (base.conceptRole !== 'core') return Promise.resolve(undefined)
        const node = conceptNodeById.get(base.conceptNodeId)
        const supportingContents = (node && node.type === 'concept' ? node.chunkIds : []).map((chunkId) => chunkById.get(chunkId)?.content).filter((content): content is string => content !== undefined)
        const label = node?.type === 'concept' ? node.label : base.conceptNodeId
        return computeAIRefinedStrategy(label, supportingContents, aiFoundation, `${base.conceptNodeId}-strategy`)
      })
    : deterministic.conceptAnalysesBase.map(() => undefined)

  const conceptAnalyses: ConceptAnalysis[] = deterministic.conceptAnalysesBase.map((base, index) => {
    const aiRefinedStrategy = refinedStrategies[index]
    return { ...base, ...(aiRefinedStrategy ? { aiRefinedStrategy } : {}) }
  })

  const nowIso = now().toISOString()

  return {
    id: idFactory(),
    documentId: document.id,
    graphId: graph.id,
    version: { schemaVersion: '1.0.0', revision: 1 },
    chunkAnalyses: deterministic.chunkAnalyses,
    conceptAnalyses,
    recommendedLearningOrder: deterministic.recommendedLearningOrder,
    prerequisiteValidation: deterministic.prerequisiteValidation,
    learningMilestones: deterministic.learningMilestones,
    createdAt: nowIso,
    lastModifiedAt: nowIso,
  }
}
