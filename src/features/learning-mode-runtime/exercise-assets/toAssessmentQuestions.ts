import type { AssessmentQuestion } from '@/features/quantum-speed-reading-runtime/assessment/questions/AssessmentQuestion'
import type { AssessmentExerciseAsset } from '@/core/universal-learning-engine/exercise-asset-builder'

// Reading Intelligence Engine™ Upgrade — Sprint QSR-1: Exercise Asset
// Builder™ (Tier-1) — Registration. Reshapes an AssessmentExerciseAsset
// (options: string[] + correctIndex, the neutral Exercise Asset shape)
// into the real AssessmentQuestion the existing Reading Assessment
// Engine™ (ReadingAssessmentFlow / AssessmentQuestionScreen) already
// consumes (options: {value, isCorrect}[]) — a Map only, no new
// question-building logic, no change to either component.
//
// Every AssessmentExerciseAsset produced by Tier-1 carries
// questionKind: 'definition' — the AssessmentQuestionType union has no
// literal by that name, since every one of this codebase's own real
// question builders already groups a definition MCQ under
// 'multiple-choice' by shape (a term + one correct definition +
// distractors). No other AssessmentQuestionType is ever produced by
// this adapter — it would require a source questionKind this Builder
// doesn't generate yet.
export function toAssessmentQuestions(assets: readonly AssessmentExerciseAsset[]): readonly AssessmentQuestion[] {
  return assets.map((asset) => ({
    type: 'multiple-choice',
    prompt: asset.prompt,
    options: asset.options.map((value, index) => ({ value, isCorrect: index === asset.correctIndex })),
  }))
}
