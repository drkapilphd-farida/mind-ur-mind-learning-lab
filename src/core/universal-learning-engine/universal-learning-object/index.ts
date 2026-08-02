// Universal Learning Intelligence Engine™ (ULIE™) — Universal Learning
// Object™ Engine (UCE-6). "Every future feature consumes the ULO.
// Nothing consumes lower layers directly." This is that one import path:
// it re-exports every consumer-facing type from the engines it
// aggregates (learning-chunk, knowledge-graph, learning-analysis) so a
// future Quantum Speed Reading™/Memory Mode™/Smart Notes™/Mind Map™/
// Flashcards™/MCQs™/Revision™/Research™/AI Mentor™/Learning Session
// Engine™ never needs to import those engines itself — only this
// barrel. See docs/PRODUCTION_HANDOFF_UCE_6.md's "Future Consumer
// Architecture" for how each one would use it.

export { buildUniversalLearningObject } from './buildUniversalLearningObject'
export type { ULOBuildOptions } from './buildUniversalLearningObject'
export { updateUniversalLearningObject } from './updateUniversalLearningObject'
export type { ULOUpdateOptions } from './updateUniversalLearningObject'
export { createUniversalLearningObjectCache } from './cache/createUniversalLearningObjectCache'
export type { UniversalLearningObjectCache } from './cache/createUniversalLearningObjectCache'

// This engine's own real types.
export type {
  ULOVersion,
  ULOAuditActor,
  ULOAuditEntry,
  ULOAudit,
  ULOProvenance,
  KnowledgeIntelligence,
  RevisionBlueprintEntry,
  RevisionBlueprint,
  MemoryBlueprintEntry,
  MemoryBlueprint,
  PracticeBlueprintEntry,
  PracticeBlueprint,
  LearningIntelligence,
  LearningJourneyStep,
  LearningJourney,
  FocusLevel,
  AttentionBlueprintEntry,
  AttentionBlueprint,
  SessionType,
  SessionRecommendation,
  ExperienceIntelligence,
  LearningTransformationState,
  MasteryLevel,
  ProgressBlueprint,
  LearningProof,
  TransformationEvidence,
  MotivationHookType,
  MotivationHook,
  SessionBlueprint,
  UniversalLearningObject,
} from './types'

// Re-exported consumer-facing types from every aggregated engine — "no
// consumer accesses lower-level engines directly." Reused verbatim,
// never redefined.
export type {
  LearningChunk,
  ChunkStatus,
  ChunkVersion,
  ChunkMetadata,
  ChunkSource,
  ChunkLocation,
  ChunkStatistics,
  ChunkReadingMetrics,
  ChunkRelationshipType,
  ChunkRelationship,
  ChunkHierarchy,
  ChunkConfidence,
  ChunkAudit,
  ChunkMedia,
  ChunkTable,
  ChunkFormula,
  ChunkCode,
  ChunkCitation,
  ChunkLanguage,
  ChunkAccessibility,
  ChunkTags,
  ChunkExtensions,
  ChunkDifficulty,
  ChunkDefinition,
  ChunkEnrichment,
} from '@/core/universal-learning-engine/learning-chunk'

export type {
  GraphNodeType,
  ChunkGraphNode,
  ConceptGraphNode,
  GraphNode,
  GraphEdgeType,
  GraphEdgeDirection,
  GraphEdgeOrigin,
  GraphEdge,
  GraphVersion,
  LearningKnowledgeGraph,
  ConceptRole,
  GraphLearningMetadata,
  GraphAssessmentSignals,
} from '@/core/universal-learning-engine/knowledge-graph'
export { createGraphIndex } from '@/core/universal-learning-engine/knowledge-graph'
export type { GraphIndex, TraversalDirection } from '@/core/universal-learning-engine/knowledge-graph'

export type {
  ReadingStrategy,
  ChunkAnalysis,
  RevisionStrategy,
  PracticeStrategy,
  AIRefinedStrategy,
  ConceptAnalysis,
  PrerequisiteValidationIssueType,
  PrerequisiteValidationIssue,
  PrerequisiteValidation,
  LearningMilestone,
  AnalysisVersion,
  LearningAnalysis,
  PersonalizationContext,
} from '@/core/universal-learning-engine/learning-analysis'

export type { UniversalLearningDocument, LearningSection, LearningContentBlock } from '@/core/universal-learning-engine/extraction'
