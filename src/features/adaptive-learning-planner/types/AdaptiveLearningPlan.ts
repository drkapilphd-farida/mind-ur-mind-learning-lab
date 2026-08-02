import type { DifficultyLevel } from './DifficultyLevel'
import type { ExerciseRecommendation } from './ExerciseRecommendation'
import type { LearningMilestone } from './LearningMilestone'
import type { PrioritizedRecommendation } from './PrioritizedRecommendation'
import type { SkillArea } from './SkillArea'
import type { WeeklySchedule } from './WeeklySchedule'

// The whole pipeline's single output — "LearningPlan™" in the Sprint 9
// brief, named AdaptiveLearningPlan here to avoid any ambiguity with
// `@/features/learning-intelligence/types`'s own, unrelated
// `LearningPlan` (Sprint 3, a document-derived study-materials bundle —
// summary/concepts/flashcards/quizQuestions/... — a completely
// different concept that happens to share a name). Every field maps
// 1:1 to the Sprint 9 brief's own OUTPUT list.
export type AdaptiveLearningPlan = {
  recommendedJourney: string
  recommendedExercises: readonly ExerciseRecommendation[]
  dailyDurationMinutes: number
  weeklySchedule: WeeklySchedule
  prioritySkills: readonly PrioritizedRecommendation[]
  difficultyLevel: DifficultyLevel
  learningMilestones: readonly LearningMilestone[]
  suggestedMentorFocus: SkillArea
}
