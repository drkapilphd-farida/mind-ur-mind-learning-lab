import type { AdaptiveRecommendation } from './adaptiveRecommendation'
import type { Concept } from './concept'
import type { Flashcard } from './flashcard'
import type { LearningObjectType } from './learningObject'
import type { MindMapNode } from './mindMapNode'
import type { PracticeQuestion } from './practiceQuestion'
import type { QuizQuestion } from './quizQuestion'
import type { RevisionBlock } from './revisionBlock'
import type { DocumentSummary } from './summary'
import type { TeachingOutline } from './teachingOutline'

// The pipeline's "Blueprint" stage output — the fully assembled result
// of Document → Extracted Content → Concept Graph → Learning Objects.
// Deliberately its own type, not an alias for
// `@/types/learning/blueprint`'s `LearningBlueprint`: that type is
// shaped for Sprint 1/2's specific page rendering (badges, card
// layouts); this one is the engine's general-purpose domain output. A
// future sprint that wires this engine into the Blueprint page would
// add a small adapter that maps LearningPlan → LearningBlueprint —
// this sprint does not build that adapter or touch that page.
export type LearningPlan = {
  documentId: string
  summary: DocumentSummary
  concepts: readonly Concept[]
  flashcards: readonly Flashcard[]
  quizQuestions: readonly QuizQuestion[]
  mindMapNodes: readonly MindMapNode[]
  practiceQuestions: readonly PracticeQuestion[]
  revisionBlocks: readonly RevisionBlock[]
  teachingOutline: TeachingOutline
  // "Study Modes" pipeline stage: which object types this plan has
  // content for. Trivially "all eight" today (every generator always
  // runs), but kept as real data rather than assumed, since a future
  // real engine could produce a plan missing some object types.
  availableStudyModes: readonly LearningObjectType[]
  // "Adaptive Recommendations" pipeline stage.
  recommendations: readonly AdaptiveRecommendation[]
}
