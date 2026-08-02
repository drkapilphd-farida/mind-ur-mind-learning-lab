import type { DifficultyLevel, LearnerProfile, SkillGap } from '../types'
import type { DifficultyRecommendationEngine } from '../contracts'
import { skillLevelAtIndex, skillLevelIndex } from '../skillLevelScore'

const HIGH_JOURNEY_PROGRESS_THRESHOLD = 80

// Implements DifficultyRecommendationEngine. Base difficulty is the
// *weakest* of the 3 skill levels — never push a learner into a
// difficulty their weakest area can't support, even if their strongest
// area is far ahead. If journeyProgressPercent is high (>=80%) at that
// level, bump one tier up — genuine mastery signal from real, given
// data, not an invented one.
export class DefaultDifficultyRecommendationEngine implements DifficultyRecommendationEngine {
  recommend(profile: LearnerProfile, skillGaps: readonly SkillGap[]): DifficultyLevel {
    if (skillGaps.length === 0) return 'beginner'

    const weakestIndex = skillGaps.reduce((minIndex, gap) => Math.min(minIndex, skillLevelIndex(gap.currentLevel)), skillLevelIndex('expert'))

    const bump = profile.journeyProgressPercent >= HIGH_JOURNEY_PROGRESS_THRESHOLD ? 1 : 0
    return skillLevelAtIndex(weakestIndex + bump)
  }
}

export function createDifficultyRecommendationEngine(): DifficultyRecommendationEngine {
  return new DefaultDifficultyRecommendationEngine()
}
