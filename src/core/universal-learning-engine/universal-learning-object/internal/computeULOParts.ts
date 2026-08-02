import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import type { LearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import type { ULOProvenance } from '../types/ULOProvenance'
import type { LearningIntelligence } from '../types/LearningIntelligence'
import type { ExperienceIntelligence } from '../types/ExperienceIntelligence'
import { computeProvenance } from './computeProvenance'
import { buildRevisionBlueprint } from './buildRevisionBlueprint'
import { buildMemoryBlueprint } from './buildMemoryBlueprint'
import { buildPracticeBlueprint } from './buildPracticeBlueprint'
import { buildLearningJourney } from './buildLearningJourney'
import { buildAttentionBlueprint } from './buildAttentionBlueprint'
import { buildSessionRecommendations } from './buildSessionRecommendations'

export type ULOParts = {
  references: ULOProvenance
  learning: LearningIntelligence
  experience: ExperienceIntelligence
}

function computeEstimatedTotalLearningTimeSeconds(analysis: LearningAnalysis): number {
  return analysis.chunkAnalyses.reduce((sum, chunk) => sum + chunk.estimatedLearningTimeSeconds, 0)
}

function computeAverageCognitiveLoad(analysis: LearningAnalysis): number {
  if (analysis.chunkAnalyses.length === 0) return 0
  return analysis.chunkAnalyses.reduce((sum, chunk) => sum + chunk.expectedCognitiveLoad, 0) / analysis.chunkAnalyses.length
}

// Universal Learning Object™ (UCE-6). Pure, zero AI. The ONE shared
// implementation of every real, non-embedded ULO computation — both
// buildUniversalLearningObject.ts and updateUniversalLearningObject.ts
// call this, never duplicating the assembly logic (the concrete answer
// to "no duplicate intelligence").
export function computeULOParts(document: UniversalLearningDocument, chunks: readonly LearningChunk[], graph: LearningKnowledgeGraph, analysis: LearningAnalysis): ULOParts {
  const estimatedTotalLearningTimeSeconds = computeEstimatedTotalLearningTimeSeconds(analysis)

  return {
    references: computeProvenance(document, chunks, graph, analysis),
    learning: {
      revisionBlueprint: buildRevisionBlueprint(analysis),
      memoryBlueprint: buildMemoryBlueprint(analysis),
      practiceBlueprint: buildPracticeBlueprint(analysis),
      estimatedTotalLearningTimeSeconds,
      averageCognitiveLoad: computeAverageCognitiveLoad(analysis),
    },
    experience: {
      learningJourney: buildLearningJourney(analysis, graph),
      attentionBlueprint: buildAttentionBlueprint(analysis),
      sessionRecommendations: buildSessionRecommendations(estimatedTotalLearningTimeSeconds),
    },
  }
}
