// Deliberately its own model, not an alias for
// `@/features/learning-intelligence/types`'s `AdaptiveRecommendation`
// — that type describes which *study mode* to try next; a
// MentorRecommendation is broader (pacing, motivation, review timing)
// and mentor-voiced. Chunk 4 is where the two get bridged explicitly;
// this chunk stays self-contained.
export type MentorRecommendationCategory = 'next-step' | 'review' | 'practice' | 'pacing' | 'motivation'

export type MentorRecommendationPriority = 'low' | 'medium' | 'high'

export type MentorRecommendation = {
  id: string
  category: MentorRecommendationCategory
  priority: MentorRecommendationPriority
  title: string
  description: string
}
