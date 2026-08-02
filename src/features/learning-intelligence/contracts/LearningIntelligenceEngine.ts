import type { Document, LearningPlan } from '../types'

// The whole pipeline's own contract: Document in, LearningPlan out.
// `engine/createLearningIntelligenceEngine.ts` implements this by
// composing a ContentExtractor, a ConceptGraphBuilder, and all eight
// LearningObjectGenerators — every one of those is itself swapped in
// via this same dependency-inversion pattern, so a future real (AI-
// backed) engine is a new set of implementations wired into the same
// orchestrator shape, not a rewrite of anything that calls it.
export interface LearningIntelligenceEngine {
  generateLearningPlan(document: Document): Promise<LearningPlan>
}
