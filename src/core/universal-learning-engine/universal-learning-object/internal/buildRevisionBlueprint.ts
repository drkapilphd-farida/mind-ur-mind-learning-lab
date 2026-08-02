import type { LearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import type { RevisionBlueprint } from '../types/LearningIntelligence'

// Universal Learning Object™ (UCE-6). Pure. Real re-sort of UCE-5's own
// `conceptAnalyses` by real `revisionPriority`, descending — every value
// reused verbatim, nothing recomputed.
export function buildRevisionBlueprint(analysis: LearningAnalysis): RevisionBlueprint {
  const entries = [...analysis.conceptAnalyses]
    .sort((a, b) => b.revisionPriority - a.revisionPriority)
    .map((concept) => ({
      conceptNodeId: concept.conceptNodeId,
      revisionPriority: concept.revisionPriority,
      suggestedStrategy: concept.suggestedRevisionStrategy,
    }))

  return { entries }
}
