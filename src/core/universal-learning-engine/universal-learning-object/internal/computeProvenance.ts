import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import type { LearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import type { ULOProvenance } from '../types/ULOProvenance'

// Universal Learning Object™ (UCE-6). Pure. Every id here is read
// directly off the real input objects — never generated, never guessed.
export function computeProvenance(document: UniversalLearningDocument, chunks: readonly LearningChunk[], graph: LearningKnowledgeGraph, analysis: LearningAnalysis): ULOProvenance {
  return {
    documentId: document.id,
    sourceId: document.source.id,
    chunkIds: chunks.map((chunk) => chunk.id),
    graphId: graph.id,
    analysisId: analysis.id,
  }
}
