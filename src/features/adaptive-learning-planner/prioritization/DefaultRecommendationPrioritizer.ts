import type { PrioritizedRecommendation, SkillGap } from '../types'
import type { RecommendationPrioritizer } from '../contracts'

// Implements RecommendationPrioritizer. Ranks by gapScore descending —
// rank 1 is the single biggest gap. Ties keep the input order (a
// stable sort), never an arbitrary tiebreak.
export class DefaultRecommendationPrioritizer implements RecommendationPrioritizer {
  prioritize(skillGaps: readonly SkillGap[]): readonly PrioritizedRecommendation[] {
    return [...skillGaps]
      .map((gap, index) => ({ gap, index }))
      .sort((a, b) => b.gap.gapScore - a.gap.gapScore || a.index - b.index)
      .map(({ gap }, sortedIndex) => ({ skill: gap.skill, rank: sortedIndex + 1, gapScore: gap.gapScore }))
  }
}

export function createRecommendationPrioritizer(): RecommendationPrioritizer {
  return new DefaultRecommendationPrioritizer()
}
