import type { LearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import type { PracticeBlueprint } from '../types/LearningIntelligence'

// Universal Learning Object™ (UCE-6). Pure. Real re-sort of UCE-5's own
// `conceptAnalyses` by real `importance`, descending — the concepts most
// worth deliberate practice surfaced first.
export function buildPracticeBlueprint(analysis: LearningAnalysis): PracticeBlueprint {
  const entries = [...analysis.conceptAnalyses]
    .sort((a, b) => b.importance - a.importance)
    .map((concept) => ({
      conceptNodeId: concept.conceptNodeId,
      importance: concept.importance,
      suggestedStrategy: concept.suggestedPracticeStrategy,
    }))

  return { entries }
}
