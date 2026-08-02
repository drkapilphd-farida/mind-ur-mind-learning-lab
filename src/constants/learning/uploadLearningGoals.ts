// AI Learning Studio™ V1 Launch UX Transformation — the Upload wizard's
// own "Learning Goal" question (Screen 4 of the locked flow), asked once
// per document, immediately after AI Detection. Deliberately a separate,
// smaller enum from `learningGoals.ts`'s own `LEARNING_GOALS` (the
// pre-upload arrival flow's 6-option goal, asked once per learner before
// any document exists) — different screen, different scope, no type
// collision intended.
export type UploadLearningGoalId = 'read-faster' | 'remember-longer' | 'deep-understanding' | 'exam-preparation'

export type UploadLearningGoalDefinition = {
  id: UploadLearningGoalId
  emoji: string
  label: string
}

export const UPLOAD_LEARNING_GOALS: readonly UploadLearningGoalDefinition[] = [
  { id: 'read-faster', emoji: '⚡', label: 'Read Faster' },
  { id: 'remember-longer', emoji: '🧠', label: 'Remember Longer' },
  { id: 'deep-understanding', emoji: '🔍', label: 'Deep Understanding' },
  { id: 'exam-preparation', emoji: '📚', label: 'Exam Preparation' },
] as const
