import type { MentorActivitySnapshot, MentorInsight, MentorRecommendation } from '../types'

// Implemented by a deterministic mock in Chunk 2. Reads the other six
// analyzers' output (`insights`) alongside the raw snapshot — the
// "second-order" generator pattern already used in
// `@/features/learning-intelligence/generators` (generateStudyModesDataset,
// generateLearningJourney), applied here: recommendations are derived
// from what was already analyzed, not from the snapshot alone.
export interface RecommendationEngine {
  recommend(snapshot: MentorActivitySnapshot, insights: readonly MentorInsight[]): Promise<readonly MentorRecommendation[]>
}
