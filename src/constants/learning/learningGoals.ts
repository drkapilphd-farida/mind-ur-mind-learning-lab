// Sprint LW-1A — Learning Goal™ (Screen 2 of the arrival flow). The 6 fixed,
// single-select goal options, following the exact existing pattern of
// studyModes.ts's StudyModeDefinition. Distinct from, but a natural future
// feed into, the free-text `learningGoal: string | null` already used by
// src/features/ai-intelligence-layer/types/UserContext.ts and the
// `LearningGoalAnalyzer` in src/features/adaptive-learning-planner/ — no
// type collision (different layer, free text vs. this fixed enum), but a
// deliberate LW-1C/D hook: the id selected here could eventually populate
// that existing field.

export type LearningGoalId = 'exam-preparation' | 'professional-study' | 'remember-better' | 'read-faster' | 'learn-from-documents' | 'something-else'

export type LearningGoalDefinition = {
  id: LearningGoalId
  emoji: string
  label: string
}

export const LEARNING_GOALS: readonly LearningGoalDefinition[] = [
  { id: 'exam-preparation', emoji: '📚', label: 'Exam Preparation' },
  { id: 'professional-study', emoji: '💼', label: 'Professional Study' },
  { id: 'remember-better', emoji: '🧠', label: 'Remember Better' },
  { id: 'read-faster', emoji: '⚡', label: 'Read Faster' },
  { id: 'learn-from-documents', emoji: '📄', label: 'Learn from My Documents' },
  { id: 'something-else', emoji: '✍️', label: 'Something Else (Tell AI)' },
] as const
