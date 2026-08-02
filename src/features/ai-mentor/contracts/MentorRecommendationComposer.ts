import type { MentorActivitySnapshot, MentorInsight, MentorRecommendation } from '../types'

// Wraps Chunk 2's RecommendationEngine (already a "second-order"
// analyzer reading `insights`) at the integration layer — the seam
// where UI-facing concerns like priority ordering belong, without
// touching Chunk 2's own analyzer.
export interface MentorRecommendationComposer {
  compose(snapshot: MentorActivitySnapshot, insights: readonly MentorInsight[]): Promise<readonly MentorRecommendation[]>
}
