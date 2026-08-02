import type { LearningObjectType } from './learningObject'

// One entry per LearningObjectType, reporting what this specific
// LearningPlan actually has — never assumed "all eight always ready."
// Chunk 3 only generates flashcard/quiz-question/practice-question/
// revision-block content (plus concept, already produced in Chunk 2);
// summary/mind-map-node/teaching-outline honestly report
// isAvailable: false, itemCount: 0 until a future chunk builds those
// generators — the same "never fake completeness" rule Sprint 1/2 held
// for Memory Score/Understanding Score, applied at the data-model level
// here instead of only in UI copy.
export type StudyModeAvailability = {
  objectType: LearningObjectType
  isAvailable: boolean
  itemCount: number
}

export type StudyModesDataset = readonly StudyModeAvailability[]
