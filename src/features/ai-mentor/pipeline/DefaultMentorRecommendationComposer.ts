import { createRecommendationEngine } from '../analyzers'
import type { MentorRecommendationComposer, RecommendationEngine } from '../contracts'
import type { MentorActivitySnapshot, MentorInsight, MentorRecommendation, MentorRecommendationPriority } from '../types'

export type MentorRecommendationComposerDependencies = {
  recommendationEngine: RecommendationEngine
}

// Highest priority first — a real, integration-layer concern (a future
// UI wants the most important recommendation surfaced first) that
// doesn't belong inside Chunk 2's RecommendationEngine itself, which
// only decides *what* to recommend, not display order.
const PRIORITY_ORDER: Record<MentorRecommendationPriority, number> = { high: 0, medium: 1, low: 2 }

// Implements MentorRecommendationComposer — wraps Chunk 2's
// RecommendationEngine (unmodified) and sorts its output by priority.
export class DefaultMentorRecommendationComposer implements MentorRecommendationComposer {
  constructor(private readonly deps: MentorRecommendationComposerDependencies) {}

  async compose(snapshot: MentorActivitySnapshot, insights: readonly MentorInsight[]): Promise<readonly MentorRecommendation[]> {
    const recommendations = await this.deps.recommendationEngine.recommend(snapshot, insights)
    return [...recommendations].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
  }
}

export function createMentorRecommendationComposer(overrides: Partial<MentorRecommendationComposerDependencies> = {}): MentorRecommendationComposer {
  const deps: MentorRecommendationComposerDependencies = {
    recommendationEngine: createRecommendationEngine(),
    ...overrides,
  }
  return new DefaultMentorRecommendationComposer(deps)
}
