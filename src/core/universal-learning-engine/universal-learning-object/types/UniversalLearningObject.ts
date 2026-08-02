import type { LearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import type { ULOVersion } from './ULOVersion'
import type { ULOAudit } from './ULOAudit'
import type { KnowledgeIntelligence } from './KnowledgeIntelligence'
import type { LearningIntelligence } from './LearningIntelligence'
import type { ExperienceIntelligence } from './ExperienceIntelligence'

// Universal Learning Object™ — the canonical output of UCE-6 and the
// SINGLE SOURCE OF TRUTH every future Learning Mode consumes. Aggregates
// every completed intelligence layer (document, chunks, semantic
// enrichment [already on `chunks`], knowledge graph, learning analysis)
// by real composition — never redefines or copies any upstream field.
// Immutable once built: `buildUniversalLearningObject` always produces a
// brand-new object; a re-aggregation produces a NEW ULO via
// `updateUniversalLearningObject`, never an in-place mutation. UCE-6
// itself computes zero new AI-derived content — every field is either a
// real embedded upstream object or a real, disclosed, deterministic
// re-shape of one (a sort, a sum, a threshold classification).
//
// `analysis` (UCE-5's full `LearningAnalysis`) is embedded directly here
// rather than under `knowledge` — a consumer reaches every real UCE-5
// field (`recommendedLearningOrder`, `conceptAnalyses[].learningPriority`,
// `chunkAnalyses[].suggestedReadingStrategy`, ...) through this one
// field; `learning`/`experience` below only add genuine transformations
// on top of it, never a duplicate copy.
export type UniversalLearningObject = {
  id: string
  documentId: string
  version: ULOVersion
  knowledge: KnowledgeIntelligence
  analysis: LearningAnalysis
  learning: LearningIntelligence
  experience: ExperienceIntelligence
  audit: ULOAudit
  createdAt: string
  lastModifiedAt: string
}
