import type { ConceptGraph, Flashcard, PracticeQuestion, QuizQuestion, RevisionBlock, StudyModesDataset } from '../types'

export type StudyModesDatasetInput = {
  conceptGraph: ConceptGraph
  flashcards: readonly Flashcard[]
  quizQuestions: readonly QuizQuestion[]
  practiceQuestions: readonly PracticeQuestion[]
  revisionBlocks: readonly RevisionBlock[]
}

// A "second-order" generator: unlike generateFlashcards/generateQuiz/
// generatePractice/generateRevision (which read the ConceptGraph
// directly), this one reads *their output* — it reports what a
// LearningPlan actually has, so it must run after them. Honestly
// reports summary/mind-map-node/teaching-outline as unavailable: no
// generator produces those yet (Chunk 3 only covers the five listed in
// this chunk's approved scope), and this dataset is exactly where that
// gap is meant to be visible rather than hidden.
export function generateStudyModesDataset(input: StudyModesDatasetInput): StudyModesDataset {
  return [
    { objectType: 'concept', isAvailable: input.conceptGraph.concepts.length > 0, itemCount: input.conceptGraph.concepts.length },
    { objectType: 'flashcard', isAvailable: input.flashcards.length > 0, itemCount: input.flashcards.length },
    { objectType: 'quiz-question', isAvailable: input.quizQuestions.length > 0, itemCount: input.quizQuestions.length },
    { objectType: 'practice-question', isAvailable: input.practiceQuestions.length > 0, itemCount: input.practiceQuestions.length },
    { objectType: 'revision-block', isAvailable: input.revisionBlocks.length > 0, itemCount: input.revisionBlocks.length },
    { objectType: 'summary', isAvailable: false, itemCount: 0 },
    { objectType: 'mind-map-node', isAvailable: false, itemCount: 0 },
    { objectType: 'teaching-outline', isAvailable: false, itemCount: 0 },
  ]
}
