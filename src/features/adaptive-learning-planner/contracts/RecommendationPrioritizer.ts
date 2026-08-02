import type { PrioritizedRecommendation, SkillGap } from '../types'

// Ranks skill gaps highest-gap-first, rank 1 = highest priority.
export interface RecommendationPrioritizer {
  prioritize(skillGaps: readonly SkillGap[]): readonly PrioritizedRecommendation[]
}
