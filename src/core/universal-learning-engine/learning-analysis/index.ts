// Universal Learning Intelligence Engine™ (ULIE™) — AI Learning Analysis
// Engine™ (UCE-5). The one import path every downstream engine (UCE-6
// onward) uses — never import from types/internal directly.

export { buildLearningAnalysis } from './buildLearningAnalysis'
export { updateLearningAnalysis } from './updateLearningAnalysis'

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
  LearningAnalysisOptions,
} from './types'
