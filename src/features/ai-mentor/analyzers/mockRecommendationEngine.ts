import type { RecommendationEngine } from '../contracts'
import type { MentorActivitySnapshot, MentorInsight, MentorRecommendation } from '../types'

// Implements RecommendationEngine — a "second-order" analyzer, the
// same pattern generateStudyModesDataset/generateLearningJourney used
// in `@/features/learning-intelligence/generators`: it reads the other
// six analyzers' output (`insights`) rather than the snapshot alone.
// Every weakness insight becomes a practice recommendation reusing
// that insight's own real `detail` text, never a separately-authored
// description that could drift out of sync.
export class MockRecommendationEngine implements RecommendationEngine {
  async recommend(snapshot: MentorActivitySnapshot, insights: readonly MentorInsight[]): Promise<readonly MentorRecommendation[]> {
    const recommendations: MentorRecommendation[] = []

    const weaknesses = insights.filter((insight) => insight.type === 'weakness')
    for (const weakness of weaknesses) {
      recommendations.push({
        id: `recommendation-practice-${weakness.id}`,
        category: 'practice',
        priority: 'high',
        title: 'Practice with active recall',
        description: weakness.detail,
      })
    }

    const conceptCount = snapshot.conceptsEncountered.length
    recommendations.push(
      snapshot.sessionCount === 0
        ? {
            id: `recommendation-next-step-${snapshot.learningProjectId}`,
            category: 'next-step',
            priority: 'high',
            title: 'Start your first study session',
            description: 'Begin with the Overview to get oriented before going deep into any one concept.',
          }
        : {
            id: `recommendation-next-step-${snapshot.learningProjectId}`,
            category: 'next-step',
            priority: 'medium',
            title: 'Continue where you left off',
            description: `You've encountered ${conceptCount} concept${conceptCount === 1 ? '' : 's'} so far — keep building on that.`,
          },
    )

    return recommendations
  }
}

export function createRecommendationEngine(): RecommendationEngine {
  return new MockRecommendationEngine()
}
