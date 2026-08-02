import type { DocumentSummary } from './summary'
import type { Concept } from './concept'
import type { Flashcard } from './flashcard'
import type { QuizQuestion } from './quizQuestion'
import type { MindMapNode } from './mindMapNode'
import type { PracticeQuestion } from './practiceQuestion'
import type { RevisionBlock } from './revisionBlock'
import type { TeachingOutline } from './teachingOutline'

// The eight kinds of content the engine can produce. Adding a ninth
// kind is additive: a new union member plus a new generator, never a
// change to LearningObject itself — same extensibility rule already
// used for LearningSessionType (see
// docs/adr/0001-ai-learning-studio-domain-model.md §2).
export type LearningObjectType = 'summary' | 'concept' | 'flashcard' | 'quiz-question' | 'mind-map-node' | 'practice-question' | 'revision-block' | 'teaching-outline'

// Maps each LearningObjectType to its own payload shape — lets
// `LearningObject<T>` stay one generic envelope (mirroring
// LearningSession<TData>'s existing pattern) while still being fully
// typed at every call site via `LearningObject<'flashcard'>` etc.
export type LearningObjectDataByType = {
  summary: DocumentSummary
  concept: Concept
  flashcard: Flashcard
  'quiz-question': QuizQuestion
  'mind-map-node': MindMapNode
  'practice-question': PracticeQuestion
  'revision-block': RevisionBlock
  'teaching-outline': TeachingOutline
}

// One generic envelope for every kind of generated content, rather
// than eight near-identical wrapper types — the same shape the
// existing domain model already chose for LearningSession<TData>.
export type LearningObject<TType extends LearningObjectType = LearningObjectType> = {
  id: string
  documentId: string
  objectType: TType
  data: LearningObjectDataByType[TType]
  createdAt: string
}
