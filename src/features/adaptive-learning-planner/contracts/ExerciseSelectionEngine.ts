import type { DifficultyLevel, ExerciseRecommendation, SkillGap } from '../types'

export interface ExerciseSelectionEngine {
  selectExercises(skillGaps: readonly SkillGap[], difficulty: DifficultyLevel): readonly ExerciseRecommendation[]
}
