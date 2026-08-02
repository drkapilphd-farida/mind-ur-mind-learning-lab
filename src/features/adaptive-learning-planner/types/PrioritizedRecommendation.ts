import type { SkillArea } from './SkillArea'

// The Recommendation Prioritizer's™ output — the "Priority Skills" in
// the final plan, ranked 1 (highest priority) upward.
export type PrioritizedRecommendation = {
  skill: SkillArea
  rank: number
  gapScore: number
}
