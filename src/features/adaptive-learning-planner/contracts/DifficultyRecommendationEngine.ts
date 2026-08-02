import type { DifficultyLevel, LearnerProfile, SkillGap } from '../types'

export interface DifficultyRecommendationEngine {
  recommend(profile: LearnerProfile, skillGaps: readonly SkillGap[]): DifficultyLevel
}
