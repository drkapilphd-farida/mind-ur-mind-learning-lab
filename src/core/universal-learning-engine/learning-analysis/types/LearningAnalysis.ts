import type { ChunkAnalysis } from './ChunkAnalysis'
import type { ConceptAnalysis } from './ConceptAnalysis'
import type { PrerequisiteValidation } from './PrerequisiteValidation'
import type { LearningMilestone } from './LearningMilestone'

// Real versioning envelope — identical pattern to LearningChunk's
// ChunkVersion and the Learning Knowledge Graph's GraphVersion.
export type AnalysisVersion = {
  schemaVersion: string
  revision: number
}

// Learning Analysis™ — the canonical output of UCE-5. A fully separate,
// additive artifact: it references the source document, chunks, and
// knowledge graph by id, but never modifies any of them (mirrors UCE-4's
// own "Never Modify" discipline — see docs/PRODUCTION_HANDOFF_UCE_5.md).
// Immutable once built; a re-analysis produces a new object via
// updateLearningAnalysis.ts, never an in-place mutation. `graphId`
// provides real traceability back to the exact `LearningKnowledgeGraph`
// this analysis was computed from — a future re-analysis against a
// different graph revision is a genuinely different, traceable
// `LearningAnalysis`.
export type LearningAnalysis = {
  id: string
  documentId: string
  graphId: string
  version: AnalysisVersion
  chunkAnalyses: readonly ChunkAnalysis[]
  conceptAnalyses: readonly ConceptAnalysis[]
  // Real topological order over the prerequisite/depends-on/builds-upon
  // edge subgraph — concept node ids. Concepts involved in a real
  // detected cycle are excluded (see `prerequisiteValidation`).
  recommendedLearningOrder: readonly string[]
  prerequisiteValidation: PrerequisiteValidation
  learningMilestones: readonly LearningMilestone[]
  createdAt: string
  lastModifiedAt: string
}
