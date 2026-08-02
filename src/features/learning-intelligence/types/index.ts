// Learning Intelligence Engine™ domain types (Sprint 3). One canonical
// location per type — every other file in this feature (and any future
// consumer) imports from here, never redefines. See learningPlan.ts's
// own header comment for why this is a deliberately separate model
// from Sprint 1/2's `@/types/learning/blueprint`.

export type { Document, DocumentStatus } from './document'
export type { Concept } from './concept'
export type { Flashcard } from './flashcard'
export type { QuizQuestion, QuizQuestionOption } from './quizQuestion'
export type { MindMapNode } from './mindMapNode'
export type { PracticeQuestion } from './practiceQuestion'
export type { RevisionBlock } from './revisionBlock'
export type { TeachingOutline, TeachingOutlineSection } from './teachingOutline'
export type { DocumentSummary } from './summary'
export type { ExtractedContent, ExtractedContentSection } from './extractedContent'
export type { ConceptGraph, ConceptGraphEdge } from './conceptGraph'
export type { LearningObject, LearningObjectType, LearningObjectDataByType } from './learningObject'
export type { AdaptiveRecommendation } from './adaptiveRecommendation'
export type { LearningPlan } from './learningPlan'

// Sprint 3, Chunk 3 additions — additive only, nothing above this line changed.
export type { ConceptSequence } from './conceptSequence'
export type { StudyModeAvailability, StudyModesDataset } from './studyModeAvailability'
export type { LearningJourneyStep, LearningJourney } from './learningJourney'
