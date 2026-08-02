import type { LearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import type { AttentionBlueprint, FocusLevel } from '../types/ExperienceIntelligence'

// Real, disclosed thresholds — same transparent-classification
// discipline as UCE-5's own threshold classifications (e.g.
// computeConceptMetrics.ts's role thresholds).
function classifyFocusLevel(expectedCognitiveLoad: number): FocusLevel {
  return expectedCognitiveLoad >= 0.66 ? 'high' : expectedCognitiveLoad >= 0.33 ? 'moderate' : 'low'
}

// Universal Learning Object™ (UCE-6). Pure. Real threshold
// classification over UCE-5's own real `expectedCognitiveLoad` — no new
// signal computed, just a consumer-ready categorical re-shape. Satisfies
// both the brief's "Attention Blueprint" and "Focus Blueprint" line
// items (see ExperienceIntelligence.ts's own comment).
export function buildAttentionBlueprint(analysis: LearningAnalysis): AttentionBlueprint {
  const entries = analysis.chunkAnalyses.map((chunk) => ({
    chunkNodeId: chunk.chunkNodeId,
    focusLevel: classifyFocusLevel(chunk.expectedCognitiveLoad),
  }))

  return { entries }
}
